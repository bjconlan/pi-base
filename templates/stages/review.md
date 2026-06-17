# Review
Summarize outcomes, verify against the original goal, integrate changes, and clean up. Output is a finalized plan, clean git history, and an updated knowledge base.

### 11. Outcomes Document

Produce an outcomes section in the plan file. Append to `.ai/feature/<name>.md`:

```markdown
## Outcomes

### What was implemented
- ...

### Changes from the original plan
- ...

### Verification results
- All checkpoints passed: yes / no
- Full test suite: passing / failing
- Benchmarks: no regressions (or noted exceptions)

### Knowledge updates
- New glossary terms added: ...
- Architecture decisions updated: ...
```

### 12. Final Verification

1. Ensure every added or changed line of code has corresponding tests that exercise it. Remove or update any tests that cover removed functionality — stale tests for invalid code paths must not remain.
2. Run the full test suite and confirm everything passes
3. Run benchmarks one final time to confirm no regressions across all units
4. Update the `.verify.md` file with final verification results, noting what passed and any exceptions
5. Clean up any dead code or debug artifacts
6. Update project documentation — review `README.md` and any other user-facing docs for changes needed by this feature. Update installation steps, usage examples, configuration options, or API references as required.

7. Update `.ai/` with any knowledge gained during this feature:
   - Finalise `.ai/feature/<name>.md` with outcomes and status
   - Add new terms, types, or patterns to `.ai/knowledge/glossary.md`
   - Update `.ai/knowledge/architecture.md` with decisions made or changed
   - Ensure all decisions made during this feature are recorded in `.ai/knowledge/decisions.md`
   - Add reference links or research summaries to `.ai/knowledge/references/`
   - Add new source mappings to `.ai/knowledge/bibliography.md`
   
   This is the minimum bar — knowledge must be captured before the feature is merged, so future sessions benefit from what was learned.

### 13. User Review

Present a summary of what was done — changes, test results, benchmark results, any deviations from the plan.

Ask the user to review the code:

> "Please review the final state. You can browse the diff with `git diff <base-branch>`. Let me know if you'd like changes, or if you're happy and want me to merge."

**Do not merge or push unless the user explicitly asks you to.**

- If the user requests changes, make them, re-run tests and benchmarks, and return to review
- If the user approves, ask: "Would you like me to push and merge this branch, or leave it for you to merge later?"
- If they say merge: push the branch and, if they confirm, merge into the target branch
- If they say leave it: note the branch name for later

### 14. Post-Merge Cleanup

After the branch is merged:

1. Delete the feature branch:

   ```bash
   git branch -d feature/<name>
   ```

2. Finalize the plan file — mark `## Status` as complete and archive it. It stays in `.ai/feature/` as a historical record.

3. If any glossary terms, architecture decisions, or references were added during development, ensure they are committed to the target branch. The knowledge base persists across all branches.

4. If the outcomes document reveals knowledge that should be carried forward, add it to `.ai/knowledge/` using the same change convention — strikethrough outdated entries, add new ones, annotate with motivators.