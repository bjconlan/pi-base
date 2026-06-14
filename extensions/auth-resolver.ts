/**
 * Auth Resolver Extension
 *
 * Resolves authentication tokens for external service APIs.
 * Checks environment variables first, then offers to store
 * user-provided credentials for the session.
 *
 * Used by the assimilate-knowledge skill when accessing
 * authenticated APIs like X/Twitter or Spotify.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const sessionTokens: Record<string, string> = {};

// Known env vars for common services
const SERVICE_AUTH: Record<string, { envVars: string[]; header: (token: string) => string }> = {
  'x': {
    envVars: ["TWITTER_BEARER_TOKEN", "X_BEARER_TOKEN"],
    header: (token) => `Authorization: Bearer ${token}`,
  },
  spotify: {
    envVars: ["SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET"],
    header: () => "", // special handling via client credentials flow
  },
};

export default function (pi: ExtensionAPI) {
  // On session start, check env vars for known credentials
  pi.on("session_start", async () => {
    for (const [service, config] of Object.entries(SERVICE_AUTH)) {
      for (const envVar of config.envVars) {
        const val = process.env[envVar];
        if (val) {
          sessionTokens[service] = val;
          break;
        }
      }
    }
  });

  // Register a tool the agent can use to get auth headers
  pi.registerTool({
    name: "resolve_auth",
    label: "Resolve Auth",
    description:
      "Resolves authentication for an external service API. Call this before making authenticated requests. Supported services: x, spotify.",
    parameters: {
      type: "object",
      properties: {
        service: {
          type: "string",
          description: "Service name (x, spotify)",
        },
        promptUser: {
          type: "boolean",
          description: "If true, ask the user to provide credentials if none are found",
          default: false,
        },
      },
      required: ["service"],
    },
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const service = params.service as string;
      const promptUser = params.promptUser as boolean ?? false;

      const config = SERVICE_AUTH[service];
      if (!config) {
        return {
          content: [{ type: "text", text: `Unknown service: ${service}` }],
          details: {},
        };
      }

      // Check session cache first
      if (sessionTokens[service]) {
        const header = config.header(sessionTokens[service]);
        if (header) {
          return {
            content: [{ type: "text", text: header }],
            details: { resolved: true, source: "env" },
          };
        }
      }

      // Special handling for Spotify (needs client credentials flow)
      if (service === "spotify" && sessionTokens["spotify"]) {
        return {
          content: [{ type: "text", text: "Spotify requires client_id and client_secret for a token exchange. Run the OAuth flow manually if credentials are set." }],
          details: { resolved: false, note: "client_credentials" },
        };
      }

      // No credentials found
      if (promptUser && ctx.hasUI) {
        const answer = await ctx.ui.input(
          `Auth for ${service}`,
          `Enter your ${service} API token (or leave blank to skip):`,
        );
        if (answer) {
          sessionTokens[service] = answer;
          const header = config.header(answer);
          return {
            content: [{ type: "text", text: header }],
            details: { resolved: true, source: "user" },
          };
        }
      }

      return {
        content: [{ type: "text", text: `No credentials available for ${service}. Skipping.` }],
        details: { resolved: false },
      };
    },
  });
}
