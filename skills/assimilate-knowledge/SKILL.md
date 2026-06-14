---
name: assimilate-knowledge
description: |
  Researches a topic across multiple sources to build up-to-date knowledge
  beyond the agent's training data. Searches YouTube, podcasts, Reddit,
  social media, and articles. Saves findings to .ai/knowledge/references/
  for use across all future sessions.
  Triggered automatically during project init, backlog planning, and
  branch planning when a topic would benefit from current information.
---

# Assimilate Knowledge

When a topic needs current information — a new technology, library version, API change, or emerging pattern — research it across available sources before proceeding.

---

## Sources to check

Try these in order of usefulness for the topic:

### YouTube
Search for relevant talks, tutorials, or conference presentations. If the `youtube-transcript` skill is installed, fetch transcripts for the most relevant videos and summarise them.

Search query: `site:youtube.com <topic> talk|tutorial|conference 2024|2025|2026`

### Reddit
Search for discussions, comparisons, and real-world experiences.

Search query: `site:reddit.com <topic> "experience"|"review"|"comparison"|"vs"` or browse relevant subreddits directly.

### Articles and blogs
Search for recent articles, release notes, and technical deep-dives.

Search query: `<topic> "release notes"|"getting started"|"tutorial" 2025|2026`

### X / Twitter and BlueSky
Search for announcements, discussions, and links to relevant content.

Search query: `site:x.com <topic>` or `site:bsky.app <topic>`

### Substack
Search for in-depth analysis and opinion pieces.

Search query: `site:substack.com <topic>`

### Spotify podcasts
If you can identify relevant podcast episodes, note them for the user to review.

---

## What to extract

For each source, capture:

- **Key findings** — what did you learn that's relevant to the current task?
- **Version or date context** — when was this information published? Is it still current?
- **Contradictions or disagreements** — do sources disagree on best practices?
- **Practical tips** — gotchas, configuration advice, migration paths

---

## Save results

Write a summary to `.ai/knowledge/references/<topic>-research.md`:

```markdown
# Research: <topic>

## Date
<date of research>

## Sources consulted
- YouTube: <links>
- Reddit: <links>
- Articles: <links>
- Other: <links>

## Key findings
...

## Relevance to current work
...

## Open questions
...
```

If the topic is a direct dependency or technology choice for the project, also note it in `glossary.md` with a reference link.

---

## When to trigger

Use this when:

- The user mentions a technology, library, or pattern you're unfamiliar with or uncertain about
- The project's tech stack would benefit from current best-practice information
- During **project initialisation**, after the tech stack is discussed — research unfamiliar components
- During **backlog planning**, when a feature depends on a specific technology choice
- During **branch planning**, when the feature requires a technology decision

If you have web search available, use it. If not, ask the user if they want to enable it or can provide initial links to start from.
