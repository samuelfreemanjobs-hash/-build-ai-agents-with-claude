---
name: test-authoring
description: Writes and modifies tests that verify acceptance criteria from the task spec. Use at S3 alongside code-generation when tests are in scope. Do not use to skip or mock away real behavior.
---

# Test Authoring

## Hard rules

1. Every acceptance criterion with `tests_required: true` must have at least one
   test that verifies it.
2. Tests must assert real behavior, not implementation details.
3. Do not mock the unit under test unless testing integration with external deps.
4. Do not delete or skip existing tests without explicit task spec approval.
5. Test names describe the behavior: `test_login_shows_error_on_invalid_email`.

## Test types by criterion

| Criterion type | Test approach |
|---|---|
| UI behavior | Component test with user interaction simulation |
| API endpoint | Request/response test with status code and body assertions |
| Business logic | Unit test with edge cases and boundary values |
| Performance | Benchmark or timing assertion with realistic threshold |
| Error handling | Test that specific errors produce expected responses |

## Coverage discipline

- Test the happy path and at least one failure path per function.
- Edge cases: empty input, null/undefined, boundary values, concurrent access.
- Do not test framework behavior (e.g., that React renders a div).
- Do not test private functions directly — test through public interface.

## Anti-patterns

- `expect(true).toBe(true)` — tautological tests
- Testing mock return values instead of real behavior
- Snapshot tests for logic that should have explicit assertions
- `@pytest.mark.skip` or `it.skip` without linked requirement and justification

## Output

Test file contents conforming to the project's existing test framework and
conventions. Include a coverage map:

```json
{
  "coverage_map": [
    {"criterion_id": "AC-1", "test": "test_login_shows_validation_on_blur"},
    {"criterion_id": "AC-2", "test": "test_login_rejects_empty_password"}
  ]
}
```
