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
2. **Write tests** in parallel with implementation — exercise all branches and realistic type ranges (nulls, boundaries, common values) to surface issues early
3. **Verify** — run the verification checkpoint. Confirm all existing tests still pass alongside the new ones
4. **Benchmark** — if the unit involves performance-sensitive code, run benchmarks to establish a baseline or confirm no regression. Note results in the plan file.
5. **Commit or stage** — check the current branch:

   - **main / master:** Always stage changes and present the diff for user review. Never commit directly.
   - **Feature branches:** Commit if verification passes (or follow the project's convention defined in AGENTS.md).

   When committing, use a message that references the plan:

   ```
   <unit-name>: <brief description>

   Plan: .ai/feature/<name>.md#<unit-id>
   ```

   This creates a traceable chain from spec to code.

6. **Debug and fix** if verification fails, then re-verify
7. **Update the status block** in the plan file — mark the unit as complete and note the commit SHA
8. **Confirm** with the user the unit is complete before moving to the next. If in stage-and-review mode, present the staged diff and ask the user to review before proceeding.

#### Optional: Second-Agent Verification

After a unit is verified, ask the user:

> "Would you like an independent review of this unit against the plan?"

If yes:

```bash
git diff HEAD~1 > /tmp/unit-review.diff
pi -p "Review this diff against the plan's verification strategy.\n\nPlan context: $(head -30 .ai/feature/<name>.md)\n\nFocus on:\n- Does the implementation match the spec in the plan?\n- Are all branches exercised? Are edge cases handled?\n- Is there dead code or unused paths?\n- Do the tests validate what they claim to validate?\n- Are there any regressions in existing behaviour?\n- Are there benchmark regressions?\n\nOutput issues found, if any." < /tmp/unit-review.diff
```

If issues are found, fix them before marking the unit complete.

#### Read from Disk Between Units

When starting a new unit of work, re-read the plan file rather than relying on what was said earlier in the conversation:

```bash
cat .ai/feature/<name>.md
```

This avoids context drift as the conversation grows.

#### Handling Spec Changes

If the plan needs to change mid-development:

1. Update `.ai/feature/<name>.md` using the **document change convention** — strikethrough redacted items, add replacements, include metadata comments with date and motivator
2. **Eliminate dead code** — remove any implementation that no longer serves the updated plan
3. **Prune invalid tests** — remove or rewrite tests that cover code paths, types, or behaviours that no longer exist
4. Ensure remaining tests only validate active codepaths
5. Confirm the changes with the user before proceeding
6. If the change is significant, consider running through Stage 1 (Planning) again

---