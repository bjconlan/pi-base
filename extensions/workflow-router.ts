/**
 * Workflow Router Extension
 *
 * On new sessions, detects the current git branch, checks for existing
 * sessions, and routes to the appropriate workflow or resume prompt.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

export default function (pi: ExtensionAPI) {
  // Watch for branch changes mid-session and update session name
  pi.on("tool_result", (evt) => {
    if (evt.toolName !== "bash" || evt.isError) return;
    const cmd = (evt.input.command as string) || "";
    const match = cmd.match(/git\s+checkout\s+(?:-b\s+)?(\S+)/);
    if (match) {
      pi.setSessionName(match[1]);
    }
  });

  pi.on("session_start", async (_event, ctx) => {
    // Only run for fresh sessions, not resumes, reloads, or continues
    if (_event.reason !== "startup" && _event.reason !== "new") return;
    if (!ctx.hasUI) return;

    // If the session already has user or assistant messages, it's a continuation
    try {
      const entries = ctx.sessionManager.getEntries();
      const hasContent = entries.some(
        (e: any) => e.type === "user" || e.type === "assistant" || e.role === "user" || e.role === "assistant",
      );
      if (hasContent) return;
    } catch { /* non-fatal */ }

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
    let existingSessions: string[] = [];
    if (existsSync(historyDir)) {
      existingSessions = findSessionsForBranch(historyDir, branch);
    }

    // --- Prompt logic ---    // --- Prompt logic ---
    const prefix = branch.split("/")[0];

    // If existing sessions were found, offer to resume
    if (existingSessions.length > 0) {
      let chosenSession: string;
      if (existingSessions.length === 1) {
        chosenSession = existingSessions[0];
      } else {
        const choice = await ctx.ui.select(
          `Multiple sessions found for ${branch}`,
          existingSessions,
        );
        if (!choice) return;
        chosenSession = choice;
      }

      const resume = await ctx.ui.confirm(
        `Resume session for ${branch}`,
        `A previous session was found (${chosenSession}). Resume it?\n\n"No" starts fresh.`,
      );
      if (resume) {
        ctx.ui.notify(`Resuming session: ${chosenSession}`, "info");
        pi.sendUserMessage(
          `We're resuming work on \`${branch}\`. An existing session file was found at \`${chosenSession}\`. ` +
          `Read the plan file at \`.ai/${branch}.md\` (if it exists) and check its \`## Status\` section to determine the last active stage and next action. ` +
          `Also check \`.ai/${branch}.verify.md\` (if it exists) for verification history. ` +
          `Reference the stage files at \`templates/stages/\` to continue from where work was left off. Review the current state of ` +
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

      case "hotfix":
      case "chore":
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
        // On main/master, check for unfinished backlog items
        if (branch === "main" || branch === "master") {
          const backlogFiles = listBacklogFiles(join(cwd, ".ai", "backlog"));
          if (backlogFiles.length) {
            // Has at least one epic — check for incomplete tasks
            await new Promise((r) => setTimeout(r, 800));
            ctx.ui.notify("On main branch with backlog items — checking tasks", "info");
            pi.sendUserMessage(
              `You're on \`${branch}\` but there are backlog items in \`.ai/backlog/\` that haven't been started yet.\n\n` +
              `Read through the epics in order (lowest to highest index). For each epic, check if it has incomplete tasks. ` +
              `If an epic has incomplete tasks, list them to the user and ask which they'd like to work on. ` +
              `If all tasks in the current epic are complete, move to the next epic. ` +
              `If all epics are complete or no epics exist, ask the user if they'd like to run /skill:backlog-planning to define the next epic.\n\n` +
              `Once the user selects a task, create the feature branch with \`git worktree add ../$(basename $(pwd))-feature-<task-name> && cd ../$(basename $(pwd))-feature-<task-name>\` ` +
              `and begin the planning workflow (templates/stages/planning.md). No need to restart pi — continue in this session.`,
              { deliverAs: "steer" },
            );
            break;
          }
        }

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

function listBacklogFiles(backlogDir: string): string[] {
  try {
    return readdirSync(backlogDir).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
}

interface SessionInfo {
  file: string;
  timestamp: number;
}

function findSessionsForBranch(historyDir: string, branch: string): string[] {
  const results: SessionInfo[] = [];
  try {
    const entries = readdirSync(historyDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        results.push(...findSessionsForBranch(join(historyDir, entry.name), branch));
      } else if (entry.name.endsWith(".jsonl")) {
        const filePath = join(historyDir, entry.name);
        try {
          const content = readFileSync(filePath, "utf-8");
          for (const line of content.split("\n")) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.type === "session_info" && parsed.name === branch) {
                results.push({ file: filePath, timestamp: parsed.timestamp || 0 });
                break;
              }
            } catch { /* skip unparseable */ }
          }
        } catch { /* skip unreadable */ }
      }
    }
  } catch { /* ignore */ }

  // Sort by timestamp descending (most recent first)
  results.sort((a, b) => b.timestamp - a.timestamp);
  return results.map((r) => r.file);
}