## Why

The current Superspec integration is centered on a single opinionated schema that rewrites early workflow semantics around structured brainstorming and other Superpowers-driven steps. That makes it harder for users who rely on native `openspec-*` exploration, proposal, and implementation semantics to adopt Superspec incrementally. We need a compatibility-oriented integration path now so teams can opt into Superpowers enhancements where they add value without losing the original OpenSpec mental model.

## What Changes

- Add a compatibility-oriented Superspec integration model that keeps native `openspec-*` skills and commands semantically unchanged.
- Introduce explicit enhancement entry points for structured brainstorming, micro-planning, TDD-backed apply, and workflow finalization instead of implicitly replacing native OpenSpec steps.
- Reframe the existing `superspec` schema as a strong-guidance mode rather than the only integrated path between OpenSpec and Superpowers.
- Document how native OpenSpec actions, explicit Superspec enhancement actions, and future routing helpers coexist in one workflow system.

## Capabilities

### New Capabilities
- `workflow-compatibility`: Defines how Superspec enhancements coexist with unchanged OpenSpec workflow semantics and how users choose native versus enhanced paths.
- `enhanced-change-actions`: Defines explicit enhancement actions for brainstorming, planning, apply, and finalize without hijacking native OpenSpec command meaning.

### Modified Capabilities
- None.

## Impact

- Workflow documentation, naming, and migration guidance across `README.md`, integration docs, and schema rationale.
- New or revised skill definitions for explicit Superspec enhancement actions that coexist with native OpenSpec skills.
- Potential schema and prompt-layer changes that reposition the existing `superspec` workflow as an opinionated mode rather than the default integrated story.
