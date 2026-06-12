---
name: backlog-planning
description: |
  Agile epic, feature, and task planning. Guides the user through defining
  epics with their features and tasks, stored as individual files in
  .ai/backlog/. Use when starting a new project phase or when the roadmap
  needs clarification.
---

# Backlog Planning

Work through these steps to define and refine epics, features, and tasks.

---

## 1. Load Existing State

Check what epics already exist:

```bash
ls .ai/backlog/ 2>/dev/null || echo "No backlog yet"
```

Read any existing epic files to understand context. If none exist, start fresh.

---

## 2. Interview — Define the Epic

Ask the user a guided set of questions:

- What is the current focus? What are you trying to achieve?
- What does success look like?
- What are the main capabilities or features needed?
- Are there hard constraints or deadlines?
- What is the minimum viable outcome?

Based on their answers, propose an epic name and summary. Confirm with the user.

### Break Down Features

For each feature in the epic:

- What is the goal of this feature?
- What are the acceptance criteria?
- What are the technical dependencies?
- Can it be broken into smaller units of work (tasks)?
- What is the priority (P0-critical, P1-important, P2-nice-to-have)?

Each feature should be small enough to fit in a single `feature/{name}` branch. If too large, split it.

### Define Tasks

For each feature, define tasks. Each task should:

- Have a clear description
- Map to a `feature/{short-name}` branch
- Have a status: `backlog`, `in-progress`, `done`
- Reference verification criteria

---

## 3. Identify Out-of-Scope Items

Ask the user:

> "Are there things you've thought about that don't belong in this epic but should be captured for later?"

For each out-of-scope item, create a new epic file or add it to an existing future epic. Keep the current epic focused.

---

## 4. Review and Classify

Present the full epic back to the user:

- Epic summary
- Features (prioritised, with use cases and functional requirements)
- Tasks per feature (ordered so blocking tasks come first)
- Out-of-scope items noted in their respective epic files

Ask the user to review, reorder, and refine. Iterate until they're satisfied.

### Classification

For each feature, identify:

- **Use cases** — what user or system interactions does this enable?
- **Functional requirements** — specific behaviours, inputs, outputs
- **Dependencies** — what must exist before this can start
- **Verification** — how will you know it works?

---

## 5. Save State

Write to `.ai/backlog/<epic-name>.md`:

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

Create additional files for future epics as needed (e.g. `.ai/backlog/future-enhancements.md`).

Commit the backlog files:

```bash
git add .ai/backlog/ && git commit -m "backlog: <epic-name>"
```

---

## 6. Notify User

At the end, tell the user:

- The epic is defined in `.ai/backlog/<epic-name>.md`
- When starting a feature branch for a task, the workflow starts automatically
- Run `/skill:backlog-planning` again to define a new epic or refine existing ones

---

## State Management

- Each epic is its own file under `.ai/backlog/`
- Files are version-controlled and updated via the document change convention (strikethrough + HTML comment metadata)
- When an epic is complete, update its status and mark progress as done
- Future epics can be defined at any time by running the skill again
