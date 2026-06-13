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

Use this whenever you're about to commit to a course of action based on understood requirements. Common examples:

- **Project initialisation** — before committing the skeleton, confirm the project scope and structure are understood correctly
- **Backlog planning** — after the user describes a feature, check your understanding before writing tasks; before saving the epic, confirm the full picture
- **Starting a feature branch** — at session start, restate what you understand the feature should do before diving into implementation
- **Architecture design** — after the user describes constraints and goals, confirm your interpretation before proposing a design

But these are examples, not a fixed list. The general rule: if you're about to act on what the user told you, first describe back what you understood and confirm it's correct.

## Usage

Invoke at any time:

```
/skill:explain-to-me
```
