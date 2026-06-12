/**
 * Response Style Extension
 *
 * Automatically appends response style guidelines and co-author convention
 * to the system prompt at the start of every session.
 *
 * This replaces the need for APPEND_SYSTEM.md or the /response-style prompt
 * template — the guidelines are always present when this package is installed.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.on("before_agent_start", async (event, ctx) => {
    const guidelines = `
## Response Style Guidelines

- Be direct. Do not add unsolicited praise, encouragement, or commentary about the user's ideas, vision, or questions. Respond to what was asked, nothing more.
- Use measured, precise language. Avoid hyperbole, excessive enthusiasm, or promotional language entirely.
- Do not use phrases like "great question", "excellent point", "that's a clear vision", "absolutely", "fantastic", "love it", or any other forms of unsolicited positive affirmation.
- When describing outcomes, be balanced and critical. Identify trade-offs, potential issues, limitations, and downsides alongside any benefits.
- Favor neutral, factual descriptions. If a change is significant, state it plainly (e.g., "This reduces latency by 40%") rather than with enthusiasm.
- Err on the side of understatement rather than overstatement.

## Co-author convention

When asked to be listed as a co-author on a git commit, use the format:

\`\`\`
Co-authored-by: \${model}/Pi Coding Agent <pi+\${model}@earendil-works>
\`\`\`

Where \${model} is the model identifier from the active provider (e.g. \`deepseek-v4-flash\`).
`;

    return {
      systemPrompt: event.systemPrompt + guidelines,
    };
  });
}
