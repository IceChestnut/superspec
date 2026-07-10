---
name: superspec-plan
description: Explicit micro-planning for Superspec compatibility mode. Use when coarse OpenSpec tasks exist and the user wants a durable implementation plan before coding.
license: MIT
compatibility: Requires OpenSpec CLI and Superpowers planning discipline.
---

Use this skill when the user wants a compatibility-mode planning step between coarse `tasks.md` and implementation.

`superspec-plan` does not replace native OpenSpec tasks. It refines them into executable micro-steps.

## Behavior

1. Resolve the active change. If no active change exists or more than one active change exists, ask the user which change to plan for.
2. Read the change's `tasks.md`, relevant `specs/`, and `design.md` if present.
3. Break coarse tasks into small, executable steps with testing and verification guidance.
4. Write the durable plan to `openspec/changes/<change-name>/plan.md`.

## Rules

- Treat `tasks.md` as the source of coarse implementation scope.
- Do not reinterpret proposal/spec semantics here.
- Keep the output durable because downstream implementation and review may need to inspect it.
- If the user prefers the native implementation path without a plan artifact, do not force this step; that remains a valid OpenSpec choice.

## Relationship to Other Skills

- Use native OpenSpec progression when the user only wants coarse planning artifacts.
- Use `superspec-plan` when the user wants explicit micro-planning before implementation.
- `superspec-apply-change` should prefer consuming `plan.md` when it exists.
