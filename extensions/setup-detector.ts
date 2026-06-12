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
import { existsSync, copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";

let setupPerformedThisSession = false;

export default function (pi: ExtensionAPI) {
  pi.on("session_shutdown", (_evt, ctx) => {
    if (!setupPerformedThisSession) return;
    try {
      const sessionFile = ctx.sessionManager.getSessionFile();
      if (!sessionFile) return;

      const cwd = ctx.cwd;
      const piSettingsPath = join(cwd, ".pi", "settings.json");
      if (!existsSync(piSettingsPath)) return;

      const settings = JSON.parse(readFileSync(piSettingsPath, "utf-8"));
      const sessionDir = settings.sessionDir;
      if (!sessionDir || !sessionDir.includes(".ai/history")) return;

      const targetDir = join(cwd, sessionDir);
      if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });

      const targetPath = join(targetDir, sessionFile.split("/").pop() || "session.jsonl");
      if (!existsSync(targetPath)) {
        copyFileSync(sessionFile, targetPath);
      }
    } catch { /* non-fatal */ }
  });
  pi.on("session_start", async (_event, ctx) => {
    // Only run for new sessions, not reloads or resumes
    if (_event.reason !== "startup" && _event.reason !== "new") return;

    const cwd = ctx.cwd;

    // Check for existing setup markers.
    // .pi/ alone doesn't count — it may exist from package installation.
    // We look for evidence of deliberate project setup.
    const hasAgentsMd = existsSync(join(cwd, "AGENTS.md"));
    const hasReadme = existsSync(join(cwd, "README.md"));
    const hasAiDir = existsSync(join(cwd, ".ai"));

    if (hasAgentsMd || hasReadme || hasAiDir) return;

    // Only prompt in interactive sessions
    if (!ctx.hasUI) return;

    // Small delay to let the session start cleanly, then ask
    await new Promise((r) => setTimeout(r, 500));

    const ok = await ctx.ui.confirm(
      "Project Setup",
      "This project doesn't have AGENTS.md or a .ai/ workspace yet. Would you like me to run through project initialisation? This will set up project documentation, git (if needed), agent and session storage.",
    );

    if (!ok) return;

    ctx.ui.notify("Running project setup...", "info");
    setupPerformedThisSession = true;

    // Queue the setup instructions as a user message so the agent processes them
    pi.sendUserMessage(
      [
        {
          type: "text" as const,
          text: "Let's set up this project. Please run through the following steps:\n\n" +
            "1. **AGENTS.md** — Create an AGENTS.md file with project-level conventions. Read the template from the pi-base package at `templates/AGENTS.md` and ask me which sections I'd like included.\n\n" +
            "2. **README** — If there's no README, scan the project and check for manifest files to infer language, framework, and dependencies. If the user describes the project purpose (e.g. 'PostgreSQL extension', 'REST API', 'CLI tool'), use that to infer technology defaults and suggest them for confirmation. Ask about use cases if the description is vague. Only ask about what couldn't be inferred.\n\n" +
            "3. **Git** — Check if git is initialised. If not, ask if I'd like to init and create a .gitignore.\n\n" +
            "4. **Workspace** — Create `.ai/knowledge/` directory structure. Ask the user if they want to store agent session history in the git repository. If yes, configure `.pi/settings.json` with `sessionDir: '../.ai/history'` and do not add `.ai/history/` to `.gitignore`. Copy any existing session files from `~/.pi/agent/sessions/` to `.ai/history/` now. If no, skip the session storage configuration entirely - sessions stay at their default location. When using worktrees (as the planning workflow sets up), each worktree has its own `.ai/history/` giving natural per-branch session isolation. If the project directory has no source files beyond what the agent created, propose a directory structure as a tree with brief descriptions and ask the user to confirm before creating anything.\n\n" +
            "5. **Workflow** — Ask me about my preferred workflow, test framework, and conventions. Ask if they have custom branch types they'd like to add to the routing table beyond the defaults (feature, experiment, fix, hotfix, chore, docs). Document their answers.\n\n" +
            "6. **Development tooling** — Scan the project to detect language and framework. Based on what's found, suggest appropriate linting, formatting, and style guide tools (e.g. clang-format/clang-tidy for C/C++, Checkstyle for Java, ESLint/Prettier for JS/TS, ruff/black for Python). Also suggest git hook tooling (e.g. pre-commit for Python, husky for JS/TS). Check if the recommended tools are already installed. If not, detect available user-level package managers (e.g. mise, homebrew, winget) and prompt the user to install the missing tools via those. Never install anything system-wide or use sudo - only install via user-level package managers with explicit user confirmation. Ask if they'd like help configuring what they choose.\n\n" +
            "7. **Project overview** — After setup, ask if they'd like to do a high-level project overview covering target audience, devices, timeframes, deployment targets, milestones, and high-level architecture. This helps frame what features to prioritise. Each feature should then be built in its own session (new context window) - the workflow starts automatically when you create a feature branch and start a new pi session.\n\n" +
            "Proceed step by step, confirming with me as you go.",
        },
      ],
      { deliverAs: "steer" },
    );
  });
}
