/**
 * Setup Detector Extension
 *
 * Detects when a project hasn't been initialised (no AGENTS.md, no .ai/
 * structure, no .pi/settings.json) and offers to run through setup.
 *
 * On session_start, checks for setup markers. If missing, prompts the user.
 * If they accept, queues the setup instructions to the agent.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync } from "node:fs";
import { join } from "node:path";

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    // Only run for new sessions, not reloads or resumes
    if (_event.reason !== "startup" && _event.reason !== "new") return;

    const cwd = ctx.cwd;

    // Check for existing setup markers.
    // .pi/ alone doesn't count — it may exist from package installation.
    // We look for evidence of deliberate project setup.
    const hasAgentsMd = existsSync(join(cwd, "AGENTS.md"));
    const hasAiDir = existsSync(join(cwd, ".ai"));

    if (hasAgentsMd || hasAiDir) return;

    // Only prompt in interactive sessions
    if (!ctx.hasUI) return;

    // Small delay to let the session start cleanly, then ask
    await new Promise((r) => setTimeout(r, 500));

    const ok = await ctx.ui.confirm(
      "Project Setup",
      "This project doesn't have AGENTS.md or a .ai/ workspace yet. Would you like me to run through project initialisation? This will set up project documentation, git (if needed), workspace directories, and session storage.",
    );

    if (!ok) return;

    ctx.ui.notify("Running project setup...", "info");

    // Queue the setup instructions as a user message so the agent processes them
    pi.sendUserMessage(
      [
        {
          type: "text" as const,
          text: "Let's set up this project. Please run through the following steps:\n\n" +
            "1. **AGENTS.md** — Create an AGENTS.md file with project-level conventions. Read the template from the pi-base package at `templates/AGENTS.md` and ask me which sections I'd like included.\n\n" +
            "2. **README** — If there's no README, scan the project, infer what you can, and ask me what's missing.\n\n" +
            "3. **Git** — Check if git is initialised. If not, ask if I'd like to init and create a .gitignore.\n\n" +
            "4. **Workspace** — Create `.ai/knowledge/` directory structure and offer to configure session logs in `.ai/history/` via `.pi/settings.json`.\n\n" +
            "5. **Workflow** — Ask me about my preferred workflow, test framework, and conventions, then document the answers.\n\n" +
            "Proceed step by step, confirming with me as you go.",
        },
      ],
      { deliverAs: "steer" },
    );
  });
}
