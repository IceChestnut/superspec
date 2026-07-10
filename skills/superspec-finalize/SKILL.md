---
name: superspec-finalize
description: Explicit enhanced closeout for Superspec compatibility mode. Use when the user wants git-side finalization and reviewer orientation without changing native archive semantics.
license: MIT
compatibility: Requires OpenSpec CLI and Superspec-compatible closeout behavior.
---

Use this skill when the user explicitly wants enhanced git-side closeout as part of compatibility mode.

`superspec-finalize` does not replace native OpenSpec archive behavior. Archive remains the lifecycle close that syncs specs and freezes the change history. This skill handles the git-side closeout and optional reviewer orientation before or alongside archive decisions.

## Behavior

1. Resolve the active change. If the target change is ambiguous, ask the user to choose it.
2. Inspect the change's verification status and implementation receipts if available.
3. Perform the git-side closeout steps that fit the team's workflow: branch hygiene, optional PR orientation, and durable closeout recording.
4. Write `openspec/changes/<change-name>/finalize.md` when the workflow keeps durable receipts.
5. Hand off to native archive behavior when the change is ready to be archived.

## Rules

- Do not silently archive the change from this skill.
- Keep reviewer-orientation behavior explicit and bounded to closeout concerns.
- Preserve native OpenSpec verify and archive semantics rather than absorbing them here.

## Relationship to Other Skills

- Use native `openspec-verify-change` for the formal verification gate.
- Use native archive behavior to sync specs and archive the change after finalization is complete.
- Use this skill only when the user wants enhanced closeout, not as a replacement for all post-implementation behavior.
