---
name: epic-planning
description: |
  Agile epic, feature, and task planning. Guides the user through defining
  the current epic's features and tasks, scoping out-of-scope items into
  a future epic. Use when starting a new project phase or when the roadmap
  needs clarification.
---

# Epic Planning

Work through these steps to define and refine the project's epics, features, and tasks.

---

## 1. Load Existing State

Check if `.ai/epics/` already has files:

```bash
ls .ai/epics/ 2>/dev/null || echo "No epics directory yet"
```

- If `current.md` exists, read it to understand where work left off
- If `next.md` exists, read it for future items
- If neither exists, start fresh

---

## 2. Interview — Current Epic

Ask the user a guided set of questions to define the current epic:

- What is the current focus? What are you trying to achieve right now?
- What does success look like for this phase?
- What are the main capabilities or features needed?
- Are there hard constraints or deadlines?
- What is the minimum viable outcome?

Based on their answers, propose an epic name and summary. Confirm with the user.

### Break Down Features

For each feature in the current epic:

- What is the goal of this feature?
- What are the acceptance criteria?
- What are the technical dependencies?
- Can this feature be broken into smaller units of work (tasks)?
- What is the priority (P0-critical, P1-important, P2-nice-to-have)?

Each feature should be small enough to fit in a single `feature/{name}` branch. If a feature is too large, split it.

### Define Tasks

For each feature, define tasks. Each task should:

- Have a clear description
- Map to a `feature/{short-name}` branch
- Have a status: `backlog`, `in-progress`, `done`
- Reference any verification criteria

---

## 3. Identify Out-of-Scope Items

Ask the user:

> "Are there things you've thought about that are out of scope for the current epic but should be captured for later?"

Capture these as features in the next epic file (`next.md`). Use the same format but mark everything as `backlog` status.

---

## 4. Review and Classify

Present the full current epic back to the user:

- Epic summary
- Features (prioritised, with use cases and functional requirements noted)
- Tasks per feature (ordered so blocking tasks come first)
- Out-of-scope items moved to next epic

Ask the user to review, reorder, and refine. Iterate until they're satisfied.

### Classification

For each feature, identify:

- **Use cases** — what user or system interactions does this enable?
- **Functional requirements** — specific behaviours, inputs, outputs
- **Dependencies** — what must exist before this can start
- **Verification** — how will you know it works?

---

## 5. Save State

Write to `.ai/epics/current.md`:

```markdown
# Epic: <name>

## Summary
...

## Features

### Feature 1: <name>
- **Priority:** P0 | P1 | P2
- **Use cases:** ...
- **Functional requirements:** ...
- **Dependencies:** ...
- **Tasks:**
  - [ ] `feature/<branch-name>` — Description (status: backlog)
  - [ ] `feature/<branch-name>` — Description (status: backlog)

### Feature 2: <name>
...
```

Write to `.ai/epics/next.md` for future items:

```markdown
# Epic: <name> (Future)

## Features

### Feature: <name>
- **Priority:** P2
- **Status:** backlog
- **Notes:** ...
```

Commit the epics files so they're version-controlled:

```bash
git add .ai/epics/ && git commit -m "epic: <epic-name>"
```

---

## 6. Notify User

At the end, tell the user:

- The current epic is defined in `.ai/epics/current.md`
- The next epic future items are in `.ai/epics/next.md`
- When starting a new feature branch for a task in the current epic, the workflow will start automatically
- When the current epic's features are mostly complete, run `/skill:epic-planning` again to refine the next epic and promote it to current

---

## State Management

- `.ai/epics/current.md` — the active epic being worked on
- `.ai/epics/next.md` — items scoped out for later
- Both files are version-controlled and updated via the document change convention (strikethrough + HTML comment metadata)
- When an epic is complete, archive it: `mv .ai/epics/current.md .ai/epics/<name>-<date>.md` and promote the next epic to current
