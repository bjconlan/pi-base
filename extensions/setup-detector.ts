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
import { existsSync, copyFileSync, mkdirSync, readFileSync, readdirSync, unlinkSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { homedir } from "node:os";

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

      // Always copy current session file
      const targetPath = join(targetDir, basename(sessionFile));
      if (!existsSync(targetPath)) {
        copyFileSync(sessionFile, targetPath);
      }

      // If "all existing sessions" was chosen, copy all files from default sessions dir
      const allFlag = join(targetDir, ".copy-all-flag");
      if (existsSync(allFlag)) {
        const defaultSessions = join(homedir(), ".pi", "agent", "sessions");
        if (existsSync(defaultSessions)) {
          for (const entry of readdirSync(defaultSessions)) {
            if (entry.endsWith(".jsonl")) {
              const src = join(defaultSessions, entry);
              const dst = join(targetDir, entry);
              if (!existsSync(dst)) {
                copyFileSync(src, dst);
              }
            }
          }
        }
        unlinkSync(allFlag);
      }
    } catch { /* non-fatal */ }
  });

  pi.on("session_start", async (_event, ctx) => {
    // Only run for new sessions, not reloads, resumes, or continues
    if (_event.reason !== "startup" && _event.reason !== "new") return;

    // If the session already has user or assistant messages, it's a continuation
    try {
      const entries = ctx.sessionManager.getEntries();
      const hasContent = entries.some(
        (e: any) => e.type === "user" || e.type === "assistant" || e.role === "user" || e.role === "assistant",
      );
      if (hasContent) return;
    } catch { /* non-fatal */ }

    const cwd = ctx.cwd;

    // Check for existing setup markers
    const hasAgentsMd = existsSync(join(cwd, "AGENTS.md"));
    const hasReadme = existsSync(join(cwd, "README.md"));
    const hasAiDir = existsSync(join(cwd, ".ai"));

    if (hasAgentsMd || hasReadme || hasAiDir) return;

    // Only prompt in interactive sessions
    if (!ctx.hasUI) return;

    await new Promise((r) => setTimeout(r, 500));

    const ok = await ctx.ui.confirm(
      "Project Setup",
      "This project doesn't have AGENTS.md or a .ai/ workspace yet. Would you like me to run through project initialisation? This will set up project documentation, git (if needed), agent and session storage.",
    );

    if (!ok) return;

    ctx.ui.notify("Running project setup...", "info");
    setupPerformedThisSession = true;

    pi.sendUserMessage(
      [
        {
          type: "text" as const,
          text: "Let's set up this project. Please run through the following steps:\n\n" +
            "1. **AGENTS.md** — Create an AGENTS.md file with project-level conventions. Read the template from the pi-base package at `templates/AGENTS.md` and ask me which sections I'd like included.\n\n" +
            "2. **README** — If there's no README, scan the project and check for manifest files to infer language, framework, and dependencies. If the user describes the project purpose (e.g. 'PostgreSQL extension', 'REST API', 'CLI tool'), use that to infer technology defaults and suggest them for confirmation. Ask about use cases if the description is vague. Only ask about what couldn't be inferred.\n\n" +
            "3. **Git** — Check if git is initialised. If not, ask if I'd like to init and create a .gitignore.\n\n" +
            "4. **Workspace & tooling** — Create `.ai/knowledge/` directory. Clarify and refine the tech stack based on the project purpose and README discussion. If any technology choices are unfamiliar, run `/skill:assimilate-knowledge` to research them before committing. Based on the detected language and framework, identify the appropriate build and dependency resolution tool (e.g. CPM/fetchcontent for CMake/C++, npm for JS/TS, pip/poetry for Python, go mod for Go, mix for Elixir, maven/gradle for Java, cargo for Rust). Define project dependencies using these tools, targeting the most recent release against a major semantic version (e.g. `^2.0.0` for npm, `>= 2.0` for CPM). Outline any dependency resolution requirements within the build configuration. Then ask about test framework, linter, formatter, style guide, and git hook preferences - adding their dependencies the same way. Check if recommended tools are already installed; if not, detect user-level package managers (e.g. mise, homebrew, winget) and prompt to install. Never install system-wide or use sudo. Ask the user if they want to store agent session history in the git repository. If yes, configure `.pi/settings.json` with `sessionDir: '../.ai/history'`, do not add `.ai/history/` to `.gitignore`, and the current session will be copied to the new location at session end. If no, skip the session storage configuration entirely - sessions stay at their default location. When using worktrees (as the planning workflow sets up), each worktree has its own `.ai/history/` giving natural per-branch session isolation. If the project directory has no source files beyond what the agent created, propose a directory structure as a tree with brief descriptions and ask the user to confirm before creating anything.\n\n" +
            "5. **Workflow** — Ask me about my preferred workflow and conventions. Ask if they have custom branch types they'd like to add to the routing table beyond the defaults (feature, hotfix, chore). Document their answers.\n\n" +
            "6. **Project overview** — After setup, ask if they'd like to do a high-level project overview. Cover the problem this project is trying to solve, target audience, and high-level architecture - ask questions if these weren't clearly established earlier. Revisit and update the README with the build, configure, dependency, and installation details identified during the workspace phase. Also cover timeframes, deployment targets, and milestones if relevant. Define the project's key goals and success criteria. Document everything in `.ai/knowledge/` for reference across future sessions. Show the planned commit message to the user before committing the skeleton project. Ask for confirmation. Once confirmed, commit it. Before finishing, run through `/skill:explain-to-me` to confirm shared understanding of what was set up and why. Then inform the user that when they're ready to define the project's roadmap, they can use `/skill:backlog-planning` to break down epics, features, and tasks. Then prompt the user to select a task from the backlog, or if none exists, tell them to use `/skill:backlog-planning` to define epics. When ready to start a feature, they can type `/start-feature feature/<name>` to create the branch and start a fresh session (templates/stages/planning.md) in this session. The branch type determines which workflow stages run automatically - feature branches run planning, implementation, and review; hotfix branches run implementation and review; chore branches run implementation only for maintenance tasks. This keeps each feature in a clean context - higher accuracy, lower token costs, avoiding premature compaction.\n\n" +
            "Proceed step by step, confirming with me as you go.",
        },
      ],
      { deliverAs: "steer" },
    );
  });
}
