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

## When to use it

Use this whenever the user provides information that will serve as a foundation for other work — decisions, constraints, requirements, or goals that downstream tasks will depend on. Before building on that information, describe back what you understood so both parties are aligned.

Examples of foundational information:

- **Project scope and purpose** — what the project is trying to achieve, target audience, constraints
- **Feature requirements** — acceptance criteria, use cases, dependencies between features
- **Architectural decisions** — technology choices, data model, API contracts
- **Task definitions** — what a unit of work entails, verification criteria

The general rule: if a misunderstanding would cascade into wasted work, verify your understanding first.

## Usage

Invoke at any time:

```
/skill:explain-to-me
```
