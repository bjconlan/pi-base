# Test Scenarios

Manual test cases to verify the package works as expected. Run through these after any significant changes.

## Prerequisites

- pi installed with this package: `pi install /path/to/pi-base`
- A test project with no prior agent setup (no AGENTS.md, no .ai/, no README.md)

---

## Scenario 1: Project Initialisation (fresh project)

**Setup:** Empty directory, no AGENTS.md, no .ai/, no README.

**Expected behaviour:**
1. Start `pi` in the directory
2. Setup-detector prompts: "This project doesn't have AGENTS.md or a .ai/ workspace yet. Would you like me to run through project initialisation?"
3. Accept → agent walks through 6-step setup
4. At the end, `/skill:explain-to-me` runs to confirm understanding
5. Skeleton committed, user told about `/skill:backlog-planning`

**Regression checks:**
- Should not prompt if AGENTS.md exists
- Should not prompt if .ai/ exists
- Should not prompt if README.md exists
- Should not prompt on `/reload` or resumed sessions

---

## Scenario 2: Main Branch with Backlog

**Setup:** Project has been initialised, has `.ai/backlog/` with at least one epic containing incomplete tasks. On `main` branch.

**Expected behaviour:**
1. Start `pi` (fresh session)
2. Workflow-router detects `main` branch
3. Backlog files found → agent is told to read epics and list incomplete tasks
4. User picks a task
5. Agent creates the branch: `git checkout -b feature/<task-name>`
6. Extension detects branch change → calls `newSession()` → fresh session starts
7. New session detects `feature/` prefix → starts planning workflow

**Regression checks:**
- Should not trigger if on a feature branch
- Should not trigger if on hotfix/chore branch
- Should not trigger on continued sessions
- Should prompt to create backlog if no backlog files exist

---

## Scenario 3: Feature Branch Planning

**Setup:** On a `feature/xxx` branch. No prior session exists for this branch.

**Expected behaviour:**
1. Start `pi` (fresh session)
2. Workflow-router detects `feature/` prefix
3. Sends message to start planning workflow
4. Agent reads `.ai/knowledge/` and plan file
5. Begins with interview stage

**Regression checks:**
- Should work for any branch starting with `feature/`
- Should not trigger on `main`, `hotfix/`, `chore/`, or unknown branches

---

## Scenario 4: Hotfix/Chore Branch

**Setup:** On a `hotfix/xxx` branch. Fresh session.

**Expected behaviour:**
1. Start `pi` (fresh session)
2. Workflow-router detects `hotfix/` prefix
3. Sends message to jump to implementation stage
4. Agent reads `.ai/knowledge/` and plan file
5. Begins with impact analysis

**Regression checks:**
- Same behaviour for `chore/` branches
- Skips planning stage entirely

---

## Scenario 5: Continued Session

**Setup:** On any branch. Resume a previous session (`pi -c` or select from session picker).

**Expected behaviour:**
1. Session starts with existing conversation
2. Setup-detector returns early (not a fresh session)
3. Workflow-router checks for existing user/assistant messages → found → returns early
4. No auto-workflow, no setup prompts — session continues normally

**Regression checks:**
- No prompt regardless of branch type
- No workflow message sent
- Should work on main, feature, hotfix, chore

---

## Scenario 6: Main Branch without Backlog

**Setup:** Project initialised but no `.ai/backlog/` directory or empty. On `main` branch.

**Expected behaviour:**
1. Start `pi` (fresh session)
2. Workflow-router detects `main` branch
3. No backlog files found → agent suggests `/skill:backlog-planning`
4. No auto-workflow

**Regression checks:**
- Should not silently do nothing (user should know about backlog-planning)

---

## Scenario 7: Dirty Branch Warning

**Setup:** On any branch with uncommitted changes. Fresh session.

**Expected behaviour:**
1. Workflow-router detects branch state (uncommitted, ahead/behind upstream)
2. For `feature/` branches: planning message includes note about uncommitted changes
3. For `hotfix/`/`chore/` branches: implementation message includes note
4. For `main`/unknown branches: warns about state and asks how to proceed

**Regression checks:**
- Warning should not block the workflow, only inform

---

## Scenario 8: Response Style Injection

**Setup:** Any fresh session.

**Expected behaviour:**
1. System prompt includes response style guidelines (direct, no praise, co-author convention, coding style)
2. Commit messages include `Co-authored-by:` line by default

**Regression checks:**
- Guidelines should appear in every session
- Should not duplicate if APPEND_SYSTEM.md also exists

---

## Scenario 9: OAuth Resolver

**Setup:** Agent needs to access an authenticated API during research.

**Expected behaviour:**
1. Agent calls `resolve_auth` tool for a service
2. Extension checks env vars first
3. If found → returns auth header
4. If not found and `promptUser: true` → asks user for token
5. If not found → returns "no credentials available"

**Regression checks:**
- Should handle `x` and `spotify` services
- Unknown services should return error
- Token cached for session duration

---

## Scenario 10: Regression Bisect

**Setup:** A project with git history where a feature that previously worked is now broken. Fresh session or continued session where the user reports the issue.

**Expected behaviour:**
1. User reports something stopped working
2. Agent uses `/skill:regression-bisect` instead of guessing
3. Agent asks when it last worked to establish known-good commit
4. Agent runs `git bisect` with the test that demonstrates the failure
5. When bisect finds the regression commit, agent examines the diff
6. Agent implements the fix based on identified cause
7. Agent commits with message referencing the regression commit SHA

**Regression checks:**
- Agent must not propose guesses at the cause before bisecting
- If no known-good commit can be identified, agent should ask user for one
- If the test is not scriptable, agent should guide user through manual bisect steps
