---
name: planning
description: |
  Project planning with git branching, worktrees, layered architecture, and test-verified checkpoints.
  Follows a 3-stage workflow: Planning → Implementation → Review.
  Stores plans under .ai/ and manages project-level AGENTS.md context.
  Use at the start of any feature, refactor, or enhancement.
---

# Planning Workflow

When activated, follow these steps in order. Do not skip ahead.

### Branch Type Awareness

Check the current branch prefix to determine which stages apply:

| Branch type | Workflow |
|-------------|----------|
| `feature/`  | Full 3-stage workflow (Planning → Implementation → Review) |
| `experiment/` | Full 3-stage workflow, but lighter — skip second-agent reviews, minimise documentation |
| `fix/`      | Stage 2 (Implementation) only — skip planning, lightweight review |
| `hotfix/`   | Stage 2 (Implementation) only — skip planning, minimal review, fast track |
| `chore/`    | Stage 2 (Implementation) only — skip planning and outcomes doc |
| `docs/`     | Stage 2 (Implementation) only — no tests needed, lightweight review |
| No branch / main | Default to stage-and-review for any change |

If the branch type is `feature/` or `experiment/`, proceed with the full workflow below. For other types, jump directly to the relevant stage and adapt the level of ceremony accordingly.

---

## Feature Workflow

The following stages repeat for each feature, refactor, or enhancement. Each stage progresses to the next, but iteration occurs both within and between stages — planning may reveal implementation concerns, implementation may feed back into the plan, and review may identify gaps that loop back. Stage boundaries are checkpoints, not walls.

---

## Stage 2 — Planning

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

### Stage Transition: Read from Disk

Before starting the next stage, **do not rely on conversation history.** Read the current state from disk:

```bash
cat .ai/feature/<name>.md
```

This re-establishes context from the canonical source. The same pattern applies at every stage boundary — read the plan, read the knowledge base, proceed from there.

---

## Stage 3 — Implementation

Build, test, benchmark, and verify each unit of work. Output is working code with passing tests and benchmark results.

### 9. Change Impact Analysis

Before writing any code, scan the existing codebase for what will be affected:

1. Identify files that will be modified or are likely to break
2. Identify existing tests that cover those files
3. Identify any integration points (APIs, configs, shared types) that depend on the planned changes
4. Run the existing test suite to establish a baseline

Note the findings in the plan file under a `## Impact` section. This ensures you don't discover breakage after writing code.

### 10. Implement Units of Work

Work through the units of work in order. For each unit:

1. **Implement** the changes
2. **Write tests** in parallel with implementation — exercise all branches and realistic type ranges (nulls, boundaries, common values) to surface issues early
3. **Verify** — run the verification checkpoint. Confirm all existing tests still pass alongside the new ones
4. **Benchmark** — if the unit involves performance-sensitive code, run benchmarks to establish a baseline or confirm no regression. Note results in the plan file.
5. **Commit or stage** — check the current branch:

   - **main / master:** Always stage changes and present the diff for user review. Never commit directly.
   - **Feature branches:** Commit if verification passes (or follow the project's convention defined in AGENTS.md).

   When committing, use a message that references the plan:

   ```
   <unit-name>: <brief description>

   Plan: .ai/feature/<name>.md#<unit-id>
   ```

   This creates a traceable chain from spec to code.

6. **Debug and fix** if verification fails, then re-verify
7. **Update the status block** in the plan file — mark the unit as complete and note the commit SHA
8. **Confirm** with the user the unit is complete before moving to the next. If in stage-and-review mode, present the staged diff and ask the user to review before proceeding.

#### Optional: Second-Agent Verification

After a unit is verified, ask the user:

> "Would you like an independent review of this unit against the plan?"

If yes:

```bash
git diff HEAD~1 > /tmp/unit-review.diff
pi -p "Review this diff against the plan's verification strategy.\n\nPlan context: $(head -30 .ai/feature/<name>.md)\n\nFocus on:\n- Does the implementation match the spec in the plan?\n- Are all branches exercised? Are edge cases handled?\n- Is there dead code or unused paths?\n- Do the tests validate what they claim to validate?\n- Are there any regressions in existing behaviour?\n- Are there benchmark regressions?\n\nOutput issues found, if any." < /tmp/unit-review.diff
```

If issues are found, fix them before marking the unit complete.

#### Read from Disk Between Units

When starting a new unit of work, re-read the plan file rather than relying on what was said earlier in the conversation:

```bash
cat .ai/feature/<name>.md
```

This avoids context drift as the conversation grows.

#### Handling Spec Changes

If the plan needs to change mid-development:

1. Update `.ai/feature/<name>.md` using the **document change convention** — strikethrough redacted items, add replacements, include metadata comments with date and motivator
2. **Eliminate dead code** — remove any implementation that no longer serves the updated plan
3. **Prune invalid tests** — remove or rewrite tests that cover code paths, types, or behaviours that no longer exist
4. Ensure remaining tests only validate active codepaths
5. Confirm the changes with the user before proceeding
6. If the change is significant, consider running through Stage 1 (Planning) again

---

## Stage 4 — Review

Summarize outcomes, verify against the original goal, integrate changes, and clean up. Output is a finalized plan, clean git history, and an updated knowledge base.

### 11. Outcomes Document

Produce an outcomes section in the plan file. Append to `.ai/feature/<name>.md`:

```markdown
## Outcomes

### What was implemented
- ...

### Changes from the original plan
- ...

### Verification results
- All checkpoints passed: yes / no
- Full test suite: passing / failing
- Benchmarks: no regressions (or noted exceptions)

### Knowledge updates
- New glossary terms added: ...
- Architecture decisions updated: ...
```

### 12. Final Verification

1. Run the full test suite one final time
2. Run benchmarks one final time to confirm no regressions across all units
3. Clean up any dead code or debug artifacts
4. If any knowledge was gained that should be preserved, update `.ai/knowledge/`:
   - Add new terms to `glossary.md`
   - Update `architecture.md` with decisions made
   - Add reference links to `references/`

### 13. User Review

Present a summary of what was done — changes, test results, benchmark results, any deviations from the plan.

Ask the user to review the code:

> "Please review the final state. You can browse the diff with `git diff <base-branch>`. Let me know if you'd like changes, or if you're happy and want me to merge."

**Do not merge or push unless the user explicitly asks you to.**

- If the user requests changes, make them, re-run tests and benchmarks, and return to review
- If the user approves, ask: "Would you like me to push and merge this branch, or leave it for you to merge later?"
- If they say merge: push the branch and, if they confirm, merge into the target branch
- If they say leave it: note the branch name for later

### 14. Post-Merge Cleanup

After the branch is merged:

1. Remove the worktree to avoid stale checkouts:

   ```bash
   git worktree remove ../<repo>-<name>
   git branch -d feature/<name>
   ```

2. Finalize the plan file — mark `## Status` as complete and archive it. It stays in `.ai/feature/` as a historical record.

3. If any glossary terms, architecture decisions, or references were added during development, ensure they are committed to the target branch. The knowledge base persists across all branches.

4. If the outcomes document reveals knowledge that should be carried forward, add it to `.ai/knowledge/` using the same change convention — strikethrough outdated entries, add new ones, annotate with motivators.
