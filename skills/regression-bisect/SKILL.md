---
name: regression-bisect
description: |
  Structured regression debugging using git bisect. When something stopped
  working that previously worked, this skill finds the exact commit that
  introduced the regression. Use instead of guessing at the cause.
  Automatically triggered when the agent starts guessing at a problem
  that previously worked.
---

# Regression Bisect

If something stopped working that was known to work before, **do not guess at the cause.** Follow this process to identify the exact change that introduced the regression.

---

## 1. Establish the known-good state

Ask the user:

> "When did this last work correctly? Do you know a commit SHA, tag, or approximate timeframe?"

If the user provides a specific commit, use it. If they only know "it worked yesterday", use `git log --until` to find the last commit before that timeframe.

```bash
git log --oneline --until="yesterday" -1
```

If they don't know, ask if they have any test that can confirm the working state, or if there's a tagged release that was working.

---

## 2. Confirm the bad state

Make sure the current state (HEAD) is indeed failing:

```bash
# Run the test or command that demonstrates the regression
<test-or-command>
```

If the current state passes, there is no regression to find. Stop and report to the user.

---

## 3. Run git bisect

Use `git bisect` to find the exact commit that introduced the regression:

```bash
git bisect start
git bisect bad HEAD           # current state is bad
git bisect good <known-good>  # last known working commit
```

Git will check out a commit halfway between good and bad. Run the test:

```bash
<test-or-command>
```

If the test passes (the feature works), mark it as good:

```bash
git bisect good
```

If the test fails (the feature is broken), mark it as bad:

```bash
git bisect bad
```

Repeat until git identifies the first bad commit. Typically 5-15 iterations for repos with hundreds of commits.

If the test is not scriptable and requires manual verification, tell the user at each step and let them confirm pass/fail.

---

## 4. Examine the regression commit

Once git bisect finds the first bad commit, examine what changed:

```bash
git show <commit-sha> --stat
git diff <commit-sha>^..<commit-sha>
```

Read the diff carefully. Identify what specifically caused the regression — a logic error, a renamed symbol, a changed API, a removed edge case.

---

## 5. Fix the regression

Do not guess. Based on the identified change, implement the correct fix:

1. If it was a logic error — correct the logic
2. If it was a removed case — restore or reimplement it properly
3. If it was an API change — update the callers or the contract
4. If it was a dependency change — pin or revert the dependency

Write a test that reproduces the regression to ensure it stays fixed.

---

## 6. Clean up

```bash
git bisect reset
```

Commit the fix with a message referencing the regression commit:

```
fix: <description>

Regression introduced in <commit-sha>
```

---

## When to trigger

Use this skill automatically when:

- The user reports something that previously worked is now broken
- The agent starts proposing guesses at a problem without evidence
- A test that previously passed is now failing and the cause isn't obvious

**Do not guess.** If the codebase has git history and the feature worked before, use git bisect. Guessing wastes time and LLM credits.
