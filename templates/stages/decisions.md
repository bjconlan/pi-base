# Decision Register

Every decision made during development is recorded here for traceability.

## Format

Each entry records:

- **Context** — what feature, stage, and step the decision relates to
- **Decision** — what was decided
- **Options considered** — alternatives that were discussed
- **Outcome** — why this option was chosen, trade-offs accepted
- **Date** — when the decision was made

```markdown
### YYYY-MM-DD: <short title>

- **Context:** feature/<name> / <stage> / <step>
- **Decision:** <what was decided>
- **Options:**
  - Option A: <description>
  - Option B: <description> (chosen)
- **Outcome:** <rationale, trade-offs, impact>
```

## Where decisions are captured

- During planning — architecture choices, technology decisions
- During implementation — design trade-offs, test strategy choices
- During review — acceptance criteria changes, scope adjustments
- Whenever the user states a preference or changes direction
