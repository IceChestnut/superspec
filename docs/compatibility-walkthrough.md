# Compatibility Mode Walkthrough

This page shows a concrete end-to-end example of how to use Superspec compatibility mode without changing native OpenSpec semantics.

The goal is not to prescribe one mandatory path. It is to show how native OpenSpec actions and explicit Superspec enhancements can be combined intentionally.

## Example Scenario

Imagine you want to add a feature, but you are not sure whether you need structured brainstorming, micro-planning, or the enhanced apply path yet.

## Path A: Native OpenSpec first, add enhancements only when needed

```text
openspec-explore
openspec-propose
openspec-continue-change
openspec-continue-change
openspec-apply-change
openspec-verify-change
openspec-archive-change
```

Use this path when:

- the problem is already clear
- coarse tasks are enough
- you do not need stronger TDD/worktree/review orchestration for this change

## Path B: Structured discovery and stronger execution

```text
superspec-brainstorm
openspec-propose
openspec-continue-change
openspec-continue-change
superspec-plan
superspec-apply-change
openspec-verify-change
superspec-finalize
openspec-archive-change
```

Use this path when:

- the problem needs guided design exploration
- the implementation will benefit from a durable micro-plan
- you want worktrees, TDD, and explicit review discipline during apply
- you want a more explicit git-side closeout before archive

## Path C: Let `superspec-next` route for you

```text
superspec-next
superspec-next
superspec-next
...
```

Use this path when:

- you do not know the best next action
- you want the system to choose automatically when confidence is high
- you want the system to ask before meaningful branch points

Expected behavior:

- with no active change, `superspec-next` asks whether to explore, brainstorm, or create a change
- with one active change in artifact creation, it usually prefers native OpenSpec progression
- with one active change at the apply boundary, it asks before choosing between native apply and enhanced planning/apply
- with multiple active changes, it always asks which change to continue

## How to Think About the Choice

Use native OpenSpec actions when:

- you already know what you want to do next
- you want to preserve the default OpenSpec mental model
- the stronger structure would add ceremony without much value

Use explicit Superspec enhancement actions when:

- you want a stronger discipline than the native step provides
- you want that stronger discipline to be explicit and reviewable
- you want to keep the enhancement local to one stage rather than switching the whole change to the strong-guidance schema

Use `superspec-next` when:

- you want guidance instead of command memorization
- you are comfortable with automatic progression in high-confidence cases
- you want the system to pause only when the route is ambiguous or meaningfully different

## Relationship to Strong-Guidance Mode

If you already know you want the fully opinionated schema path, use the strong-guidance `superspec` schema directly. Compatibility mode is for teams that want selective enhancement, not for teams that want to recreate the schema one wrapper at a time.

The enhancement wrappers shown in this walkthrough are packaged from the repository's `skills/` directory and installed into the target project's `.codex/skills/` directory by `superspec-init`.
