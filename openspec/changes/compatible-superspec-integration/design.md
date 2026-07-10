## Context

Superspec currently presents OpenSpec and Superpowers integration primarily through a single opinionated schema. That schema is valuable for teams that want a fully guided workflow, but it couples integration with semantic substitution: native OpenSpec discovery and implementation entry points are effectively reinterpreted through Superspec-specific behavior. This makes adoption harder for users who already rely on `openspec-explore`, `openspec-propose`, `openspec-continue-change`, and `openspec-apply-change` as stable concepts and want to add Superpowers discipline incrementally.

The redesign needs to preserve two truths at the same time. First, OpenSpec remains the source of truth for change state, artifact sequencing, validation, and archival. Second, Superpowers remains the source of stronger execution discipline for design exploration, micro-planning, TDD, review, and workflow closeout. The missing piece is a compatibility layer that lets those enhancements exist without redefining native OpenSpec semantics.

## Goals / Non-Goals

**Goals:**
- Preserve the meaning of existing `openspec-*` skills and commands, especially `openspec-explore` as open-ended discovery rather than mandatory structured brainstorming.
- Introduce explicit Superspec enhancement actions that users can opt into without ambiguity.
- Reposition the current `superspec` schema as a strong-guidance mode, while defining a compatibility-oriented integration model alongside it.
- Clarify which enhancement points should remain transient actions and which should produce durable workflow artifacts.
- Provide a foundation that a future workflow router such as `superspec-next` can target consistently.

**Non-Goals:**
- Replace or remove the existing `superspec` schema in this change.
- Reimplement all current Superspec schema behavior under a new schema immediately.
- Collapse every useful Superpowers capability into OpenSpec workflow steps.
- Decide final slash-command naming for every enhancement entry point before the behavior model is settled.

## Decisions

### 1. Use a three-layer workflow model

The integrated system should be described in three layers:

- **OpenSpec native layer**: existing `openspec-*` skills and commands keep their original semantics.
- **Superspec enhancement layer**: explicit `superspec-*` actions opt users into stronger structure or discipline at specific workflow points.
- **Routing layer**: future helpers such as `superspec-next` choose between native and enhanced actions without changing the semantics of either.

This separation prevents “integration” from becoming “silent replacement.” It also allows documentation, prompts, and future code to answer three different questions cleanly: what state the change is in, what optional discipline is available, and how the user gets guided to the next step.

### 2. Treat explicit enhancement actions as peer entry points, not hidden overrides

Enhancement actions should be visible alternatives, not internal substitutions behind native names. The initial enhancement set should cover the workflow points where Superpowers adds the most value without weakening OpenSpec governance:

- `superspec-brainstorm`: structured exploration using Superpowers brainstorming.
- `superspec-plan`: micro-planning between coarse tasks and implementation.
- `superspec-apply-change`: implementation with worktrees, TDD, and review discipline.
- `superspec-finalize`: git-side closeout and PR-orientation behavior where appropriate.

The names can still evolve, but the behavior contract should be explicit: users know when they are choosing stronger structure, and native OpenSpec names remain trustworthy.

### 3. Preserve artifact responsibility with a “durable if stateful” rule

Not every enhancement action should become a first-class artifact. The criterion is whether the step creates durable state that later steps or reviewers need to inspect.

- Keep as durable artifacts when they materially affect workflow state or future review:
  - planning output such as `plan.md`
  - implementation receipts such as `apply.md`
  - closeout receipts such as `finalize.md`
- Keep as optional or transient actions when they mainly shape conversation or execution style:
  - open-ended exploration
  - ad hoc review assists
  - conditional advisory capabilities

Structured brainstorming is the nuanced case. It should exist as an explicit enhancement action, but whether it always produces a formal artifact should remain a deliberate decision rather than an assumption inherited from the current schema.

### 4. Keep OpenSpec governance on proposal, specs, tasks, verify, and archive

OpenSpec’s strongest value remains artifact governance and lifecycle control. The compatibility model should avoid introducing alternate ownership for:

- proposal creation
- delta specs
- coarse tasks
- verification as a formal quality gate
- archival and spec sync

Enhancements should attach around those steps, not replace them. In practice, this means that proposal/specs/tasks stay OpenSpec-native, while brainstorming/plan/apply/finalize are the primary attachment points for Superspec-specific discipline.

### 5. Model strong-guidance Superspec as one mode, not the universal default story

The current `superspec` schema should be reframed as a strong-guidance mode optimized for teams that want an opinionated end-to-end path. The new compatibility model should be documented as a separate integration story with different trade-offs:

- **Strong-guidance mode**: prescriptive sequencing, explicit workflow artifacts, integrated discipline by default.
- **Compatibility mode**: native OpenSpec semantics remain primary, with Superspec enhancements available as explicit opt-in actions.

This avoids a false choice between keeping the current schema unchanged forever and dismantling its value. Both modes can coexist if their intended use is described honestly.

### 6. Reserve conditional enhancement hooks for domain-sensitive capabilities

Some Superpowers skills are valuable only under certain change characteristics and should not become unconditional workflow steps. The compatibility model should call them out as conditional enhancers triggered by design or implementation context:

- `security-and-hardening`
- `observability-and-instrumentation`
- `api-and-interface-design`
- `deprecation-and-migration`
- `source-driven-development`

These should be treated as policy-driven attachments, not baseline required steps, so the integrated workflow stays understandable and lightweight for ordinary changes.

## Risks / Trade-offs

- **[Risk] Two integration stories may confuse users at first** → Mitigation: document strong-guidance mode versus compatibility mode explicitly and show when to choose each.
- **[Risk] Too many named enhancement actions can recreate the “which command now?” problem** → Mitigation: keep the enhancement set small and design `superspec-next` as the preferred navigator.
- **[Risk] Artifact inconsistency between modes can make review harder** → Mitigation: keep OpenSpec-owned artifacts stable across modes and only add enhancement artifacts when they carry durable workflow value.
- **[Risk] Deferring final naming could delay implementation decisions** → Mitigation: stabilize behavior and routing contracts first, then rename with documentation and migration guidance once the model is coherent.

## Migration Plan

1. Define the compatibility model in docs and change artifacts before altering existing workflow copy.
2. Specify the initial enhancement actions and their boundaries.
3. Update the main Superspec documentation to distinguish strong-guidance mode from compatibility mode.
4. Introduce any new enhancement skills or wrappers behind explicit names.
5. Layer future routing behavior on top only after the explicit enhancement vocabulary is stable.

## Open Questions

- Should structured brainstorming always write a durable artifact in compatibility mode, or only when the user explicitly wants a traceable design record?
- Should compatibility mode eventually become its own OpenSpec schema, or remain a skill-and-routing layer built around `spec-driven`?
- How much of the current `superspec` apply/finalize behavior should be shared versus duplicated when explicit enhancement actions are introduced?
