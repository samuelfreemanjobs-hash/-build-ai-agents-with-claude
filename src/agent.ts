import { mkdir } from "node:fs/promises";
import { ClineCore, type CoreSessionEvent } from "@cline/sdk";
import { config } from "./config.js";

let cline: ClineCore | null = null;

export async function getClineCore(): Promise<ClineCore> {
  if (cline) return cline;

  await mkdir(config.workspaceRoot, { recursive: true });

  cline = await ClineCore.create({
    clientName: "cline-agent-server",
    backendMode: "local",
  });

  return cline;
}

export function getAgentConfig() {
  return {
    providerId: config.providerId,
    modelId: config.modelId,
    apiKey: config.apiKey,
    systemPrompt: config.systemPrompt,
    cwd: config.workspaceRoot,
    workspaceRoot: config.workspaceRoot,
    enableTools: true,
    enableSpawnAgent: false,
    enableAgentTeams: false,
    yolo: config.yoloMode,
  };
}

export function formatSessionEvent(event: CoreSessionEvent): Record<string, unknown> {
  switch (event.type) {
    case "chunk":
      return {
        type: "chunk",
        sessionId: event.payload.sessionId,
        stream: event.payload.stream,
        text: event.payload.chunk,
      };
    case "agent_event":
      return {
        type: "agent_event",
        sessionId: event.payload.sessionId,
        event: event.payload.event,
      };
    case "status":
      return {
        type: "status",
        sessionId: event.payload.sessionId,
        status: event.payload.status,
      };
    case "ended":
      return {
        type: "ended",
        sessionId: event.payload.sessionId,
        reason: event.payload.reason,
      };
    default:
      return { type: event.type, payload: event.payload };
  }
}

export async function shutdownAgent(): Promise<void> {
  if (!cline) return;
  await cline.dispose();
  cline = null;
}
