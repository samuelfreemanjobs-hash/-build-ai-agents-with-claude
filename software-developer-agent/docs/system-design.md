# Software Developer Agent™ — System Design

**Version:** 0.1  
**Domain:** Software development — features, fixes, refactors  
**Operator model:** Human-in-the-loop at plan review, code review, and merge

---

## Architecture overview

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Task Intake │────►│ Orchestrator     │────►│ Code Changes    │
│ (S0)        │     │ (S0–S6 pipeline) │     │ (verified diff) │
└─────────────┘     └────────┬─────────┘     └────────┬────────┘
                             │                        │
                    ┌────────▼────────┐      ┌────────▼────────┐
                    │ Verification    │      │ Code Review     │
                    │ (tests/lint/sec)│      │ (6 dimensions)  │
                    └────────┬────────┘      └────────┬────────┘
                             │                        │
                    ┌────────▼────────────────────────▼────────┐
                    │ Run Log (schema-enforced traceability)   │
                    └────────────────────┬────────────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │ Engineer Review     │
                              │ (approve / revise)  │
                              └─────────────────────┘
```

### Core guarantee

**Every verification outcome traces to a script output.** The model cannot claim tests pass, lint is clean, or security scans are clear without deterministic script evidence.

---

## Pipeline

| Stage | Name | Mode | Human gate |
|-------|------|------|------------|
| S0 | Task intake | agent | — |
| S1 | Codebase analysis | deterministic | — |
| S2 | Implementation planning | agent | T2+ plan review |
| S3 | Code generation | agent | — |
| S4 | Verification | deterministic | — |
| S5 | Code review | agent | All tiers |
| S6 | Delivery | export | Merge approval |

---

## Deterministic modules

| Module | Purpose | HALT condition |
|--------|---------|----------------|
| `codebase_analyzer.py` | Detect languages, test/lint commands | No test command for T1+ |
| `test_runner.py` | Execute test suite | Any test failure |
| `lint_validator.py` | Run lint checks | Error-severity issues |
| `security_scanner.py` | Pattern-based secret/vuln scan | Critical/high findings |
| `dependency_checker.py` | Known vulnerability check | High-severity vulns (T2+) |

---

## Skills

| Skill | Stage | Purpose |
|-------|-------|---------|
| `task-intake` | S0 | Extract testable acceptance criteria |
| `codebase-context` | S1 | Interpret analyzer output |
| `implementation-planning` | S2 | File-level change plan |
| `code-generation` | S3 | Generate code matching plan |
| `test-authoring` | S3 | Write verification tests |
| `code-review-evaluator` | S5 | Score and defect classification |

---

## Tiering

| Tier | Scope | Verification | Review |
|------|-------|-------------|--------|
| T0 | Single-file fix | tests + lint | optional |
| T1 | Small feature (≤5 files) | tests + lint + security | PR review |
| T2 | Multi-file / API changes | full suite | PR + arch review |
| T3 | Cross-service / auth / payment | full + dependency audit | security sign-off |
