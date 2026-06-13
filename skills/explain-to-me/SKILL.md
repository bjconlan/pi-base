---
name: explain-to-me
description: |
  The agent describes back what it understands so far about the user's
  goals, requirements, or design. Use this to confirm shared understanding
  and refine the agent's mental model before proceeding.
  Automatically triggered whenever something needs to be described,
  defined, or clarified before diving into the task.
---

# Explain to Me

When invoked, the agent should stop and describe back what it understands about the current topic — not its own decisions, but the user's intent.

## What to cover

- **What I think you're trying to achieve** — restate the goal or requirement in your own words
- **Key points I've captured** — summarise the features, constraints, or details discussed so far
- **Where I'm unclear** — note anything ambiguous, contradictory, or missing
- **Is this right?** — ask the user to confirm or correct your understanding

## Tone

- Be direct. This is a comprehension check, not a performance.
- If you got something wrong, state clearly where you misunderstood.
- Do not add praise or commentary about the user's ideas.

## Trigger points

The skill is triggered automatically before committing to any of these:

1. **Project initialisation** — after setup, before committing the skeleton project
2. **Architecture design** — after defining the architecture, before writing the plan
3. **Backlog planning** — after each feature is defined, and before saving the full epic
4. **New feature branch** — at session start on a feature branch, before the planning workflow begins

## Manual usage

Invoke at any time when you want the agent to restate its understanding:

```
/skill:explain-to-me
```
