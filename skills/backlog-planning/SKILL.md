---
name: backlog-planning
description: |
  Agile epic, feature, and task planning. Epics are stored as numbered
  files in .ai/backlog/. The highest index is the next epic, the
  second-highest is the current epic, lower indices are archived.
  Use when starting a new project phase or when the roadmap needs clarification.
---

# Backlog Planning

**This skill only operates on the current and next epics.** Archived epics (lower indices) are outside its scope — they are historical records. The current epic must be marked complete before the next epic can become current.

---

## 1. Load Existing State

List the backlog files:

```bash
ls -1 .ai/backlog/ 2>/dev/null | sort -n || echo "No backlog yet"
```

- Highest index = next epic (queued)
- Second-highest = current epic (being worked on)
- Lower indices = archived completed epics

Read the current epic for context. If none exist, start fresh.

---

## 2. Interview — Define the Epic

Ask the user:

- What is the current focus and what does success look like?
- What are the main capabilities or features needed?
- Are there constraints or deadlines?
- What is the minimum viable outcome?

Propose an epic summary and confirm.

### Break Down Features

For each feature:

- Goal, acceptance criteria, dependencies
- Priority: P0-critical, P1-important, P2-nice-to-have

Features group tasks. Each feature can contain multiple tasks.

After defining a feature, run `/skill:explain-to-me` to clarify its goals and confirm shared understanding before moving to the next feature.

### Define Tasks

Each task should:

- Have a clear description
- Map to a `feature/{short-name}` branch
- Have a status: `backlog`, `in-progress`, `done`
- Reference verification criteria

---

## 3. Identify Out-of-Scope Items

Ask:

> "Are there things that don't belong here but should be captured for later?"

Add these to the next epic (highest index).

---

## 4. Review and Classify

Present the epic for review. For each feature identify:

- **Use cases** — what interactions does this enable?
- **Functional requirements** — behaviours, inputs, outputs
- **Dependencies** — what must exist first
- **Verification** — how to confirm it works

Iterate until the user is satisfied.

Run `/skill:explain-to-me` to confirm shared understanding of the full epic before saving.

---

## 5. Save State

When creating a new epic, always create both the current epic and a next epic placeholder:

```bash
mkdir -p .ai/backlog
last=$(ls .ai/backlog/ 2>/dev/null | grep -oP '^\d+' | sort -n | tail -1)
last=${last:-0}
current_index=$((last + 1))
next_index=$((last + 2))
```

Write the current epic to `.ai/backlog/${current_index}.md`:

```markdown
# Epic: <name>

## Summary
...

## Status
- **Priority:** P0 | P1 | P2
- **Progress:** 0%
- **Target:** <deadline if known>

## Features

### Feature: <name> (P0)
- **Use cases:** ...
- **Requirements:** ...
- **Dependencies:** ...
- **Tasks:**
  - [ ] `feature/<branch>` — Description (backlog)
```

Write a lightweight next epic placeholder to `.ai/backlog/${next_index}.md`:

```markdown
# Epic: <next-name> (Future)

## Summary
...

## Status
- **Priority:** P2
- **Progress:** 0%

## Features
...
```

Commit:

```bash
git add .ai/backlog/ && git commit -m "backlog: <epic-name>"
```

---

## 6. Complete an Epic

When the user determines the current epic is done:

1. Update its progress to 100% and note completion
2. The next epic (highest index) becomes the new current
3. Create a new next epic placeholder at `$(($(ls .ai/backlog/ | grep -oP '^\d+' | sort -n | tail -1)+1)).md`
4. If the user wants to define the next epic now, run through the interview; otherwise leave it as a placeholder
5. Commit:

   ```bash
   git add .ai/backlog/ && git commit -m "backlog: complete <epic-name>"
   ```

---

## 7. Notify User

- Current epic: highest index minus 1
- Next epic: highest index
- Run `/skill:backlog-planning` again to refine, complete, or add epics
