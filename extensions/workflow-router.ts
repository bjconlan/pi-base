/**
 * Workflow Router Extension
 *
 * On new sessions, detects the current git branch and automatically
 * queues the appropriate workflow:
 *
 * - feature/, experiment/ → full planning workflow
 * - fix/, hotfix/, chore/, docs/ → implementation stage only
 * - main/master (no .ai/ or AGENTS.md) → project initialisation
 *   (handled by setup-detector.ts)
 *
 * Continued sessions (resume, reload) are left alone.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    // Only run for fresh sessions, not resumes or reloads
    if (_event.reason !== "startup" && _event.reason !== "new") return;

    // Only in interactive sessions
    if (!ctx.hasUI) return;

    // Only if project has been initialised (has .ai/ or AGENTS.md)
    const cwd = ctx.cwd;
    if (!existsSync(join(cwd, ".ai")) && !existsSync(join(cwd, "AGENTS.md"))) return;

    // Detect current branch
    let branch = "";
    try {
      branch = execSync("git rev-parse --abbrev-ref HEAD", {
        cwd,
        encoding: "utf-8",
        timeout: 3000,
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
    } catch {
      return; // not a git repo or git unavailable
    }

    // Label the session with the branch name for identifiable history
    pi.setSessionName(branch);

    // Classify branch type
    const prefix = branch.split("/")[0];

    switch (prefix) {
      case "feature":
      case "experiment":
        await new Promise((r) => setTimeout(r, 800));
        ctx.ui.notify(`On ${branch} — starting planning workflow...`, "info");
        pi.sendUserMessage(
          `We're on branch \`${branch}\`. Let's plan this work. Please run through the planning workflow:\n\n` +
          `1. **Interview** — Ask me about the goal, scope, and acceptance criteria\n` +
          `2. **Architecture** — Design the solution bottom-up then top-down\n` +
          `3. **Write plan** — Document scope, architecture, units of work, and verification strategy\n` +
          `4. **Review** — Present the plan for my review and approval\n` +
          `5. **Prototype** — Validate the architecture before full implementation\n\n` +
          `Proceed step by step, confirming with me as you go.`,
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
          `We're on branch \`${branch}\`. Let's get straight to implementation:\n\n` +
          `1. **Impact analysis** — Scan what will be affected by these changes\n` +
          `2. **Implement** — Make the changes with tests\n` +
          `3. **Verify** — Run tests and confirm everything passes\n` +
          `4. **Review** — Present the diff for my approval before merging\n\n` +
          `Proceed step by step, confirming with me as you go.`,
          { deliverAs: "steer" },
        );
        break;

      default:
        // main/master or unknown branch — no auto-workflow
        break;
    }
  });
}
