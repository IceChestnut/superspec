---
name: superspec-apply-change
description: Explicit enhanced implementation for Superspec compatibility mode. Use when the user wants worktrees, TDD, and review-backed execution instead of native openspec-apply-change alone.
license: MIT
compatibility: Requires OpenSpec CLI and Superpowers execution discipline.
---

Use this skill when the user explicitly chooses the enhanced Superspec implementation path.

`superspec-apply-change` is not a hidden override of native `openspec-apply-change`. It is the compatibility-mode entry point for stronger execution discipline.

## Behavior

1. Resolve the active change. If the target change is ambiguous, ask the user to choose it.
2. Read `tasks.md`, `specs/`, `design.md` if present, and `plan.md` if it exists.
3. If no `plan.md` exists, decide with the user whether to create one first via `superspec-plan` or proceed directly.
4. Execute implementation with isolated workspace discipline, TDD, and review expectations.
5. Update the change's coarse `tasks.md` checkboxes as work completes.
6. If the workflow keeps durable receipts, write `openspec/changes/<change-name>/apply.md`.

## Rules

- Native `openspec-apply-change` remains valid when the user wants the simpler path.
- This skill is for the execution-model change: worktrees, stricter TDD, and explicit review gates.
- Do not archive the change from here.
- When durable receipts are kept, co-locate them in the change directory for later inspection.

## Relationship to Other Skills

- Use `superspec-plan` first when the user wants micro-planning before enhanced implementation.
- Use native `openspec-verify-change` after implementation for the formal OpenSpec verification gate unless project policy defines an extra wrapper.
- Use `superspec-finalize` when enhanced git-side closeout is desired after verification or implementation completion.
