# @bjconlan/pi-base

Personal pi preferences and configuration package.

## Contents

| Resource | Source | Description |
|----------|--------|-------------|
| **Extension** | `extensions/setup-detector.ts` | Detects fresh projects (no AGENTS.md, README, or .ai/) and prompts to run through initialisation on new session. |
| **Extension** | `extensions/workflow-router.ts` | On new sessions, detects the git branch and auto-starts the appropriate workflow (planning for feature, implementation for hotfix and chore). |
| **Extension** | `extensions/file-hash-guard.ts` | Guards write/edit calls — warns if a file changed externally since the agent last read it, and asks for confirmation before overwriting. |
| **Extension** | `extensions/response-style.ts` | Automatically injects response style guidelines, co-author convention, and coding style preferences into every session's system prompt. |
| **Extension** | `extensions/oauth-resolver.ts` | Resolves OAuth/bearer tokens for external service APIs (X, Spotify) via env vars or user prompt. Used by assimilate-knowledge skill. |
| **Skill** | `skills/backlog-planning/SKILL.md` | Agile epic/feature/task management with indexed backlog files in `.ai/backlog/`. |
| **Skill** | `skills/explain-to-me/SKILL.md` | Comprehension check — the agent describes back what it understood before building on foundational information. |
| **Skill** | `skills/educate-me/SKILL.md` | Teaches code from first principles, saves tutorials to `.ai/knowledge/references/`. |
| **Skill** | `skills/assimilate-knowledge/SKILL.md` | Researches topics across YouTube, Reddit, BlueSky, articles, and podcasts. Saves findings to `.ai/knowledge/references/`. |
| **Template** | `templates/branch-workflow.md` | Stage composition reference for branch-based workflows. |
| **Template** | `templates/stages/planning.md` | Planning stage: interview, architecture, plan writing, review, prototype. |
| **Template** | `templates/stages/implementation.md` | Implementation stage: impact analysis, code, tests, benchmarks. |
| **Template** | `templates/stages/review.md` | Review stage: outcomes, final verification, user review, merge, cleanup. |
| **Template** | `templates/AGENTS.md` | Project-level agent config template (lifecycle, knowledge architecture, working rules, guardrails). |

## Installation

```bash
pi install /home/bjc/Workspace/pi-base
```

```bash
pi install .
```

### First-time setup

If you previously had `~/.pi/agent/APPEND_SYSTEM.md` with the response style guidelines, remove it after installing — `response-style.ts` handles it automatically and having both duplicates the guidelines:

```bash
rm ~/.pi/agent/APPEND_SYSTEM.md
```

Then run `/reload` in pi.

## Startup Behaviour

```mermaid
flowchart TD
    START(["New pi session"]) --> CHECK_AGENTS{"Has AGENTS.md,\nREADME.md, or .ai/?"}
    CHECK_AGENTS -->|no| SETUP[setup-detector prompts\nfor project initialisation]
    SETUP -->|user agrees| RUN_SETUP[6-step setup:\n1. AGENTS.md\n2. README\n3. Git\n4. Workspace & tooling\n5. Workflow\n6. Project overview]
    RUN_SETUP --> EXPLAIN[/skill:explain-to-me\ncomprehension check/]
    EXPLAIN --> COMMIT[Commit skeleton\nand create worktree]
    COMMIT --> SETUP_DONE([Ready for features])

    CHECK_AGENTS -->|yes| WORKFLOW[workflow-router inspects\ncurrent git branch]

    WORKFLOW --> BRANCH_TYPE{"Branch prefix?"}

    BRANCH_TYPE -->|feature| FEATURE["Start planning workflow\nStage: planning → implementation → review"]
    BRANCH_TYPE -->|hotfix| HOTFIX["Start implementation\nStage: implementation → review"]
    BRANCH_TYPE -->|chore| CHORE["Start implementation\nStage: implementation"]
    BRANCH_TYPE -->|main/master| MAIN{"Backlog\nfiles exist?"}
    MAIN -->|yes| BACKLOG["Read epics, find first with\nincomplete tasks, list to user"]
    BACKLOG --> PICK_TASK["User picks a task,\ntypes /start-feature feature/name,\nfresh session starts automatically"]
    MAIN -->|no| BACKLOG_START["Suggest /skill:backlog-planning
to define first epic"]

    FEATURE --> EXPLAIN2
    HOTFIX --> EXPLAIN2
    CHORE --> EXPLAIN2
    EXPLAIN2["Proceed step-by-step,\nconfirming with user"]

    style START fill:#333,color:#fff
    style SETUP fill:#2a5a2a,color:#fff
    style FEATURE fill:#2a4a6a,color:#fff
    style HOTFIX fill:#6a4a2a,color:#fff
    style CHORE fill:#5a2a5a,color:#fff
    style BACKLOG fill:#4a6,color:#fff
```

## Session Storage

Session logs are stored per-worktree in `.ai/history/`. Each `git worktree add` creates a separate directory with its own history, giving natural per-branch session isolation.

## Commands

| Command | When to use |
|---------|-------------|
| `/start-feature <name>` | After picking a task from the backlog, type this to create the branch and start a fresh session. E.g. `/start-feature feature/add-auth` |

## Skills

| Skill | When to use |
|-------|-------------|
| `/skill:backlog-planning` | Define epics, features, and tasks. Run when starting a new project phase or when the roadmap needs clarification. |
| `/skill:explain-to-me` | Ask the agent to describe back what it understood before it builds on foundational information. |
| `/skill:educate-me` | Learn how and why code works, from first principles. Saves tutorials to `.ai/knowledge/references/`. |
| `/skill:assimilate-knowledge` | Research a topic across multiple sources (YouTube, Reddit, BlueSky, articles) for up-to-date information. |

The response style guidelines are active automatically in every session — no action needed.

## Future support and refinement

To support fossilscm or other scms in generall we need to adapt this away from explicity using git and generalise the git flow style workflow which is currently used.

We need to identify a good way for sub agents to perform tasks. (perhaps worktree per sub-agent against main and they take tasks off the top of the list and perform prs in their created branches?)

Secondary agent verification doesn't seem to be triggered or even asked for. This needs to be investigated.