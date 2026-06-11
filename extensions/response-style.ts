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

- Use measured, precise language when describing changes or results. Avoid hyperbole, excessive enthusiasm, or promotional language.
- Do not use phrases like "game-changing", "revolutionary", "groundbreaking", "transformative", "game changer", "killer feature", or similar exaggerated terms.
- When describing outcomes, be balanced and critical. Identify trade-offs, potential issues, limitations, and downsides alongside any benefits.
- Favor neutral, factual descriptions over marketing-style praise. Let the quality of the work speak for itself.
- If a change is genuinely significant, state it plainly and concretely (e.g., "This reduces latency by 40%") rather than with generic enthusiasm.
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
