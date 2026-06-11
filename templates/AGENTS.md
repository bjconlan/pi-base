# Project Guide

This file defines how the agent operates within this repository. It is loaded automatically at the start of every session.

**This file stays lean.** Detailed reference material — architecture docs, glossary, samples, external references — belongs in `.ai/knowledge/`. This file references those resources rather than duplicating them.

---

## Project Lifecycle

All feature work follows a 5-phase workflow. Each phase must complete before the next begins unless the user explicitly directs otherwise.

### Phase 1 — Planning
Interview the user to identify and clarify the problem. Produce a written plan covering scope, architecture, and units of work. Store the plan in `.ai/{branch-type}/{branch-name}.md`.

### Phase 2 — Plan Verification
Verify the plan against requirements before any implementation begins. This may include review by the user, a second agent instance, or both. Confirm the plan is sound, testable, and scoped correctly.

### Phase 3 — Architectural Prototyping
Implement the architecture at a high level — data types, API contracts, interfaces. Prototype key paths to validate the design. Re-clarify with the user if assumptions change. Optionally run a multi-agent review of the architecture.

### Phase 4 — Functional Implementation
Implement each unit of work with parallel test development. Verify against Phase 2 expectations. Each unit must pass its verification checkpoint before moving to the next.

### Phase 5 — Overview & Cleanup
Build an outcomes document comparing results against the plan. Note what changed, what was dropped, and why. Clean up dead code, prune invalid tests, and run the full test suite. Present to the user for final review before merging.

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
- When definitions become abstract or unclear, raise this with the user and ask for clarification
- When adding new patterns or conventions, document them for consistency

The `.ai/knowledge/` directory is version-controlled alongside the rest of the project. Content written here by one agent session is available to all future sessions — it is the project's persistent memory. Treat it as shared context, not session-local state.

---

## Skill Routing

The following skills are installed and should be used in the appropriate context:

| Skill | When to use |
|-------|-------------|
| `/skill:planning` | At the start of any feature, refactor, or enhancement to scope the work and produce a plan |

When starting a new piece of work, check which skills apply and invoke them. The user can also invoke skills manually via `/skill:<name>`.

---

## Working Rules

These rules govern how the agent approaches work in this project. They are defaults — the user can override them for a specific task.

### Effort Matching

Match the depth of your response to the complexity of the request:

- **Quick question / simple fix** — Answer concisely, implement directly, no ceremony
- **Moderate change** — Briefly outline the approach, confirm with the user, then implement
- **New feature / significant refactor** — Follow the full 5-phase workflow starting with `/skill:planning`
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

## Additional Conventions

- Always check `.ai/knowledge/` for relevant context before starting new work
- When in doubt about a term or concept, check `glossary.md` first, then ask the user
- Plans are living documents — update them as understanding evolves
- Verification is not optional for any unit of work; each unit must define and pass a verification checkpoint
