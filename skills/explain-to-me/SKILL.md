---
name: explain-to-me
description: |
  The agent describes back what it understands so far about the user's
  goals, requirements, or design. Use this to confirm shared understanding
  and refine the agent's mental model before proceeding.
  Automatically triggered at key phase or stage boundaries.
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

## Usage

Invoke at any time:

```
/skill:explain-to-me
```

Also triggered automatically at phase boundaries to ensure the agent's understanding is aligned before work continues.
