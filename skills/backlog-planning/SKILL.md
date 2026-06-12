---
name: backlog-planning
description: |
  Agile epic, feature, and task planning. Guides the user through defining
  the current epic with features and tasks, managing a future epic for
  out-of-scope items, and archiving completed epics.
  Use when starting a new project phase or when the roadmap needs clarification.
---

# Backlog Planning

Work through these steps to define and refine epics, features, and tasks.

---

## 1. Load Existing State

Check what backlog files exist:

```bash
ls .ai/backlog/ 2>/dev/null || echo "No backlog yet"
```

- `current.md` — the active epic being worked on
- `next.md` — future epic queued up for later
- `{yyyy.mm.dd}_{name}.md` — archived completed epics

Read current.md (and next.md if it exists) to understand context. If neither exists, start fresh.

---

## 2. Interview — Define the Epic

Ask the user a guided set of questions:

- What is the current focus? What are you trying to achieve?
- What does success look like?
- What are the main capabilities or features needed?
- Are there hard constraints or deadlines?
- What is the minimum viable outcome?

Propose an epic name and summary. Confirm with the user.

### Break Down Features

For each feature in the epic:

- What is the goal of this feature?
- What are the acceptance criteria?
- What are the technical dependencies?
- What is the priority (P0-critical, P1-important, P2-nice-to-have)?

Features provide context and grouping for tasks. Each feature can contain multiple tasks.

### Define Tasks

For each feature, define tasks. Each task should:

- Have a clear description
- Map to a `feature/{short-name}` branch
- Have a status: `backlog`, `in-progress`, `done`
- Reference verification criteria

---

## 3. Identify Out-of-Scope Items

Ask the user:

> "Are there things that don't belong in this epic but should be captured for later?"

Add these to a future epic (next.md). Keep the current epic focused.

---

## 4. Review and Classify

Present the epic back to the user:

- Epic summary
- Features (prioritised, with use cases and functional requirements)
- Tasks per feature (ordered so blocking tasks come first)
- Out-of-scope items noted in next.md

Ask the user to review, reorder, and refine. Iterate until they're satisfied.

For each feature, identify:

- **Use cases** — what user or system interactions does this enable?
- **Functional requirements** — specific behaviours, inputs, outputs
- **Dependencies** — what must exist before this can start
- **Verification** — how will you know it works?

---

## 5. Save State

Write to `.ai/backlog/current.md`:

```markdown
# Epic: <name>

## Summary
...

## Status
- **Priority:** P0 | P1 | P2
- **Progress:** 0% — tasks: X total, Y done
- **Target:** <deadline or release if known>

## Features

### Feature 1: <name>
- **Priority:** P0 | P1 | P2
- **Use cases:** ...
- **Functional requirements:** ...
- **Dependencies:** ...
- **Tasks:**
  - [ ] `feature/<branch>` — Description (status: backlog)
  - [ ] `feature/<branch>` — Description (status: backlog)

### Feature 2: <name>
...
```

Write future items to `.ai/backlog/next.md` if they don't already exist.

Commit:

```bash
git add .ai/backlog/ && git commit -m "backlog: <epic-name>"
```

---

## 6. Complete an Epic

When the user determines the current epic is complete (all or most tasks done):

1. Archive the current epic with the next available index:

   ```bash
   # Find the highest existing index and increment
   next_index=$(ls .ai/backlog/ | grep -oP '^\d+' | sort -n | tail -1 | awk '{print $1+1}')
   next_index=${next_index:-1}
   mv .ai/backlog/current.md ".ai/backlog/${next_index}_<epic-short-name>.md"
   ```

2. If `.ai/backlog/next.md` exists, promote it to become the new current:

   ```bash
   mv .ai/backlog/next.md .ai/backlog/current.md
   ```

3. If no next.md exists, ask the user if they'd like to define a new epic now. If yes, the skill continues from step 2. If no, the backlog is complete.

4. Commit the changes:

   ```bash
   git add .ai/backlog/ && git commit -m "backlog: archive <epic-name>, promote next epic"
   ```

---

## 7. Notify User

At the end, tell the user:

- The current epic is in `.ai/backlog/current.md`
- Future items are in `.ai/backlog/next.md`
- Archived epics are at `.ai/backlog/{index}_{name}.md` (1_, 2_, etc.)
- When starting a feature branch for a task, the workflow starts automatically
- Run `/skill:backlog-planning` again to define a new epic, refine existing ones, or complete the current epic

---

## State Management

- `.ai/backlog/current.md` — active epic being worked on
- `.ai/backlog/next.md` — queued future epic (optional)
- `.ai/backlog/{index}_{name}.md` — archived completed epics (1_, 2_, etc.)
- Files use the document change convention (strikethrough + HTML comment metadata) for iterative refinement
