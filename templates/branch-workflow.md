# Branch Workflow Reference

This document defines the stages available and how they compose per branch type.

## Stage Composition

| Branch type | Stages |
|-------------|--------|
| `feature/` | [Planning](stages/planning.md) → [Implementation](stages/implementation.md) → [Review](stages/review.md) |
| `hotfix/` | [Implementation](stages/implementation.md) → [Review](stages/review.md) — minimal review, fast track |
| `chore/`  | [Implementation](stages/implementation.md) — code maintenance, cleanup, performance analysis |

Users can define additional branch types per project in `AGENTS.md`.

## Cross-cutting conventions

These apply to all stages:

- **Read from disk** — at each stage boundary, read `.ai/feature/<name>.md` and `.ai/knowledge/` from disk rather than relying on conversation history
- **Mermaid diagrams** — all diagrams in Mermaid format
- **Document change convention** — append-only with strikethrough and HTML comment metadata
