/**
 * Workflow Router Extension
 *
 * On new sessions, detects the current git branch, checks for existing
 * sessions, and routes to the appropriate workflow or resume prompt.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    // Only run for fresh sessions, not resumes or reloads
    if (_event.reason !== "startup" && _event.reason !== "new") return;
    if (!ctx.hasUI) return;

    const cwd = ctx.cwd;
    if (!existsSync(join(cwd, ".ai")) && !existsSync(join(cwd, "AGENTS.md"))) return;

    // --- Branch detection ---
    let branch = "";
    try {
      branch = execSync("git rev-parse --abbrev-ref HEAD", {
        cwd, encoding: "utf-8", timeout: 3000,
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
    } catch { return; }

    pi.setSessionName(branch);

    // --- Branch state check ---
    let hasUncommitted = false;
    let aheadCount = 0;
    let behindCount = 0;
    let upstreamBranch = "";
    try {
      const status = execSync("git status --porcelain", { cwd, encoding: "utf-8", timeout: 3000 });
      hasUncommitted = status.trim().length > 0;

      const upstream = execSync(
        "git rev-parse --abbrev-ref --symbolic-full-name @{upstream} 2>/dev/null || true",
        { cwd, encoding: "utf-8", timeout: 3000 },
      ).trim();
      if (upstream) {
        upstreamBranch = upstream.replace("refs/remotes/", "");
        const revList = execSync(
          `git rev-list --count --left-right ${upstream}...HEAD`,
          { cwd, encoding: "utf-8", timeout: 3000 },
        ).trim();
        const parts = revList.split("\t")[0]?.split(/\s+/) ?? [];
        behindCount = parseInt(parts[0] ?? "0");
        aheadCount = parseInt(parts[1] ?? "0");
      }
    } catch { /* non-fatal */ }

    // --- Existing session check ---
    const historyDir = join(cwd, ".ai", "history");
    let existingSession: string | null = null;
    if (existsSync(historyDir)) {
      existingSession = findSessionForBranch(historyDir, branch);
    }

    // --- Prompt logic ---
    const prefix = branch.split("/")[0];

    // If an existing session was found, offer to resume
    if (existingSession) {
      const resume = await ctx.ui.confirm(
        `Existing session for ${branch}`,
        `A previous agent session was found for this branch (${existingSession}). Would you like to resume it?\n\n` +
        `"No" will start fresh and you may lose context from the previous session.`,
      );
      if (resume) {
        ctx.ui.notify(`Resuming session: ${existingSession}`, "info");
        pi.sendUserMessage(
          `We're resuming work on \`${branch}\`. An existing session file was found at \`${existingSession}\`. ` +
          `Please read this file to understand where work was left off - reference the stage files at \`templates/stages/\` for the relevant workflow steps, review the current state of ` +
          `the branch (\`git log --oneline -10\`, \`git diff\`), check \`.ai/knowledge/\` for any ` +
          `relevant context, and present a summary to the user before continuing.`,
          { deliverAs: "steer" },
        );
        return;
      }
    }

    // Warn if branch isn't clean
    let stateWarnings: string[] = [];
    if (hasUncommitted) stateWarnings.push("uncommitted changes");
    if (behindCount > 0) stateWarnings.push(`${behindCount} commits behind ${upstreamBranch}`);
    if (aheadCount > 0) stateWarnings.push(`${aheadCount} commits ahead of ${upstreamBranch}`);

    // --- Route to workflow ---
    switch (prefix) {
      case "feature":
      case "experiment":
        await new Promise((r) => setTimeout(r, 800));
        ctx.ui.notify(`On ${branch} — starting planning workflow...`, "info");
        pi.sendUserMessage(
          `We're on branch \`${branch}\`.${stateWarnings.length ? ` Note: ${stateWarnings.join(", ")}.` : ""}\n\n` +
          `Before we start, re-read \`.ai/knowledge/\` and the plan file at \`.ai/${branch}.md\` (if it exists) to understand context. Follow the stages in order:\n\n` +
          `1. \`templates/stages/planning.md\` — Interview, architecture, plan writing, review, prototype\n` +
          `2. \`templates/stages/implementation.md\` — Impact analysis, code, tests, benchmarks\n` +
          `3. \`templates/stages/review.md\` — Outcomes, final verify, user review, merge\n\n` +
          `Start with \`templates/stages/planning.md\` and proceed step by step, confirming with me as you go.`,
          { deliverAs: "steer" },
        );
        break;

      case "fix":
      case "hotfix":
      case "chore":
      case "docs":
        await new Promise((r) => setTimeout(r, 800));
        ctx.ui.notify(`On ${branch} — jumping to implementation...`, "info");
        pi.sendUserMessage(
          `We're on branch \`${branch}\`.${stateWarnings.length ? ` Note: ${stateWarnings.join(", ")}.` : ""}\n\n` +
          `Check \`.ai/knowledge/\` and the plan file at \`.ai/${branch}.md\` (if it exists) for relevant context.\n\n` +
          `Follow \`templates/stages/implementation.md\` for the detailed implementation steps. Proceed step by step, confirming with me as you go.`,
          { deliverAs: "steer" },
        );
        break;

      default:
        if (hasUncommitted || aheadCount > 0 || behindCount > 0) {
          await new Promise((r) => setTimeout(r, 800));
          ctx.ui.notify(`Branch ${branch} has ${stateWarnings.join(", ")}.`, "warning");
          pi.sendUserMessage(
            `Branch \`${branch}\` has ${stateWarnings.join(", ")}. ` +
            `Read \`.ai/knowledge/\` and the plan file at \`.ai/${branch}.md\` (if it exists) for relevant context and ask the user how they'd like to proceed.`,
            { deliverAs: "steer" },
          );
        }
        break;
    }
  });
}

function findSessionForBranch(historyDir: string, branch: string): string | null {
  try {
    const entries = readdirSync(historyDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const found = findSessionForBranch(join(historyDir, entry.name), branch);
        if (found) return found;
      } else if (entry.name.endsWith(".jsonl")) {
        const filePath = join(historyDir, entry.name);
        try {
          const header = readFileSync(filePath, "utf-8").split("\n")[0];
          if (header.includes(`"${branch}"`) || header.includes(branch)) {
            return filePath;
          }
        } catch { /* skip unreadable */ }
      }
    }
  } catch { /* ignore */ }
  return null;
}
