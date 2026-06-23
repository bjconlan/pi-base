/**
 * Response Style Extension
 *
 * Automatically appends response style guidelines and co-author convention
 * to the system prompt at the start of every session.
 *
 * Tracks model changes across the session and resets co-author tracking
 * after each commit, so every commit lists all models that contributed.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

let modelsSinceLastCommit: Set<string> = new Set();
let currentModel = "";

export default function (pi: ExtensionAPI) {
  // Track model changes
  pi.on("model_select", async (event) => {
    currentModel = `${event.model.provider}/${event.model.id}`;
    modelsSinceLastCommit.add(currentModel);
  });

  // Seed with the initial model on session start
  pi.on("session_start", async (_event, ctx) => {
    if (ctx.model) {
      currentModel = `${ctx.model.provider}/${ctx.model.id}`;
      modelsSinceLastCommit.add(currentModel);
    }
  });

  // Detect commits and reset co-author tracking
  pi.on("tool_result", async (event) => {
    if (event.toolName === "bash" && !event.isError) {
      for (const block of event.content) {
        if (block.type === "text" && /^git commit/i.test(block.text.trim())) {
          modelsSinceLastCommit = new Set([currentModel]);
          return;
        }
      }
    }
  });

  // Inject guidelines into system prompt with current model list
  pi.on("before_agent_start", async (event) => {
    const models = Array.from(modelsSinceLastCommit);
    const coAuthors = models
      .map((m) => `Co-authored-by: ${m}/Pi Coding Agent <pi+${m}@earendil-works>`)
      .join("\n");

    const guidelines = `
## Co-author convention

Include co-author lines on all commits by default. List every model that has contributed since the last commit. Current contributors:

\`\`\`
${coAuthors}
\`\`\`

Use the format:
\`\`\`
Co-authored-by: {provider}/{model}/Pi Coding Agent <pi+{provider}/{model}@earendil-works>
\`\`\`

Only omit if the user explicitly asks not to include them. The co-author list resets after each commit - only models used since the last commit are included.

## Response Style Guidelines

- Be direct. Do not add unsolicited praise, encouragement, or commentary about the user's ideas, vision, or questions. Respond to what was asked, nothing more.
- Use measured, precise language. Avoid hyperbole, excessive enthusiasm, or promotional language entirely.
- Do not use phrases like "great question", "excellent point", "that's a clear vision", "absolutely", "fantastic", "love it", or any other forms of unsolicited positive affirmation.
- When describing outcomes, be balanced and critical. Identify trade-offs, potential issues, limitations, and downsides alongside any benefits.
- Favor neutral, factual descriptions. If a change is significant, state it plainly (e.g., "This reduces latency by 40%") rather than with enthusiasm.
- Err on the side of understatement rather than overstatement.

## Coding Style

- Prefer data-driven and functional style. Use data literals to make code self-documenting and easy to reason about.
- Avoid implicit mutations. If mutation is necessary, make it explicit and obvious at the call site.
- Favor pure functions, immutable data structures, and composition over inheritance or mutable state.

## Regression Handling

If something stopped working that previously worked, **do not guess.** Stop immediately. Use `/skill:regression-bisect` to find the exact commit that introduced the regression via `git bisect`. Guessing at the cause without evidence wastes time and LLM credits.
`;

    return {
      systemPrompt: event.systemPrompt + guidelines,
    };
  });
}
