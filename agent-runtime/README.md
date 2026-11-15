# Agent runtime

Shared layer for all factory agents:

| Module | Role |
|--------|------|
| `config` | Load environmental gates from `agent/core-config.xml` (models, limits, paths) |
| `orchestration` | Framework-style stage runner (timings, run log fragments) |
| `harness` | Subprocess execution for implementation-heavy deterministic steps |
| `mcp` | Standard tool routing: harness script **or** MCP namespace/tool |
| `signals` | Model/infra radar — compare your config to curated MarkTechPost watch items |
| `llm` | Anthropic client using primary/fallback models from core-config + token signals |

## Install

```bash
cd agent-runtime && pip install -e ".[dev]"
```

## Layers

```
Product orchestrator (framework)
    → agent_runtime.run_stage / FrameworkPipeline
    → HarnessRunner (scripts/*.py) for heavy deterministic work
    → McpToolRouter for integrations (MCP when available, harness fallback)
    → StackSignals before/after runs (faster, cheaper, safer model & infra hints)
```

See [`/workspace/docs/agent-stack.md`](../docs/agent-stack.md) for the monorepo-wide upgrade guide.