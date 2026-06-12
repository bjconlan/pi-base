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

---

## Project Setup (One-Time)

This section runs once per project, not per feature. Skip it if `AGENTS.md` already exists.

If the project does not have an `AGENTS.md` file in its root, ask the user:

> "This project doesn't have an AGENTS.md yet — that's where I store project-level conventions, workflow definitions, and knowledge architecture. Would you like me to create one?"

If yes, present the available sections and ask which ones they'd like included:

> "I have a template with these possible sections:
>
> 1. **Project Lifecycle** — Defines the 3-stage workflow (planning → implementation → review). Relevant if you want structured feature development.
> 2. **Plan & Spec Storage** — Where plans are saved (`.ai/{branch-type}/{branch-name}.md`). Useful if you're using the planning workflow.
> 3. **Knowledge Architecture** — Persistent project memory under `.ai/knowledge/` (glossary, architecture decisions, references). Good for projects that will have ongoing agent sessions.
> 4. **Skill Routing** — Documents which skills are available and when to use them.
> 5. **Working Rules** — Effort matching, architecture analysis, research-before-action defaults.
> 6. **Guardrails** — Tool enforcement rules for read/write/execute operations.
>
> Which of these would you like? I can also suggest sections based on what I know about the project so far."

Based on their responses, read the template and adapt only the selected sections. Write it to `AGENTS.md` in the project root. Ask the user to review and adjust before committing.

If no, proceed without it.

### README.md

If the project doesn't have a `README.md`, ask the user:

> "There's no README yet. Would you like me to create one? I'll ask a few questions to get the right content."

If yes, first scan the project to gather what can be deduced automatically:

```bash
ls -la
```

Look for manifest files (`package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, `Gemfile`, `CMakeLists.txt`, `Makefile`, `Dockerfile`, `compose.yaml`, etc.) and read them to infer language, runtime, dependencies, and build commands. Then present what was found and ask the user only for what couldn't be deduced:

- **Project purpose** — the agent can't guess this, the user must describe it
- **Language / runtime** — confirm what was inferred from manifests
- **Dependencies** — confirm what was found, ask about any non-standard ones
- **Build / test / run commands** — confirm what was inferred from manifests or Makefiles
- **Environment variables, config, setup steps** — confirm what config files exist, ask about required env vars not in `.env.example` or similar
- **Anything else** someone new would need

Write the README, ask the user to review, then commit it.

### First-Discovery Workflow Questions

When discovering the project for the first time (or when the project lacks established conventions), ask the user:

> "Before we start, I'd like to understand how you work in this project:
> - Do you want multi-step verification plans for changes, or is a lighter check sufficient?
> - Are there any existing workflows or conventions I should follow?
> - Is there a preferred test framework or CI process?"

Document the answers in `AGENTS.md` (if it exists) or in a temporary note for the session.

---

## Feature Workflow (3 Stages)

The following stages repeat for each feature, refactor, or enhancement. Each stage progresses to the next, but iteration occurs both within and between stages — planning may reveal implementation concerns, implementation may feed back into the plan, and review may identify gaps that loop back. Stage boundaries are checkpoints, not walls.

---

## Stage 1 — Planning

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

From the goal summary, derive a feature branch name:

```
feature/<short-snaked-description>
```

For example: `feature/add_agent_dialog`, `feature/refactor_auth_flow`.

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

#### Document Change Convention

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

## Stage 2 — Implementation

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
5. **Commit** if verification passes. Use a commit message that references the plan:

   ```
   <unit-name>: <brief description>

   Plan: .ai/feature/<name>.md#<unit-id>
   ```

   This creates a traceable chain from spec to code.

6. **Debug and fix** if verification fails, then re-verify
7. **Update the status block** in the plan file — mark the unit as complete and note the commit SHA
8. **Confirm** with the user the unit is complete before moving to the next

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

## Stage 3 — Review

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
