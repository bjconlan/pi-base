---
name: setup
description: One-time project initialisation — AGENTS.md, README, git, .ai/ workspace, and session storage. Run once per project before starting feature work.
---

# Project Setup

Run this once when starting work on a new or untracked project. Skip it if the project already has an `AGENTS.md`.

---

## 1. AGENTS.md

If the project does not have an `AGENTS.md` file in its root, ask the user:

> "This project doesn't have an AGENTS.md yet — that's where I store project-level conventions, workflow definitions, and knowledge architecture. Would you like me to create one?"

If yes, present the available sections and ask which ones they'd like included:

> "I have a template with these possible sections:
>
> 1. **Project Lifecycle** — Defines the 3-stage workflow (planning → implementation → review).
> 2. **Plan & Spec Storage** — Where plans are saved (`.ai/{branch-type}/{branch-name}.md`).
> 3. **Knowledge Architecture** — Persistent project memory under `.ai/knowledge/`.
> 4. **Skill Routing** — Documents which skills are available and when to use them.
> 5. **Working Rules** — Effort matching, architecture analysis, research-before-action defaults.
> 6. **Guardrails** — Tool enforcement rules for read/write/execute operations.
>
> Which of these would you like?"

Read the template and adapt only the selected sections. Write it to `AGENTS.md`. Ask the user to review and adjust before committing.

If no, proceed without it.

---

## 2. README

If the project doesn't have a `README.md`, ask the user:

> "There's no README yet. Would you like me to create one?"

If yes, scan the project for manifest files to infer language, dependencies, and build commands, then ask the user only for what couldn't be deduced (project purpose, any gaps). Write it, ask for review, then commit.

---

## 3. Git

Check if the current directory is a git repository:

```bash
git rev-parse --git-dir 2>/dev/null
```

If not, ask the user:

> "This project isn't tracked with git. Would you like me to initialise a repo and set up a basic `.gitignore`?"

If yes: `git init`, create a `.gitignore` suited to the project type, and make an initial commit.

---

## 4. Workspace Directories

Create the `.ai/` directory structure:

```bash
mkdir -p .ai/knowledge/references .ai/knowledge/samples .ai/feature
```

Ask the user:

> "Would you like pi to store session logs in `.ai/history/` instead of the default location?"

If yes:

```bash
mkdir -p .ai/history
```

Write `.pi/settings.json`:

```json
{
  "sessionDir": "../.ai/history"
}
```

---

## 5. Workflow Questions

Ask the user:

> "Before we start, I'd like to understand how you work in this project:
> - Do you want multi-step verification plans for changes, or is a lighter check sufficient?
> - Are there any existing workflows or conventions I should follow?
> - Is there a preferred test framework or CI process?"

Document the answers in `AGENTS.md` (if it exists) or in a temporary note for the session.
