/**
 * Sudo Guard Extension
 *
 * Intercepts bash commands containing `sudo` and asks the user to
 * run them manually, since automated sudo authentication isn't
 * reliable in pi's TUI environment.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName !== "bash") return;

    const command = event.input.command as string;
    if (!/\bsudo\b/i.test(command)) return;

    ctx.ui.notify("This command requires sudo — ask the user to run it manually", "warning");

    const ok = await ctx.ui.confirm(
      "Sudo required",
      `The agent wants to run:\n\n${command}\n\nRun this manually in your terminal?`,
    );

    if (ok) {
      ctx.ui.notify(`Run: ${command}`, "info");
      return { block: true, reason: "User will run this command manually" };
    }

    return { block: true, reason: "Sudo command blocked by user" };
  });
}
