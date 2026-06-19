/**
 * Workflow Router Extension
 *
 * On new sessions, detects the current git branch and routes to the
 * appropriate workflow. Session isolation is handled by worktrees.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

export default function (pi: ExtensionAPI) {
  // Update session name when branch changes mid-session
  pi.on("tool_result", (evt, ctx) => {
    if (evt.toolName !== "bash" || evt.isError) return;
    const cmd = (evt.input.command as string) || "";
    const match = cmd.match(/git\s+checkout\s+(?:-b\s+)?(\S+)/);
    if (match) {
      pi.setSessionName(match[1]);
      // Feature branch creation from backlog: shut down so user can restart
      // fresh on the new branch. The workflow will start automatically.
      if (match[1].startsWith("feature/")) {
        ctx.ui.notify("Restart pi to continue on the new branch", "info");
        ctx.shutdown();
      }
    }
  });

  pi.on("session_start", async (_event, ctx) => {
    // Only run for fresh sessions, not reloads or continues
    if (_event.reason !== "startup" && _event.reason !== "new") return;
    if (!ctx.hasUI) return;

    // If the session already has user or assistant messages, it's a continuation
    try {
      const entries = ctx.sessionManager.getEntries();
      const hasMessages = entries.some(
        (e: any) => e.type === "user" || e.type === "assistant" ||
                       e.role === "user" || e.role === "assistant",
      );
      if (hasMessages) return;
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

    // --- Prompt logic ---    // --- Prompt logic ---
    const prefix = branch.split("/")[0];

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
              `Once the user picks a task, create the branch with \`git checkout -b feature/<task-name>\`. ` +
              `Pi will shut down after the branch is created. Restart pi to continue on the new branch - the planning workflow will start automatically.`,
              { deliverAs: "steer" },
            );
            break;
          }

          // No backlog files — suggest creating one
          await new Promise((r) => setTimeout(r, 800));
          ctx.ui.notify("On main with no backlog — suggest running /skill:backlog-planning", "info");
          pi.sendUserMessage(
            `You're on \`${branch}\` but there's no backlog yet. ` +
            `Would you like to run /skill:backlog-planning to define epics, features, and tasks?`,
            { deliverAs: "steer" },
          );
          break;
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
