# Project Guide

This file defines how the agent operates within this repository. It is loaded automatically at the start of every session.

**This file stays lean.** Detailed reference material — architecture docs, glossary, samples, external references — belongs in `.ai/knowledge/`. This file references those resources rather than duplicating them.

---

## Feature Development Lifecycle

Workflows are composed from available stages per branch type:

| Branch type | Stages |
|-------------|--------|
| `feature/` | Planning → Implementation → Review |
| `hotfix/` | Implementation → Review (minimal, fast track) |
| `chore/`  | Implementation — code maintenance, cleanup, performance analysis |

Additional branch types can be defined per project — add them here when needed.

See [`templates/branch-workflow.md`](../templates/branch-workflow.md) for detailed stage outlines.

---

## Plan & Spec Storage

All plans and specs are stored under `.ai/` in the project root using the branch type and name:

```
.ai/{branch-type}/{branch-name}.md
```

For example, a feature branch `feature/user_extension_avatar` produces:

```
.ai/feature/user_extension_avatar.md
```

This file is the single source of truth for the work — it starts as the plan and is updated throughout development to log decisions, clarifications, and deviations.

---

## Knowledge Architecture

Canonical knowledge, samples, and reference data live under `.ai/knowledge/`:

```
.ai/knowledge/
├── README.md              # Overview of what knowledge is stored and how to use it
├── glossary.md            # Project-specific terms, definitions, and vernacular
├── architecture.md        # System architecture decisions and rationale
├── decisions.md           # Decision register — every decision with context, options, and outcome
├── bibliography.md        # External references — maps URLs to local files in references/
├── samples/               # Example inputs, outputs, and usage patterns
└── references/            # Saved copies of external docs, blog posts, RFCs
```

### bibliography.md format

```markdown
# Bibliography

## API Design

- **Source:** https://example.com/api-guidelines
  **Local:** references/api-guidelines.md
  **Notes:** Used as the basis for our REST API contracts

## Authentication

- **Source:** https://auth0.com/docs/tokens
  **Local:** references/auth0-tokens.md
  **Notes:** Reference for JWT structure and refresh flow
```

### Knowledge Refinement

Over time, refine the knowledge base to improve future agent sessions:

- When a concept requires repeated explanation, add it to `glossary.md`
- When an architectural decision is revisited, update `architecture.md` with the rationale
- Record every decision in `decisions.md` with context, options, and outcome
- When definitions become abstract or unclear, raise this with the user and ask for clarification
- When adding new patterns or conventions, document them for consistency

The `.ai/knowledge/` directory is version-controlled alongside the rest of the project. Content written here by one agent session is available to all future sessions — it is the project's persistent memory. Treat it as shared context, not session-local state.

---

## Skill Routing

Workflows are triggered automatically based on branch type. See [Branch Workflow](../templates/branch-workflow.md) for stage composition details.

---

## Working Rules

These rules govern how the agent approaches work in this project. They are defaults — the user can override them for a specific task.

### Effort Matching

Match the depth of your response to the complexity of the request:

- **Quick question / simple fix** — Answer concisely, implement directly, no ceremony
- **Moderate change** — Briefly outline the approach, confirm with the user, then implement
- **New feature / significant refactor** — Create a feature branch; the planning workflow starts automatically on the next new session
- **Exploratory / unclear request** — Ask clarifying questions before proposing anything

When in doubt, start lighter and escalate as the scope becomes clear. Don't run a full planning workflow for a one-line bug fix.

### Architecture & Analysis

Before committing to an architectural direction:

1. Check `.ai/knowledge/architecture.md` for existing decisions and rationale
2. If the problem is well-understood, present a single recommended approach with tradeoffs noted
3. If there are multiple viable approaches, outline 2-3 options with pros/cons and recommend one
4. If the problem is novel or high-risk, ask the user if they want deeper analysis or research

Surface tradeoffs explicitly — don't hide downsides. If you're unsure about a decision, say so.

### Research Before Action

Before implementing a solution that involves:

- **An unfamiliar library, API, or tool** — Briefly research its docs or common usage patterns first
- **A pattern you're uncertain about** — Check `.ai/knowledge/references/` for prior art
- **A known domain (auth, databases, etc.)** — Review the project's existing usage for consistency

Use web search if available and the user has enabled it. Keep research proportionate to the task — a full Google session is not needed to look up a function signature.

## Guardrails

### Tool Enforcement

These rules constrain tool usage to prevent mistakes. They apply regardless of the task.

**Read operations:**
- Before reading a file, consider whether a targeted `grep` or `rg` search would be more efficient than reading the whole file
- When exploring an unknown codebase, start with directory listings and file summaries before reading individual files in full
- Respect any `.gitignore` patterns unless the user explicitly asks you to read ignored files

**Write operations:**
- Before writing to a file that already exists, read it first unless the user explicitly said to overwrite
- When editing, make minimal, targeted changes — don't reformat or restructure unrelated code
- Prefer `edit` over `write` for modifying existing files (it preserves context the model didn't see)
- Do not write to `node_modules/`, `.git/`, or build output directories

**Execute operations:**
- For destructive commands (`rm -rf`, `dd`, format commands), explain what you're about to run and ask for confirmation first
- When running long-running commands, use a reasonable timeout and explain why
- Prefer `--dry-run` or `--check` flags when available for destructive operations
- Do not run package install commands (`npm install`, `pip install`, etc.) without user confirmation — they modify the project's dependency tree

**General:**
- Never commit binary files (images, compiled binaries, archives, etc.) without explicit user confirmation

## Branch Naming

Use the following prefixes for branches:

| Prefix | When to use |
|--------|-------------|
| `feature/` | New features, enhancements, refactors |
| `hotfix/`  | Urgent bug fixes for the current release |
| `chore/`   | Code maintenance, cleanup, performance analysis |

Add custom branch types as needed.

Format: `<prefix>/<short-snaked-description>`

## Additional Conventions

- Always check `.ai/knowledge/` for relevant context before starting new work
- When in doubt about a term or concept, check `glossary.md` first, then ask the user
- Plans are living documents — update them as understanding evolves
- Verification is not optional for any unit of work; each unit must define and pass a verification checkpoint
- **Dependencies are immutable** — never modify resolved dependency source files directly. Use build-flow patches or adapt the consuming codebase instead.
- **Schema migrations** — during prototyping and pre-v1, schema changes do not need migration scripts. After a public release or v1, any breaking schema change must be confirmed with the user and include a migration plan.
- **No binary files** — never commit binary files (images, compiled binaries, archives, etc.) without explicit user confirmation. Ask before adding any binary to a commit.
