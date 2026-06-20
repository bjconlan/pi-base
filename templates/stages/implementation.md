# Implementation
Build, test, benchmark, and verify each unit of work. Output is working code with passing tests and benchmark results.
Build, test, benchmark, and verify each unit of work. Output is working code with passing tests and benchmark results.

### 9. Change Impact Analysis

Before writing any code, scan the existing codebase for what will be affected:

1. Identify files that will be modified or are likely to break
2. Identify existing tests that cover those files
3. Identify any integration points (APIs, configs, shared types) that depend on the planned changes
4. Run the existing test suite to establish a baseline

Note the findings in the plan file under a `## Impact` section. This ensures you don't discover breakage after writing code.

### 10. Implement Units of Work

Work through the units of work in order. For each unit:

1. **Implement** the changes
2. **Write tests** in parallel with implementation — exercise all branches and realistic type ranges (nulls, boundaries, common values) to surface issues early. Every added or changed line must have corresponding tests. Remove or update any tests covering removed functionality.
3. **Verify** — run the verification checkpoint. Confirm all existing tests still pass alongside the new ones
4. **Lint and format** — run the project's linter and formatter (if configured). If not configured, ask the user if they'd like to set them up. Never reformat unrelated code.
5. **Benchmark** — if the unit involves performance-sensitive code, run benchmarks to establish a baseline or confirm no regression. Note results in the plan file.
6. **Commit or stage** — check the current branch:

   - **main / master:** Always stage changes and present the diff for user review. Never commit directly.
   - **Feature branches:** Commit if verification passes (or follow the project's convention defined in AGENTS.md).

   When committing, use a message that references the plan:

   ```
   <unit-name>: <brief description>

   Plan: .ai/feature/<name>.md#<unit-id>
   ```

   This creates a traceable chain from spec to code.

7. **Debug and fix** if verification fails, then re-verify
8. **Update the status block** in the plan file — mark the unit as complete and note the commit SHA
9. **Confirm** with the user the unit is complete before moving to the next. If in stage-and-review mode, present the staged diff and ask the user to review before proceeding.

#### Optional: Second-Agent Verification

After a unit is verified, ask the user:

> "Would you like an independent review of this unit against the plan?"

If yes, build a review context bundle (omit `.ai/history/`):

```bash
git diff HEAD~1 > /tmp/unit-review.diff
cat .ai/feature/<name>.md > /tmp/review-context.md
echo -e "\n---\n# Knowledge Context\n---\n" >> /tmp/review-context.md
cat .ai/knowledge/architecture.md .ai/knowledge/decisions.md .ai/knowledge/glossary.md >> /tmp/review-context.md 2>/dev/null

pi -p "Review this diff against the plan's verification strategy.\n\nContext includes the plan file, relevant knowledge base entries (.ai/history/ excluded), and the diff.\n\nFocus on:\n- Does the implementation match the spec in the plan?\n- Are all branches exercised? Are edge cases handled?\n- Is there dead code or unused paths?\n- Do the tests validate what they claim to validate?\n- Are there any regressions in existing behaviour?\n- Are there benchmark regressions?\n\nOutput issues found, if any." < /tmp/review-context.md
```

If issues are found, fix them before marking the unit complete.

#### Read from Disk Between Units

When starting a new unit of work, re-read the plan file rather than relying on what was said earlier in the conversation:

```bash
cat .ai/feature/<name>.md
```

This avoids context drift as the conversation grows.

#### Out-of-Scope Items

If the user mentions ideas or tasks outside the current feature's scope:

1. Scan all existing epics in `.ai/backlog/` to see if the item fits within any pending task. If so, add it as a subtask or note to that existing task.
2. If no existing task fits, append the item to the current epic (second-highest index) as a new feature or task.
3. If the user specifies a particular epic, add it there instead.

Use the document change convention (strikethrough + HTML comment metadata) for all additions.

#### Handling Spec Changes

If the plan needs to change mid-development:

1. Update `.ai/feature/<name>.md` using the **document change convention** — strikethrough redacted items, add replacements, include metadata comments with date and motivator
2. **Eliminate dead code** — remove any implementation that no longer serves the updated plan
3. **Prune invalid tests** — remove or rewrite tests that cover code paths, types, or behaviours that no longer exist
4. Ensure remaining tests only validate active codepaths
5. Confirm the changes with the user before proceeding
6. If the change is significant, consider running through Stage 1 (Planning) again

---