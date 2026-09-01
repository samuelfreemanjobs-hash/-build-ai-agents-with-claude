# Linear integration

This repo includes the [Linear Cursor plugin](https://github.com/linear/cursor-plugin) via workspace MCP configuration.

## Setup

1. **MCP server** — configured in [`.cursor/mcp.json`](../.cursor/mcp.json) (official Linear plugin format):

```json
{
  "linear": {
    "url": "https://mcp.linear.app/mcp",
    "transport": "http"
  }
}
```

2. **Authenticate** — in Cursor Desktop: **Settings → Tools & MCP → Linear**, complete OAuth with your Linear workspace
3. **Verify** — ask the agent to list Linear teams or search issues

Alternatively install from **Settings → Plugins → Browse Marketplace → Linear** (same MCP endpoint).

## What you can do

- Create and update issues, projects, and documents
- Search your Linear workspace from agent sessions
- Use Cloud Agent subscriptions for issue state changes (`cursor-subscriptions` → `subscribe_linear_issue`)

## Cloud Agents

Cloud Agent runs need the Linear MCP authenticated in your Cursor account. If tools show `needsAuth`, open Cursor Desktop and complete OAuth under **Tools & MCP**.

For egress-restricted environments, ensure `https://mcp.linear.app` is allowed in the environment network policy.

## Related

- Linear docs: https://linear.app/docs
- Plugin repo: https://github.com/linear/cursor-plugin
