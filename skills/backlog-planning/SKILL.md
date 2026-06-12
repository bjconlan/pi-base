---
name: backlog-planning
description: |
  Agile epic, feature, and task planning. Guides the user through defining
  epics as indexed files in .ai/backlog/. The current epic is always the
  second-highest index; the highest index is the queued next epic.
  Use when starting a new project phase or when the roadmap needs clarification.
---

# Backlog Planning

Work through these steps to define and refine epics, features, and tasks.

---

## 1. Load Existing State

List the backlog files:

```bash
ls -1 .ai/backlog/ 2>/dev/null | sort -n || echo "No backlog yet"
```

The highest index is the **next** epic (queued for later). The second-highest is the **current** epic (being worked on). All lower indices are archived completed epics.

Read the current epic to understand context. If none exist, start fresh.

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

Features provide context and grouping for tasks.

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

Add these to the next epic (highest index). If no next epic exists, the user can create one later.

---

## 4. Review and Classify

Present the epic back to the user:

- Epic summary
- Features (prioritised, with use cases and functional requirements)
- Tasks per feature (ordered so blocking tasks come first)
- Out-of-scope items noted in the next epic

Ask the user to review, reorder, and refine. Iterate until satisfied.

For each feature, identify:

- **Use cases** — what user or system interactions does this enable?
- **Functional requirements** — specific behaviours, inputs, outputs
- **Dependencies** — what must exist before this can start
- **Verification** — how will you know it works?

---

## 5. Save State

Determine the index for the new epic:

```bash
# Highest existing index, or 0 if none
last=$(ls .ai/backlog/ 2>/dev/null | grep -oP '^\d+' | sort -n | tail -1)
last=${last:-0}
next_index=$((last + 1))
```

Write the new epic to `.ai/backlog/${next_index}_<short-name>.md`:

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

If this is the first epic (index 1), it becomes the current epic. If a current epic already exists, this becomes the next epic.

Commit:

```bash
git add .ai/backlog/ && git commit -m "backlog: <epic-name>"
```

---

## 6. Complete an Epic

When the user determines the current epic is done (all or most tasks complete):

1. The current epic file stays as-is — it's now archived by index order
2. If a next epic exists (higher index), it becomes the new current epic automatically
3. If no next epic exists, ask if the user wants to define one now. If yes, create it as `$(($(ls .ai/backlog/ | grep -oP '^\d+' | sort -n | tail -1)+1))_<name>.md`
4. Update the current epic's progress to 100% and note completion in its file
5. Commit:

   ```bash
   git add .ai/backlog/ && git commit -m "backlog: complete <epic-name>"
   ```

---

## 7. Notify User

At the end, tell the user:

- The current epic is the second-highest index in `.ai/backlog/`
- The next epic is the highest index
- When starting a feature branch for a task, the workflow starts automatically
- Run `/skill:backlog-planning` again to define a new epic, refine existing ones, or complete the current epic

---

## State Management

- All epics are indexed files in `.ai/backlog/`: `{index}_{short-name}.md`
- Current epic = second-highest index
- Next epic = highest index
- Lower indices = archived completed epics
- Files use the document change convention (strikethrough + HTML comment metadata) for iterative refinement
