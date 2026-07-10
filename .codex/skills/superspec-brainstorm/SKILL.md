---
name: superspec-brainstorm
description: Explicit structured brainstorming for Superspec compatibility mode. Use when the user wants guided design discovery without changing the meaning of native openspec-explore.
license: MIT
compatibility: Requires OpenSpec CLI and Superpowers brainstorming discipline.
---

Use this skill when the user explicitly wants structured design discovery as a Superspec enhancement.

`superspec-brainstorm` is a peer entry point to native `openspec-explore`, not a replacement for it. Native `openspec-explore` stays open-ended and conversational. This skill opts into the stronger Superpowers brainstorming discipline on purpose.

## Behavior

1. Explore relevant project context.
2. Ask clarifying questions one at a time.
3. Propose 2-3 approaches with trade-offs and a recommendation.
4. Present the recommended design clearly enough for approval.
5. Decide whether the result should remain conversational or become a durable artifact.

## Durable Output Rule

By default, this skill may remain conversational.

Write a durable output only when one of the following is true:

- the user explicitly asks to save the result
- an active change already exists and the brainstorm is meant to feed proposal or design work
- the workflow router or project policy explicitly requires a traceable design record

If writing a durable output for an active change, prefer:

- `openspec/changes/<change-name>/brainstorm.md`
- and, when technical rationale is mature enough, `openspec/changes/<change-name>/design.md`

If more than one active change exists, do not guess which change should receive the output. Ask the user to choose first.

## Relationship to Other Skills

- Use native `openspec-explore` when the user wants open-ended discovery with no structured path.
- Use `superspec-brainstorm` when the user explicitly wants the stronger brainstorming discipline.
- If the result hardens into formal change intent, hand off to native OpenSpec proposal/spec generation rather than redefining those steps here.
