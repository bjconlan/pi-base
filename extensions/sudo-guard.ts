/**
 * Sudo Guard Extension
 *
 * Intercepts bash commands containing `sudo` and prompts the user
 * for authentication before allowing execution. Uses `sudo -v` to
 * validate credentials and cache them for the session, so subsequent
 * sudo commands don't re-prompt.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { execSync } from "node:child_process";

export default function (pi: ExtensionAPI) {
  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName !== "bash") return;

    const command = event.input.command as string;

    // Check for sudo usage
    if (!/\bsudo\b/i.test(command)) return;

    // Block dangerous patterns that bypass the password prompt
    if (/\bsudo\s+-S\b/i.test(command)) {
      ctx.ui.notify("Blocked: sudo -S reads passwords from stdin", "warning");
      return { block: true, reason: "sudo -S is not allowed (reads passwords from stdin)" };
    }

    if (/sudo\s+.*\bk(-[aA]|ill)\b/.test(command)) {
      ctx.ui.notify("Blocked: killing the sudo session is not allowed", "warning");
      return { block: true, reason: "sudo -k would break credential caching" };
    }

    // Prompt user for sudo authentication via the terminal
    ctx.ui.notify("Sudo required — prompting for password...", "warning");
    try {
      execSync("sudo -v", { stdio: "inherit", timeout: 30000 });
    } catch {
      return { block: true, reason: "Sudo authentication failed or was cancelled by user" };
    }

    ctx.ui.notify("Sudo authenticated — executing command", "info");
  });
}
