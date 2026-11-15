# Agent stack upgrade

Monorepo layering after the MarkTechPost-style split:

| Layer | Owner | This repo |
|-------|--------|-----------|
| **Framework** | Product orchestrator, schemas, HALT | `*/backend/*/_agent.py` |
| **Harness** | Tests, lint, security, pricing math | `*/scripts/*.py` via `HarnessRunner` |
| **MCP** | GitHub, Slack, ingest, CRM | `*/mcp/registry.yaml` + host MCP |

## Shared package: `agent-runtime`

```bash
pip install -e agent-runtime
```

Modules: `load_core_config`, `FrameworkPipeline`, `HarnessRunner`, `McpToolRouter`, `evaluate_stack_signals`, `LlmClient`.

## Environment

| Variable | Purpose |
|----------|---------|
| `AGENT_TOOL_TRANSPORT` | `harness` (default), `mcp`, or `auto` |
| `AGENT_MCP_BRIDGE` | Host-specific MCP JSON bridge (optional) |
| `AGENT_IMPLEMENTATION_HARNESS` | External coding harness URL/id (Cursor, Codex) for S3+ |
| `ANTHROPIC_API_KEY` | Live LLM; unset → mock |

## Reference product

**Software Developer Agent™** is wired first:

- `LLMClient` reads `agent/core-config.xml` primary/fallback models
- `VerificationRunner` uses `HarnessRunner`
- `McpToolRouter` loads `mcp/registry.yaml`
- Run start logs `evaluate_stack_signals()` for cost/safety hints

## Signals workflow

1. Maintain [`agent-runtime/signals/radar.yaml`](../agent-runtime/signals/radar.yaml) from [AI Dev Signals](https://www.aidevsignals.com/) / [AI Agents category](https://www.marktechpost.com/category/editors-pick/ai-agents/).
2. On each run (or CI daily), call `evaluate_stack_signals(core_config_path)`.
3. Act on `warn`/`critical`: model verification, harness for heavy steps, token observability.

## Rollout to other products

1. Add `mcp/registry.yaml` per product.
2. Replace duplicate `_run_script` with `HarnessRunner`.
3. Point `LlmClient` at `agent_runtime.LlmClient` + `core-config.xml`.
4. Wrap `execute_*` stages with `FrameworkPipeline.run_stage`.