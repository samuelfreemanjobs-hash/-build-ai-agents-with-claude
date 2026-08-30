import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { URL } from "node:url";
import { z } from "zod";
import { type CoreSessionEvent } from "@cline/sdk";
import {
  formatSessionEvent,
  getAgentConfig,
  getClineCore,
  shutdownAgent,
} from "./agent.js";
import { assertApiKeyConfigured, config } from "./config.js";
import { HTML } from "./ui.js";

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const StartSessionSchema = z.object({
  prompt: z.string().min(1, "prompt is required"),
  interactive: z.boolean().optional(),
});

const SendMessageSchema = z.object({
  prompt: z.string().min(1, "prompt is required"),
});

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(body));
}

async function readJson<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    throw new HttpError(400, "Request body is required");
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
}

function matchPath(pathname: string, pattern: string): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    const part = patternParts[i];
    const value = pathParts[i];
    if (part.startsWith(":")) {
      params[part.slice(1)] = value;
    } else if (part !== value) {
      return null;
    }
  }

  return params;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://localhost:${config.port}`);
    const method = req.method ?? "GET";

    if (method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end();
      return;
    }

    if (method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(HTML);
      return;
    }

    if (method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, {
        ok: true,
        providerId: config.providerId,
        modelId: config.modelId,
        workspaceRoot: config.workspaceRoot,
      });
      return;
    }

    if (method === "GET" && url.pathname === "/api/config") {
      sendJson(res, 200, {
        providerId: config.providerId,
        modelId: config.modelId,
        workspaceRoot: config.workspaceRoot,
        yoloMode: config.yoloMode,
        hasApiKey: Boolean(config.apiKey),
      });
      return;
    }

    if (method === "GET" && url.pathname === "/api/sessions") {
      const cline = await getClineCore();
      const limit = Number(url.searchParams.get("limit") ?? 20);
      const sessions = await cline.list(limit);
      sendJson(res, 200, { sessions });
      return;
    }

    const streamMatch = matchPath(url.pathname, "/api/sessions/:sessionId/stream");
    if (method === "GET" && streamMatch) {
      const sessionId = streamMatch.sessionId;
      const cline = await getClineCore();

      res.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });

      const sendEvent = (payload: Record<string, unknown>) => {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      };

      sendEvent({ type: "connected", sessionId });

      const unsubscribe = cline.subscribe((event: CoreSessionEvent) => {
        if ("payload" in event && "sessionId" in event.payload) {
          if (event.payload.sessionId !== sessionId) return;
        }

        sendEvent(formatSessionEvent(event));
      });

      req.on("close", () => {
        unsubscribe();
      });
      return;
    }

    const sessionMatch = matchPath(url.pathname, "/api/sessions/:sessionId");
    if (method === "GET" && sessionMatch) {
      const cline = await getClineCore();
      const session = await cline.get(sessionMatch.sessionId);
      if (!session) {
        throw new HttpError(404, "Session not found");
      }
      sendJson(res, 200, { session });
      return;
    }

    const messagesMatch = matchPath(url.pathname, "/api/sessions/:sessionId/messages");
    if (method === "POST" && messagesMatch) {
      assertApiKeyConfigured();
      const input = SendMessageSchema.parse(await readJson(req));
      const cline = await getClineCore();
      const result = await cline.send({
        sessionId: messagesMatch.sessionId,
        prompt: input.prompt,
      });
      sendJson(res, 200, { sessionId: messagesMatch.sessionId, result });
      return;
    }

    const abortMatch = matchPath(url.pathname, "/api/sessions/:sessionId/abort");
    if (method === "POST" && abortMatch) {
      const cline = await getClineCore();
      await cline.abort(abortMatch.sessionId);
      sendJson(res, 200, { ok: true });
      return;
    }

    const stopMatch = matchPath(url.pathname, "/api/sessions/:sessionId/stop");
    if (method === "POST" && stopMatch) {
      const cline = await getClineCore();
      await cline.stop(stopMatch.sessionId);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (method === "POST" && url.pathname === "/api/sessions") {
      assertApiKeyConfigured();
      const input = StartSessionSchema.parse(await readJson(req));
      const cline = await getClineCore();

      const session = await cline.start({
        prompt: input.prompt,
        interactive: input.interactive ?? false,
        config: getAgentConfig(),
      });

      sendJson(res, 200, {
        sessionId: session.sessionId,
        result: session.result,
      });
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Unknown error";
    sendJson(res, status, { error: message });
  }
});

server.listen(config.port, () => {
  console.log(`Cline agent server running at http://localhost:${config.port}`);
  console.log(`Workspace: ${config.workspaceRoot}`);
  console.log(`Model: ${config.providerId}/${config.modelId}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    console.log(`Received ${signal}, shutting down...`);
    await shutdownAgent();
    server.close(() => process.exit(0));
  });
}
