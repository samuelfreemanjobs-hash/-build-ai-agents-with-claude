---
name: codebase-context
description: Interprets deterministic codebase analysis output to identify relevant modules, patterns, and conventions for the current task. Use at S1 after codebase_analyzer.py runs. Do not use to generate code or make architectural decisions.
---

# Codebase Context

## Hard rules

1. Report only what `codebase_analyzer.py` returned. Do not invent file paths,
   test commands, or dependency versions.
2. Identify similar existing code the implementation should follow.
3. Flag missing test infrastructure for tier T1+ tasks.
4. Note protected paths that appear in the change scope.

## Analysis focus

Given the task spec and analyzer output, produce:

- **Relevant modules:** files and directories most likely to change
- **Patterns to follow:** naming, error handling, test structure from existing code
- **Entry points:** where new code should integrate (routes, handlers, components)
- **Test commands:** exact command from analyzer output, not guessed
- **Risks:** circular dependencies, missing types, inconsistent patterns

## Similar code discovery

Search the analyzer's file tree for:
- Functions/classes with similar names to what the task requires
- Test files matching the target module's naming convention
- Import patterns used in the same package

Report paths with line references where patterns exist.

## Output

Structured context object referencing analyzer fields. Do not return raw
analyzer JSON — interpret it for the implementation planner.
