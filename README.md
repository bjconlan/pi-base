# @bjconlan/pi-base

Personal pi preferences and configuration package.

## Contents

| Resource | Source | Description |
|----------|--------|-------------|
| **Extension** | `extensions/file-hash-guard.ts` | Guards write/edit calls — warns if a file changed externally since the agent last read it, and asks for confirmation before overwriting. |
| **Extension** | `extensions/response-style.ts` | Automatically injects response style guidelines and co-author convention into every session's system prompt. |
| **Extension** | `extensions/setup-detector.ts` | Automatically detects fresh projects and prompts to run through initialisation (AGENTS.md, README, git, .ai/ workspace, session storage). |
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

On a fresh project, start with:

```
/skill:setup
```

This initialises AGENTS.md, README, git, `.ai/` workspace, and session storage. It runs once per project.

For each feature after that:

```
/skill:planning
```

The agent will interview you, design architecture, write a plan, prototype, implement with tests and benchmarks, and guide you through review and merge.

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

```mermaid
   flowchart LR
       subgraph INIT["Project Initialisation"]
           direction TB
           A1[Project outline] --> A2[Agent setup] --> A3[Workspace config]
       end

       subgraph FEATURE["Per-Feature Cycle"]
           direction LR

           subgraph PL["Planning"]
               direction TB
               B1[Interview] --> B2[Architecture design] --> B3[Write plan] --> B4[Review plan] --> B5[Branch + worktree] --> B6[Prototype]
           end

           subgraph IM["Implementation"]
               direction TB
               C1[Impact analysis] --> C2[Code + tests] --> C3[Verify + bench] --> C4{Pass?}
               C4 -->|yes| C5[Commit]
               C4 -->|no| C2
               C5 --> C6[Next unit] --> C2
           end

           subgraph RV["Review"]
               direction TB
               D1[Outcomes doc] --> D2[Final verify] --> D3[User review] --> D4{Approve?}
               D4 -->|yes| D5[Merge] --> D6[Cleanup worktree] --> D7[Update .ai/knowledge]
               D4 -->|no| D3
           end

           PL ~~~ IM ~~~ RV
       end

       INIT --> FEATURE

       style INIT fill:#2a5a2a,color:#fff
       style PL fill:#2a4a6a,color:#fff
       style IM fill:#6a4a2a,color:#fff
       style RV fill:#5a2a5a,color:#fff
       style FEATURE fill:#1a1a2a,color:#888,stroke-dasharray: 8 4
 ```