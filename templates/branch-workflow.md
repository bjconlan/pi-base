# Branch Workflow Reference

This document defines the stages available and how they compose per branch type.

## Stage Composition

| Branch type | Stages |
|-------------|--------|
| `feature/` | [`planning`](stages/planning.md) → [`implementation`](stages/implementation.md) → [`review`](stages/review.md) |
| `experiment/` | [`planning`](stages/planning.md) → [`implementation`](stages/implementation.md) → [`review`](stages/review.md) (lighter: skip second-agent reviews, minimise docs) |
| `fix/` | [`implementation`](stages/implementation.md) → [`review`](stages/review.md) (lightweight review) |
| `hotfix/` | [`implementation`](stages/implementation.md) → [`review`](stages/review.md) (minimal review, fast track) |
| `chore/` | [`implementation`](stages/implementation.md) (skip outcomes doc) |
| `docs/` | [`implementation`](stages/implementation.md) (no tests, lightweight review) |

## Cross-cutting conventions

These apply to all stages:

- **Read from disk** — at each stage boundary, read `.ai/feature/<name>.md` and `.ai/knowledge/` from disk rather than relying on conversation history
- **Mermaid diagrams** — all diagrams in Mermaid format (see [planning](./planning.md) for diagram type reference)
- **Document change convention** — append-only with strikethrough and HTML comment metadata (see [planning](./planning.md) for details)
