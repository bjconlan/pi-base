/**
 * Date Discipline Extension
 *
 * Ensures every session knows the current date and dates NEW entries in
 * `.ai/` records — decision register (decisions.md), plan/verify files
 * (.ai/feature/*.md), backlog (.ai/backlog/*.md), architecture/glossary
 * updates — with the date of creation, never a date copied from nearby
 * existing entries (a recurring failure mode: agents match the surrounding
 * convention and backdate new entries).
 *
 * Part of the pi-base package (extensions dir); takes effect on the next
 * session start.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.on("before_agent_start", async (event) => {
    const now = new Date();
    const iso = now.toISOString(); // UTC, e.g. 2026-08-13T01:15:00.000Z
    const dateOnly = iso.slice(0, 10); // 2026-08-13

    const discipline = `
## Date Discipline

The current date is **${dateOnly}** (UTC ISO: ${iso}).

When you create dated entries in \`.ai/\` records — decision register
(\`.ai/knowledge/decisions.md\`), plan/verify files (\`.ai/feature/*.md\`,
\`.ai/feature/*.verify.md\`), backlog files (\`.ai/backlog/*.md\`), and
architecture/glossary updates — always date them with **today's date** (the
date of creation), never a date copied from nearby existing entries. If
unsure, run \`date -u +%Y-%m-%d\`. Historical records keep their original
dates; only NEW entries get today's date.
`;

    return {
      systemPrompt: event.systemPrompt + discipline,
    };
  });
}
