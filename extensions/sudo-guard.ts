/**
 * Sudo Guard Extension
 *
 * Intercepts bash commands containing `sudo` and hands password
 * prompting directly to the native `sudo -v` via the terminal.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { spawnSync } from "node:child_process";

export default function (pi: ExtensionAPI) {
  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName !== "bash") return;

    const command = event.input.command as string;
    if (!/\bsudo\b/i.test(command)) return;

    if (/\bsudo\s+-S\b/i.test(command)) {
      ctx.ui.notify("Blocked: sudo -S reads passwords from stdin", "warning");
      return { block: true, reason: "sudo -S is not allowed" };
    }
    if (/sudo\s+.*\bk(-[aA]|ill)\b/.test(command)) {
      ctx.ui.notify("Blocked: killing the sudo session is not allowed", "warning");
      return { block: true, reason: "sudo -k would break credential caching" };
    }

    // Check if already authenticated
    const check = spawnSync("sudo", ["-n", "true"], {
      timeout: 3000,
      stdio: "ignore",
    });
    if (check.status === 0) return;

    ctx.ui.notify("Sudo required — authenticate in your terminal...", "warning");

    // Hand control to native sudo -v via the terminal
    const result = spawnSync("sudo", ["-v"], {
      stdio: "inherit",
      shell: true,
      timeout: 30000,
    });

    if (result.status !== 0) {
      return { block: true, reason: "Sudo authentication failed or was cancelled" };
    }

    ctx.ui.notify("Sudo authenticated — executing command", "info");
  });
}
