# Cline Agent Server

Autonomous coding agent server powered by the [Cline SDK](https://cline.bot/sdk). Run a self-hosted agent on your server with a web UI and HTTP API for file edits, shell commands, web browsing, and custom tools.

## Requirements

- Node.js 22+
- An API key for your model provider (Anthropic, OpenAI, Google, or Cline)

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and add your API key:

```bash
cp .env.example .env
```

3. Start the server:

```bash
npm run dev
```

4. Open the web UI at [http://localhost:3456](http://localhost:3456).

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3456` | HTTP server port |
| `WORKSPACE_ROOT` | `./agent-workspace` | Directory the agent can read and write |
| `PROVIDER_ID` | `anthropic` | LLM provider (`anthropic`, `openai`, `google`, `cline`) |
| `MODEL_ID` | `claude-sonnet-4-6` | Model identifier for the provider |
| `ANTHROPIC_API_KEY` | — | Anthropic API key |
| `OPENAI_API_KEY` | — | OpenAI API key |
| `GOOGLE_API_KEY` | — | Google API key |
| `CLINE_API_KEY` | — | Cline provider API key (overrides provider-specific keys) |
| `YOLO_MODE` | `false` | When `true`, tools run without approval prompts |
| `SYSTEM_PROMPT` | built-in default | Custom system prompt for the agent |

## API

### Start a session

```bash
curl -X POST http://localhost:3456/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Create a hello world Express app in this workspace"}'
```

### Send a follow-up message

```bash
curl -X POST http://localhost:3456/api/sessions/<sessionId>/messages \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Add tests for the new route"}'
```

### Stream session events (SSE)

```bash
curl -N http://localhost:3456/api/sessions/<sessionId>/stream
```

### Other endpoints

- `GET /api/health` — health check
- `GET /api/config` — non-secret server configuration
- `GET /api/sessions` — list recent sessions
- `GET /api/sessions/:id` — session metadata
- `POST /api/sessions/:id/abort` — abort the current tool/turn
- `POST /api/sessions/:id/stop` — stop the session

## What you get from `@cline/sdk`

The Cline SDK provides:

- **ClineCore** — full runtime with built-in tools (`bash`, file editor, search, web fetch), session persistence, and checkpoints
- **Agent** — lightweight stateless agent loop for custom integrations
- **LLM providers** — Anthropic, OpenAI, Google, Bedrock, Mistral, and more
- **MCP support** — connect external tools via Model Context Protocol

This server uses `ClineCore` so the agent can autonomously edit files and run commands in `WORKSPACE_ROOT`.

## Production notes

- Set `YOLO_MODE=true` only if you trust the agent with full workspace access.
- Run behind a reverse proxy (nginx, Caddy) with authentication.
- Mount `WORKSPACE_ROOT` to the project directory you want the agent to modify.
- Use `npm start` for production; `npm run dev` enables hot reload via `tsx watch`.

## Learn more

- [Cline SDK docs](https://docs.cline.bot/sdk/clinecore)
- [Cline SDK on npm](https://www.npmjs.com/package/@cline/sdk)
- [GitHub repository](https://github.com/cline/cline)
