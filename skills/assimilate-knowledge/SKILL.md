---
name: assimilate-knowledge
description: |
  Researches a topic across multiple sources to build up-to-date knowledge
  beyond the agent's training data. Searches YouTube, Reddit, articles,
  social media, and podcasts. Saves findings to .ai/knowledge/references/
  for use across all future sessions.
---

# Assimilate Knowledge

When a topic needs current information — a new technology, library version, API change, or emerging pattern — research it across available sources before proceeding.

---

## 1. Scope the research with the user

Before searching, tell the user what you're planning to research and why:

> "I'm going to research {topic} to understand {reason}."

Then ask:

- "Are there specific aspects you want me to focus on?"
- "Do you follow any particular people, accounts, or publications on this topic whose content you trust?"
- "Are there any specialised forums, sites, or communities relevant to this field?"

Refine your search terms based on their answers.

---

## 2. Search sources

Use the available tooling (bash with curl, web search, or installed skills) to find relevant content. For each source, present what you found before consuming it.

### Web search (if available)

For most sources, a general web search using `site:` directives is the most practical approach:

```bash
# General research
# Try: "latest {topic} 2025", "{topic} best practices", "{topic} tutorial"
```

### YouTube

Search for talks, tutorials, and conference presentations:

```bash
# Via web search
# site:youtube.com {topic} talk|tutorial|conference 2025|2026

# To fetch a transcript once you have a video URL, extract the video ID
# and use the public transcript API:
# VIDEO_ID=$(echo "$URL" | grep -oP '(?<=v=|youtu\.be/)[a-zA-Z0-9_-]{11}')
# curl -s "https://youtubetranscript.com/?v=$VIDEO_ID&format=json" | \
#   python3 -c "import json,sys; data=json.load(sys.stdin); [print(f'[{e[\"offset\"]}] {e[\"text\"]}') for e in data]" 2>/dev/null || echo "Transcript not available"
```

### Reddit

Search for discussions and real-world experiences via the public JSON API (no auth required):

```bash
# Search Reddit via web search
# site:reddit.com {topic}

# Or use the public API directly:
# curl -s "https://www.reddit.com/search.json?q={topic}&limit=10&sort=relevance"
# curl -s "https://www.reddit.com/r/{subreddit}/search.json?q={topic}&limit=10&sort=relevance"
```

### BlueSky

Has a public search API that works without authentication:

```bash
# curl -s "https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?q={topic}&limit=10"
# curl -s "https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?q={topic}&limit=10&author={handle}"
```

### Substack

Search via web search:

```bash
# site:substack.com {topic}
```

### Articles and blogs

General web search for recent technical content:

```bash
# site:dev.to {topic}
# site:medium.com {topic}
# Or general: {topic} "release notes"|"getting started" 2025|2026
```

### X and Spotify podcasts

These platforms require API credentials. Use the `resolve_auth` tool (from the oauth-resolver extension) to check for credentials and get the auth header:

```
# The agent calls: resolve_auth(service: "x", promptUser: true)
# If a token is found, it returns the Authorization header to use with curl
# Then: curl -s -H "<auth-header>" "https://api.x.com/2/tweets/search/recent?query={topic}&max_results=10"

# For Spotify:
# resolve_auth(service: "spotify", promptUser: true)
# Note: Spotify requires client_id + client_secret via OAuth, not a simple token
```

If credentials aren't available, the other sources (YouTube, Reddit, BlueSky, articles) usually cover most topics.

---

## 3. Consume content

For each source retrieved:

- **Web pages and articles** — read the content via `curl` or the read tool
- **YouTube videos** — fetch the transcript via the public transcript API (see YouTube section above) and summarise it
- **Reddit threads** — read the post and top comments via the JSON API:

  ```bash
  # After finding a thread URL, fetch its content:
  # curl -s "https://www.reddit.com/r/{subreddit}/comments/{id}.json"
  ```

- **BlueSky posts** — read the thread content from the search results (results include post text)

For each source, capture:

- **Key findings** — what's relevant to the current task
- **Version or date context** — when was this published? Still current?
- **Contradictions** — do sources disagree?
- **Practical tips** — gotchas, configuration advice, migration paths

---

## 4. Review sources with the user

Before saving, present the gathered sources to the user:

> "I found the following sources on {topic}. Would you like to exclude any?"

List each source with:

- Title and link
- Author/publisher (if identifiable)
- Why it's relevant

Let the user:

- **Remove** sources they don't trust or consider biased
- **Flag** specific parts to ignore
- **Add** sources they think are missing

---

## 5. Save results

Write a summary to `.ai/knowledge/references/<topic>-research.md`:

```markdown
# Research: <topic>

## Date
<date>

## Sources consulted
- YouTube: <links>
- Reddit: <links>
- Articles: <links>
- BlueSky/other: <links>

## Key findings
...

## Relevance to current work
...

## Open questions
...
```

If the topic is a direct dependency or technology choice, also note it in `glossary.md` with a reference link.

---

## When to trigger

Use this when:

- The user mentions a technology, library, or pattern you're unfamiliar with
- The project's tech stack would benefit from current best-practice information
- During **project initialisation**, after the tech stack is discussed
- During **backlog planning**, when a feature depends on a specific technology
- During **branch planning**, when the feature requires a technology decision

If you don't have web search available, ask the user if they can provide initial links to start from.
