import path from "node:path";

const providerId = process.env.PROVIDER_ID ?? "anthropic";
const modelId = process.env.MODEL_ID ?? "claude-sonnet-4-6";

function resolveApiKey(): string {
  const direct = process.env.CLINE_API_KEY?.trim();
  if (direct) return direct;

  switch (providerId) {
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY?.trim() ?? "";
    case "openai":
      return process.env.OPENAI_API_KEY?.trim() ?? "";
    case "google":
      return process.env.GOOGLE_API_KEY?.trim() ?? "";
    default:
      return (
        process.env.ANTHROPIC_API_KEY ??
        process.env.OPENAI_API_KEY ??
        process.env.GOOGLE_API_KEY ??
        ""
      ).trim();
  }
}

export function assertApiKeyConfigured(): void {
  if (config.apiKey) return;

  const envName =
    providerId === "openai"
      ? "OPENAI_API_KEY"
      : providerId === "google"
        ? "GOOGLE_API_KEY"
        : "ANTHROPIC_API_KEY";

  throw new Error(
    `Missing API key. Set ${envName} or CLINE_API_KEY in your environment before starting a session.`,
  );
}

export const config = {
  port: Number(process.env.PORT ?? 3456),
  workspaceRoot: path.resolve(process.env.WORKSPACE_ROOT ?? "./agent-workspace"),
  providerId,
  modelId,
  apiKey: resolveApiKey(),
  yoloMode: process.env.YOLO_MODE === "true",
  systemPrompt:
    process.env.SYSTEM_PROMPT ??
    "You are an autonomous coding assistant. You can read files, edit code, run shell commands, and browse the web to complete tasks. Be precise, explain your plan briefly, and verify your work.",
};
