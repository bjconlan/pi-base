# @bjconlan/pi-base

Personal pi preferences and configuration package.

## Contents

| Resource | Source | Description |
|----------|--------|-------------|
| **Extension** | `extensions/setup-detector.ts` | Detects fresh projects (no AGENTS.md, README, or .ai/) and prompts to run through initialisation on new session. |
| **Extension** | `extensions/workflow-router.ts` | On new sessions, detects the git branch and auto-starts the appropriate workflow (planning for feature/experiment, implementation for fix/hotfix/chore/docs). |
| **Extension** | `extensions/file-hash-guard.ts` | Guards write/edit calls — warns if a file changed externally since the agent last read it, and asks for confirmation before overwriting. |
| **Extension** | `extensions/response-style.ts` | Automatically injects response style guidelines and co-author convention into every session's system prompt. |
| **Template** | `templates/branch-workflow.md` | Stage composition reference for branch-based workflows. Maps branch types to stage files (planning, implementation, review). |

## Installation

```bash
pi install /home/bjc/Workspace/pi-base
```

Or from within the repo:

```bash
pi install .
```

### First-time setup

If you previously had `~/.pi/agent/APPEND_SYSTEM.md` with the response style guidelines, **remove it** after installing this package — the `response-style.ts` extension handles it automatically and having both would duplicate the guidelines:

```bash
rm ~/.pi/agent/APPEND_SYSTEM.md
```

Then run `/reload` in pi.

## Behaviour

On each **new session** (not resumed or reloaded), the agent checks the project and branch state:

| Project state | Branch | Action |
|---------------|--------|--------|
| No AGENTS.md, no README, no .ai/ | any | Prompts to run project initialisation (AGENTS.md, README, git, workspace, session storage) |
| Initialised | `feature/*`, `experiment/*` | Auto-starts the full planning workflow by reading `templates/branch-workflow.md` |
| Initialised | `fix/*`, `hotfix/*`, `chore/*`, `docs/*` | Auto-starts implementation stage directly (impact analysis → implement → verify → review) |
| Initialised | `main`, `master`, or other | Default behaviour — no auto-workflow |

Continued sessions (resume) and manual `/skill:planning` invocation are unaffected.

## Session Storage

Session logs are stored in `.ai/history/` if configured during initialisation. When using worktrees (as the planning workflow sets up), each worktree has its own `.ai/history/`, giving natural per-branch session isolation.

The response style guidelines are active automatically in every session — no action needed.
