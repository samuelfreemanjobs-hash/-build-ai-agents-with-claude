---
name: implementation-planning
description: Produces a structured implementation plan with file-level change mapping to requirement IDs. Use at S2 before any code generation. Do not use to write code or run verification.
---

# Implementation Planning

## Hard rules

1. Every file change maps to at least one requirement ID from the task spec.
2. New files require justification tied to a requirement — no speculative files.
3. Do not plan changes to protected paths without `approved: true` in task spec.
4. Plan includes test strategy: what tests to add/modify and which AC they verify.
5. Maximum `{config.max_files_per_run}` files per plan.

## Planning principles

- **Minimal diff:** change the fewest files needed to satisfy all criteria.
- **Follow existing patterns:** match naming, structure, and error handling.
- **Test first awareness:** plan tests alongside implementation, not as afterthought.
- **No drive-by refactors:** unrelated cleanup is out of scope unless requested.

## Plan structure

```json
{
  "approach_summary": "≤ 200 words",
  "file_changes": [
    {
      "path": "src/auth/login.ts",
      "action": "modify",
      "requirement_ids": ["AC-1", "AC-3"],
      "description": "Add blur validation handler"
    }
  ],
  "test_strategy": [
    {
      "path": "src/auth/login.test.ts",
      "action": "modify",
      "verifies": ["AC-1", "AC-3"]
    }
  ],
  "risks": ["Breaking change to LoginForm props"],
  "estimated_complexity": "low|medium|high"
}
```

## Risk flags

Automatically flag:
- API surface changes (public function signatures, route paths)
- Database schema migrations
- Dependency additions or version bumps
- Changes to authentication or authorization logic
- Removal of existing functionality

## Output

Conform to `schemas/implementation-plan.schema.json`.
