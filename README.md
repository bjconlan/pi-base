# @bjconlan/pi-base

Personal pi preferences and configuration package.

## Contents

| Resource | Source | Description |
|----------|--------|-------------|
| **Extension** | `extensions/file-hash-guard.ts` | Guards write/edit calls — warns if a file changed externally since the agent last read it, and asks for confirmation before overwriting. |
| **Extension** | `extensions/response-style.ts` | Automatically injects response style guidelines and co-author convention into every session's system prompt. |
| **Skill** | `skills/planning/SKILL.md` | 5-phase feature workflow with planning, verification, architectural prototyping, implementation, and cleanup. Uses git branching, worktrees, and optional multi-agent review. Use `/skill:planning` at the start of a feature. |

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

## Usage

After installation, the planning skill is available via:

```
/skill:planning
```

The response style guidelines are active automatically in every session — no action needed.

## Package resources

The `package.json` declares these directories:

```json
{
  "pi": {
    "extensions": ["./extensions"],
    "skills": ["./skills"],
    "prompts": ["./prompts"],
    "themes": ["./themes"]
  }
}
```

To add new resources, drop files in the appropriate directory and pi will load them automatically when the package is installed.
