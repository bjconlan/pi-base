# Planning

High-level scoping, architecture design, and prototyping. Output is a verified plan stored in `.ai/`.

### 1. Interview the User

Ask the user questions to clarify the goal. Cover:

- What are they trying to achieve?
- Is there an existing issue, ticket, or PR to reference?
- Are there any relevant docs, blog posts, GitHub projects, or commit SHAs to review?
- What does success look like? What are the acceptance criteria?
- Are there constraints (time, dependencies, compatibility)?

Check `.ai/knowledge/` for any relevant glossary terms, architectural decisions, or reference documents before proposing a design. Take notes. Do not propose a plan yet.

### 2. Assess Git

Check whether the current directory is a git repository:

```bash
git rev-parse --git-dir 2>/dev/null
```

If not a git repo, ask the user:

> "This project isn't tracked with git. Would you like me to initialise a repo (`git init`) and set up a basic `.gitignore`?"

  - If yes: `git init`, create a sensible `.gitignore` for the project type, and `git add` + `git commit` the initial state. Set up the `.ai/` directory structure as well.
  - If no: proceed without git (skip branch/worktree steps below).

If git is available (existing or newly initialised), check for uncommitted changes:

```bash
git status --porcelain
```

If there are uncommitted changes, ask the user whether to commit or stash them before branching.

### 3. Architecture Design (Bottom-Up then Top-Down)

Propose a layered architecture by working bottom-up, then top-down, then iterate. Present each layer to the user for feedback as you go.

#### Bottom-Up Pass

**Layer 1 — Data:** Identify the core data types, structures, and schemas. What are the fundamental entities and their relationships? Focus on optimal data structures without premature optimisation.

**Layer 2 — Functions:** Define the functions that operate on the data. Pure transformations, queries, validations. These should be composable and testable in isolation.

**Layer 3 — Context & Lifetimes:** Categorise data and function lifetimes. What is ephemeral (per-request, per-session)? What is persistent (cached, stored)? What context does each layer need?

**Layer 4 — API / Contract:** Define the public surface — interfaces, protocols, exports. This is the contract other parts of the system (or external consumers) depend on.

#### Top-Down Pass

Starting from the API/contract layer, work back down:

- Can any layer be simplified given the contracts above?
- Are there caching, computation, or storage optimisations that are clearly needed? (Avoid preoptimisation — only act on concrete patterns, not hypotheticals.)
- Are the data structures still optimal given the API constraints?

Iterate bottom-up and top-down until the architecture is coherent. The goal is a clear separation of concerns where each layer has a single responsibility and a natural verification strategy.

Confirm the data types and API contracts with the user before moving on. Implementation details can remain vague at this stage.

Write the architecture notes to `.ai/knowledge/architecture.md` (or update the existing file). This ensures the next session or stage can reload the design context from disk rather than relying on conversation history.

### 4. Derive Branch Name

From the goal summary, derive a branch name using the appropriate prefix:

| Prefix | When to use |
|--------|-------------|
| `feature/` | New features, enhancements, refactors |
| `hotfix/`  | Urgent bug fixes for the current release |
| `fix/`     | Non-urgent bug fixes |
| `chore/`   | Maintenance, tooling, dependencies |
| `docs/`    | Documentation only |
| `experiment/` | Exploratory or throwaway work |

Format: `<prefix>/<short-snaked-description>`

Examples:
- `feature/add_agent_dialog`
- `hotfix/crash-on-null-input`
- `chore/upgrade-deps`

### 5. Write the Plan

Write the plan to `.ai/{branch-type}/{branch-name}.md` — for example, `.ai/feature/add_agent_dialog.md`. This file is the single source of truth for the work.

#### Plan Structure

```markdown
# Plan: <goal>

## Scope
...

## Architecture
- **Data layer:** key types, structures, schemas
- **Function layer:** core operations
- **Context layer:** lifetimes, state management
- **API / Contract:** public surface

## Units of Work
1. ...
2. ...
3. ...

## Verification Strategy
- How each layer is tested (unit, integration)
- Key edge cases and type ranges to exercise
- Coverage targets per layer

## References
...
```

#### Diagrams

When the plan or any document includes visual concepts — architecture, data flow, sequences, state, timelines, relationships, or any structured information — render them as [Mermaid](https://mermaid.js.org/) markdown blocks. This keeps diagrams in plain text, version-controlled, and readable in any markdown viewer that supports Mermaid.

Pick the Mermaid diagram type that best fits what you're communicating:

- **Flow / layers / relationships:** `graph`, `flowchart` — component trees, decision trees, dependency graphs
- **Architecture diagrams:** `architecture-beta` — system architecture, service boundaries, infrastructure topology
- **Interactions over time:** `sequenceDiagram` — API calls, message passing, event flows
- **State / lifecycle:** `stateDiagram-v2` — state machines, status transitions, workflow stages
- **Data structure:** `classDiagram` — types, interfaces, fields, inheritance
- **Entity relationships:** `erDiagram` — database schemas, domain models
- **Timing / schedules:** `timeline` — project timelines, release sequences, roadmaps
- **Organisational / grouping:** `quadrantChart` — prioritisation matrices, risk/reward, effort/impact
- **Event-driven architecture:** `event` — event storming, event flows, message routing
- **Mind maps / brainstorming:** `mindmap` — brainstorming, concept hierarchies, task breakdowns
- **Gantt / scheduling:** `gantt` — sprint plans, dependency scheduling, milestone tracking
- **Pie / bar / xy charts:** `pie`, `block`, `xychart-beta` — distributions, comparisons, metrics
- **Requirements / traceability:** `requirementDiagram` — requirement verification, spec traceability
- **Git / branching:** `gitGraph` — branch strategies, merge workflows, release trains
- **Packaging:** `packagDiagram` — module boundaries, namespace organisation
- **Network / binary layout:** `packet` — protocol layouts, binary data formats, wire formats

When in doubt, use `graph` or `flowchart` — they handle most general-purpose diagrams well.

### Document Change Convention

Once written, the plan and verification documents are **append-only.** Never delete or replace content. Instead:

- **Redactions:** Strikethrough the original text, add the replacement below, and prefix both with an HTML comment containing the date-time and reason
- **Additions:** Insert new content inline where it belongs, preceded by an HTML comment with the date-time and reason

```markdown
<!-- 2026-06-11T14:30: Scope narrowed after user review — original approach exceeded session budget -->
~~Original approach that no longer applies~~
New approach that replaces it
```

This applies to all documents under `.ai/` — plan files, verification documents, knowledge base entries. The full evolution is preserved and reviewable.

#### Units of Work

Each unit must be as small as practical (bias toward many small steps). Each unit defines:

- **What** — the implementation to complete
- **Verification checkpoint** — the precise test or validation that confirms it works. Be specific: "run `npm test -- --grep 'Auth: token refresh'`", "verify `curl` returns 200 with expected JSON shape", "confirm all existing tests still pass"
- **Dependencies** — which units must be completed first

#### Verification Strategy

For each planned change, define how correctness will be verified:

- **Data layer:** Type checks, schema validation tests, property-based tests that exercise type ranges (null, empty, boundary values, common inputs)
- **Function layer:** Unit tests covering all branches (happy path, error paths, edge cases). Aim for branch coverage, not just line coverage.
- **Context layer:** Integration tests for state lifetimes — what happens when context is created, disposed, or times out.
- **API layer:** Contract tests — does the public interface match the spec? Are error responses well-defined?

When writing tests, exercise realistic type ranges — not just the happy path, but the values commonly found in production (boundaries, malformed inputs, concurrency edge cases).

### 6. Review the Plan

Present the plan to the user. Ask them to confirm or amend. Iterate until they approve.

#### Optional: Second-Agent Review

After the user approves, ask:

> "Would you like me to spin up a separate pi instance to review the plan independently?"

If yes:

```bash
pi -p "Review this development plan for gaps, inconsistencies, and risks.\n\nFocus on:\n- Are the data types and API contracts well-defined?\n- Are the units of work small enough for iteration?\n- Are verification checkpoints specific and testable?\n- Are there missing edge cases or dependencies?\n- Is the scope realistic for a single session?\n\nOutput a concise list of issues (if any) and recommendations." < .ai/feature/<name>.md
```

Present the review output to the user and ask if they want to amend the plan.

### 7. Save the Plan to Git

#### If git is available

Create the feature branch and a worktree:

```bash
git branch feature/<name> <base-branch>     # or just the current commit
git worktree add ../<repo>-<name> feature/<name>
```

Change to the worktree directory for all subsequent work.

Ensure the `.ai/` directory structure exists in the worktree:

```bash
mkdir -p .ai/feature .ai/knowledge
```

Write the plan to `.ai/feature/<name>.md`. Include a `## Status` section at the bottom to track execution progress:

```markdown
## Status

- **Stage:** 1 (Planning)
- **Current unit:** —
- **Last checkpoint:** Plan written and reviewed
- **Next action:** User approval or second-agent review, then prototype
```

This status block is the resume point — update it at every stage transition and after each unit of work.

Commit the plan:

```bash
git add .ai/feature/<name>.md && git commit -m "plan: <goal>"
```

#### If git is unavailable

Write the plan to `.ai/feature/<name>.md` in the project root. Note at the top that the project is not git-tracked.

### 8. Prototype the Architecture

Before full implementation, build a high-level prototype:

1. Implement the data types and API contracts identified in the plan
2. Stub out the function layer signatures
3. Wire up a minimal end-to-end path to validate the architecture holds
4. Run the verification strategy at the contract level — do the types compose as expected?

Present the prototype to the user. Re-clarify any assumptions that changed during prototyping. Update `.ai/feature/<name>.md` and `.ai/knowledge/architecture.md` to reflect any changes.

Update the status block in the plan to reflect progress.

#### Optional: Multi-Agent Architecture Review

Ask the user:

> "Would you like an independent review of this architecture before proceeding to implementation?"

If yes:

```bash
pi -p "Review this architectural prototype against the plan.\n\nPlan: $(cat .ai/feature/<name>.md)\n\nFocus on:\n- Does the implementation match the specified API/contract layer?\n- Are the data types consistent with the plan?\n- Are there any design issues that would cause problems in implementation?\n- Is the prototype minimal enough to iterate on?\n\nOutput issues found, if any." 
```

Present the review and iterate if needed.