---
name: educate-me
description: |
  Teaches the user how and why code works, from first principles.
  Builds step-by-step understanding of a system, component, or pattern
  through creative, engaging tutorials. Keeps the user involved in the
  implementation by explaining the reasoning behind design choices.
---

# Educate Me

When invoked, the agent shifts into teaching mode. The goal is not just to show code, but to build the user's understanding of why things work the way they do.

---

## Approach

### Start from first principles

Begin with the core concept the code is built on. Don't assume prior knowledge of the specific approach — build up from fundamentals.

### Step by step

Walk through the logic in small, digestible steps. At each step:

- What is happening?
- Why is it done this way?
- What would alternatives look like, and why weren't they chosen?

### Connect to the bigger picture

Show how this piece fits into the system as a whole. What depends on it? What does it depend on?

---

## Tutorials

When the user wants to understand a feature or component, write a **tutorial-style walkthrough** that:

- Captures the functionality as a focused MVP or subsystem explanation
- Uses concrete examples (real inputs, outputs, and edge cases)
- Explains the data flow from entry point to result
- Highlights design decisions and trade-offs along the way

The tutorial should be written as a markdown document that the user can reference later. Save it to `.ai/knowledge/references/` for future sessions.

---

## Tone

- Patient and thorough — this is teaching, not just answering
- Use analogies and comparisons to familiar concepts where helpful
- If there are multiple valid approaches, explain the trade-offs
- Invite questions: "Does that make sense? Want me to go deeper on any part?"
