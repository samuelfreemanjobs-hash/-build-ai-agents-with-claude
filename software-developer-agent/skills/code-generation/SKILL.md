---
name: code-generation
description: Generates code changes conforming to an approved implementation plan. Use at S3 after plan validation. Do not use for planning, verification, or review.
---

# Code Generation

## Hard rules

1. Generate only files listed in the implementation plan.
2. Match existing code style: indentation, naming, imports, error handling.
3. No secrets, credentials, or realistic-looking API keys — use env var references.
4. No commented-out code blocks without a linked requirement ID.
5. No disabling existing tests to make new code pass.

## Style matching

Before writing each file, read the existing file (if modifying) or a similar
file in the same directory (if creating). Match:
- Import ordering and grouping
- Function/class naming conventions
- Error handling patterns (try/catch, Result types, error enums)
- Comment density (match the file — don't over-document or under-document)
- Test structure (describe/it, test_, #[test], etc.)

## Change discipline

- Implement one file change at a time in plan order.
- Each change should be independently understandable in a PR diff.
- Prefer extending existing functions over creating parallel implementations.
- Keep functions focused — if a function exceeds 50 lines, consider splitting
  only if the task spec requires it.

## Forbidden patterns

- `// TODO: fix later` without requirement ID
- `any` type in TypeScript unless the codebase already uses it extensively
- Bare `except:` in Python
- `console.log` left in production code paths
- Hardcoded URLs, ports, or connection strings

## Output

File contents ready to write. Include a change manifest:

```json
{
  "files": [
    {
      "path": "src/auth/login.ts",
      "action": "modify",
      "requirement_ids": ["AC-1"],
      "lines_changed": 23
    }
  ]
}
```
