/**
 * Sudo Guard Extension
 *
 * Intercepts bash commands containing `sudo` and prompts the user
 * for authentication before allowing execution. Reads the password
 * via a masked input prompt, then caches credentials with `sudo -v`
 * so subsequent sudo commands don't re-prompt.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { execSync, spawnSync } from "node:child_process";
import { createInterface } from "node:readline";

export default function (pi: ExtensionAPI) {
  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName !== "bash") return;

    const command = event.input.command as string;
    if (!/\bsudo\b/i.test(command)) return;

    // Block dangerous patterns
    if (/\bsudo\s+-S\b/i.test(command)) {
      ctx.ui.notify("Blocked: sudo -S reads passwords from stdin", "warning");
      return { block: true, reason: "sudo -S is not allowed (reads passwords from stdin)" };
    }
    if (/sudo\s+.*\bk(-[aA]|ill)\b/.test(command)) {
      ctx.ui.notify("Blocked: killing the sudo session is not allowed", "warning");
      return { block: true, reason: "sudo -k would break credential caching" };
    }

    ctx.ui.notify("Sudo required — enter your password below", "warning");

    // Check if already authenticated
    try {
      execSync("sudo -n true", { timeout: 3000, stdio: "ignore" });
      return; // already have a valid ticket
    } catch { /* needs password */ }

    // Read password with masked input
    const password = await readPassword("Password for sudo: ");
    if (password === null) {
      return { block: true, reason: "Sudo authentication cancelled by user" };
    }

    // Authenticate with sudo -S (internal use only)
    try {
      const result = spawnSync("sudo", ["-S", "-v"], {
        input: `${password}\n`,
        stdio: ["pipe", "inherit", "pipe"],
        timeout: 10000,
      });

      if (result.status !== 0) {
        const stderr = result.stderr?.toString() || "";
        ctx.ui.notify(`Sudo authentication failed: ${stderr.trim() || "incorrect password"}`, "error");
        return { block: true, reason: "Sudo authentication failed" };
      }
    } catch {
      return { block: true, reason: "Sudo authentication failed" };
    }

    ctx.ui.notify("Sudo authenticated — executing command", "info");
  });
}

function readPassword(prompt: string): Promise<string | null> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Store the original write function
    const stdoutWrite = process.stdout.write.bind(process.stdout);

    // Write the prompt manually
    stdoutWrite(prompt);

    // Set raw mode for character-by-character input with masking
    const isRaw = process.stdin.isRaw;
    try { process.stdin.setRawMode?.(true); } catch { /* non-TTY */ }

    let input = "";
    process.stdin.on("data", function handler(chunk) {
      const char = chunk.toString();

      if (char === "\x03") { // Ctrl+C
        process.stdin.removeListener("data", handler);
        try { process.stdin.setRawMode?.(!!isRaw); } catch {}
        rl.close();
        resolve(null);
        return;
      }

      if (char === "\r" || char === "\n") { // Enter
        process.stdin.removeListener("data", handler);
        try { process.stdin.setRawMode?.(!!isRaw); } catch {}
        stdoutWrite("\n");
        rl.close();
        resolve(input);
        return;
      }

      if (char === "\x7f" || char === "\b") { // Backspace
        if (input.length > 0) {
          input = input.slice(0, -1);
          stdoutWrite("\b \b"); // erase last *
        }
        return;
      }

      // Regular character
      input += char;
      stdoutWrite("*");
    });
  });
}
