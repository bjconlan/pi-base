---
name: explain-to-me
description: |
  Prompts the agent to explain its reasoning, decisions, or design
  choices in detail. Use when you want clarity on what was done, why,
  and what the trade-offs are. Automatically triggered at key phase
  boundaries to ensure shared understanding.
---

# Explain

When invoked (or triggered at a phase boundary), the agent should step back and clearly explain:

## What to cover

- **What was just done or decided** — a concise summary
- **Why this approach** — rationale, trade-offs considered, alternatives ruled out
- **What it means for you** — impact on next steps, choices you need to make
- **What's still uncertain** — open questions, assumptions, risks

## Tone

- Be direct and factual — no padding or praise
- If there were trade-offs, state them plainly. Don't hide downsides.
- If you're unsure about something, say so

## Usage

The user can invoke this at any time via:

```
/skill:explain-to-me
```

It is also triggered automatically at phase boundaries (end of planning, end of architecture design, end of project initialisation) to confirm shared understanding before proceeding.
