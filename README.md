# @bjconlan/pi-base

Personal pi preferences and configuration package.

## Contents

| Resource | Source | Description |
|----------|--------|-------------|
| **Extension** | `extensions/file-hash-guard.ts` | Guards write/edit calls — warns if a file changed externally since the agent last read it, and asks for confirmation before overwriting. |
| **Prompt template** | `prompts/response-style.md` | Response style guidelines + co-author convention. Use `/response-style` in the editor to inject into a conversation. |
| **Skill** | `skills/planning/SKILL.md` | Interview-driven session planning with git branching, worktrees, and verifiable checkpoints. Use `/skill:planning` at the start of a session. |

## Installation

```bash
pi install /home/bjc/Workspace/pi-base
```

Or from within the repo:

```bash
pi install .
```

## Usage

After installation, the planning skill is available via:

```
/skill:planning
```

The agent will interview you to define a goal, create a feature branch with a worktree, build a plan with small verifiable checkpoints, and iterate through the units of work one at a time.

The response style prompt template is available via:

```
/response-style
```

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
