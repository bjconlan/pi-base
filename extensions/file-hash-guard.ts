/**
 * File Hash Guard Extension
 *
 * Tracks content hashes for files the agent reads, then warns before
 * write/edit calls if the file changed externally.  Shows the proposed
 * content and asks the user to allow or deny.
 *
 * Install: place in ~/.pi/agent/extensions/ and run /reload.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

export default function (pi: ExtensionAPI) {
	// ---------------------------------------------------------------------------
	//  State
	// ---------------------------------------------------------------------------
	const fileHashes = new Map<string, string>();

	function computeHash(filePath: string): string | null {
		try {
			if (!existsSync(filePath)) return null;
			return createHash("md5").update(readFileSync(filePath)).digest("hex");
		} catch {
			return null;
		}
	}

	function shortPath(absPath: string): string {
		try {
			const cwd = process.cwd();
			if (absPath.startsWith(cwd)) return "." + absPath.slice(cwd.length);
		} catch {
			// ignore
		}
		return absPath;
	}

	// ---------------------------------------------------------------------------
	//  Read — store hash
	// ---------------------------------------------------------------------------
	pi.on("tool_call", async (event, ctx) => {
		if (event.toolName !== "read") return;
		if (!event.input.path) return;

		const hash = computeHash(event.input.path as string);
		if (hash) fileHashes.set(event.input.path as string, hash);
	});

	// ---------------------------------------------------------------------------
	//  Write / Edit — compare hash, show proposed content, ask
	// ---------------------------------------------------------------------------
	pi.on("tool_call", async (event, ctx) => {
		if (event.toolName !== "write" && event.toolName !== "edit") return;

		const filePath = event.input.path as string;
		const storedHash = fileHashes.get(filePath);
		if (!storedHash) return; // never read this file

		const currentHash = computeHash(filePath);
		if (!currentHash || currentHash === storedHash) return; // unchanged

		const rel = shortPath(filePath);

		// Build a human-readable summary of what the agent wants to do
		let proposed: string;
		if (event.toolName === "write") {
			const content = event.input.content as string;
			if (content.length <= 2000) {
				proposed = `Write:\n\`\`\`\n${content}\n\`\`\``;
			} else {
				proposed = `Write (${content.length} chars, showing first 2000):\n\`\`\`\n${content.slice(0, 2000)}\n…\n\`\`\``;
			}
		} else {
			// edit — show each old → new snippet
			const edits = event.input.edits as Array<{ oldText: string; newText: string }>;
			const parts = edits.map((e, i) => {
				const oldSnippet = e.oldText.length > 200 ? e.oldText.slice(0, 200) + "…" : e.oldText;
				const newSnippet = e.newText.length > 200 ? e.newText.slice(0, 200) + "…" : e.newText;
				return `Edit #${i + 1}:\n  replace: "${oldSnippet}"\n  with:   "${newSnippet}"`;
			});
			proposed = parts.join("\n\n");
		}

		if (!ctx.hasUI) return; // non-interactive: no file should change between turns

		ctx.ui.notify(`[guard] "${rel}" changed externally — review proposed write`, "warning");
		const ok = await ctx.ui.confirm(
			`"${rel}" changed externally`,
			`${proposed}\n\nAllow the agent to write this to "${rel}"?`,
		);
		if (!ok) {
			return { block: true, reason: `User denied write to "${rel}" (file changed externally)` };
		}
	});

	// ---------------------------------------------------------------------------
	//  Write / Edit result — update hash after successful write
	// ---------------------------------------------------------------------------
	pi.on("tool_result", async (event, _ctx) => {
		if (event.toolName !== "write" && event.toolName !== "edit") return;
		if (event.isError) return;

		const filePath = event.input.path as string;
		if (!filePath) return;

		const hash = computeHash(filePath);
		if (hash) {
			fileHashes.set(filePath, hash);
		}
	});
}
