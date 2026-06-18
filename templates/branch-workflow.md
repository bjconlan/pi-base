# Branch Workflow Reference

This document defines the stages available and how they compose per branch type.

## Stage Composition

| Branch type | Stages |
|-------------|--------|
| `feature/` | [Planning](stages/planning.md) → [Implementation](stages/implementation.md) → [Review](stages/review.md) |
| `hotfix/` | [Implementation](stages/implementation.md) → [Review](stages/review.md) — minimal review, fast track |
| `chore/`  | [Implementation](stages/implementation.md) — code maintenance, cleanup, performance analysis |

### Stage outlines

**Planning:** Based on the backlog feature, identify the tasks and request relevant reference context. Clarify use cases and ensure the outcome is clear with measurable criteria so completion meets user expectations. Feed any discovered or refined definitions, references, and bibliographic information back into `.ai/knowledge/`.

**Implementation:** Work through tasks with code and tests. Ensure added code has coverage and removed code has its tests cleaned up. Run benchmarks for performance-sensitive changes. Commit with messages referencing the plan file.

**Review:** Produce an outcomes document against the original plan. Run final tests and benchmarks. Verify knowledge base updates (glossary, architecture, references, bibliography, feature plan). Present to user for review. Merge only on explicit user approval.

Users can define additional branch types per project in `AGENTS.md`.

## Cross-cutting conventions

These apply to all stages:

- **Read from disk** — at each stage boundary, read `.ai/feature/<name>.md` and `.ai/knowledge/` from disk rather than relying on conversation history
- **Mermaid diagrams** — all diagrams in Mermaid format
- **Document change convention** — append-only with strikethrough and HTML comment metadata
- **Decision register** — every decision (architecture, design, test strategy, scope changes, user preferences) is recorded in `.ai/knowledge/decisions.md`. Include context (feature/stage/step), options considered, and outcome. See [decisions.md](stages/decisions.md) for format.
- **Dependencies are immutable** — never modify resolved dependency source files directly. If a dependency needs behavioural changes, apply patches in the build flow (e.g. `patch-package`, `postinstall` scripts, or fork the dependency and reference the fork). Otherwise, adapt the codebase that consumes the dependency rather than altering the dependency itself.
