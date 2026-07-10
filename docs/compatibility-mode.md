# Superspec Compatibility Mode

Compatibility mode is the integration story for teams that want to keep native OpenSpec workflow semantics intact while opting into Superpowers discipline only where it adds value.

Unlike the strong-guidance `superspec` schema, compatibility mode does not redefine native `openspec-*` meanings. `openspec-explore` stays open-ended, proposal/specs/tasks remain OpenSpec-governed, and users opt into stronger Superspec actions explicitly.

## The Three Layers

### 1. Native OpenSpec layer

This layer preserves the original OpenSpec mental model:

- `openspec-explore` stays exploratory and non-prescriptive
- `openspec-propose` creates the change boundary
- `openspec-continue-change` advances native planning artifacts
- `openspec-apply-change` remains the native implementation path
- `openspec-verify-change` and archive behavior remain OpenSpec-owned quality and lifecycle gates

### 2. Explicit Superspec enhancement layer

This layer adds opt-in workflow discipline through explicit enhancement actions:

- `superspec-brainstorm` for structured design discovery
- `superspec-plan` for micro-planning between coarse tasks and implementation
- `superspec-apply-change` for worktrees, TDD, and review-backed implementation
- `superspec-finalize` for git-side closeout and reviewer orientation

These actions are peer entry points, not silent overrides of native OpenSpec names.

### 3. Routing layer

This layer is for helpers such as `superspec-next`, which choose between native and enhanced actions based on OpenSpec state. The router does not change the semantics of either layer; it only helps users navigate them.

Use `superspec-next` when the user does not know the right next action and wants the system to route intelligently. Use native OpenSpec commands or explicit Superspec enhancement actions directly when the user already knows which path they want.

### Example routing moments

- If no active change exists, `superspec-next` should ask whether the user wants native `openspec-explore`, explicit `superspec-brainstorm`, or native change creation.
- If one active change is apply-ready, `superspec-next` should ask before choosing between native `openspec-apply-change` and the stronger `superspec-plan` or `superspec-apply-change` path.
- If one active change is archive-ready, `superspec-next` should prefer native archive behavior by default.

## Durable vs Transient Enhancements

Compatibility mode distinguishes between workflow helpers that create durable state and those that simply add structure in the moment.

Durable enhancement outputs are appropriate when later workflow steps or reviewers need to inspect them. Examples include:

- a micro-plan artifact such as `openspec/changes/<name>/plan.md`
- implementation receipts such as `openspec/changes/<name>/apply.md`
- finalize or closeout receipts such as `openspec/changes/<name>/finalize.md`

Transient enhancements are appropriate when the action mainly affects conversation style or conditional advisory guidance.

Structured brainstorming sits in the middle: teams may want durable records such as `openspec/changes/<name>/brainstorm.md`, but compatibility mode does not assume every guided discussion must become a required artifact.

## Conditional Enhancers

Some Superpowers skills are most useful only for certain changes. Compatibility mode treats them as policy-driven attachments rather than baseline workflow steps:

- security and hardening
- observability and instrumentation
- API and interface design
- deprecation and migration
- source-driven development

## Choosing Between Modes

Use compatibility mode when:

- your team already thinks in native OpenSpec terms
- you want to add Superpowers discipline incrementally
- you want explicit choice about when structured brainstorming or enhanced apply happens

Use strong-guidance mode when:

- you want the current opinionated Superspec schema end to end
- you want brainstorming, planning, apply, verify, and finalize tightly orchestrated by one schema
- your team values a guided path more than preserving native OpenSpec command meanings

## Relationship to the Existing Schema

The current `superspec` schema remains valuable. It is the strong-guidance mode: a prescriptive workflow that integrates OpenSpec governance with Superpowers execution by default.

Compatibility mode does not replace that schema. It complements it by describing how native OpenSpec workflows and explicit Superspec enhancements can coexist in the same repository and eventually be navigated by helpers such as `superspec-next`. The canonical sources for those project-provided enhancement skills live under the repository's `skills/` directory and are installed into `.codex/skills/` for the target project.

## Quick Start

The compatibility-oriented path is intentionally composable:

```text
openspec-explore            # native open-ended discovery
superspec-brainstorm        # optional structured discovery
openspec-propose            # native proposal path
openspec-continue-change    # native proposal/specs/design/tasks progression
superspec-plan              # optional micro-planning
openspec-apply-change       # native apply
superspec-apply-change      # optional enhanced apply
openspec-verify-change      # native verification gate
superspec-finalize          # optional enhanced closeout
openspec-archive-change     # native archive path
superspec-next              # router when you want guidance instead of choosing manually
```

Use the native action directly when you already know the path you want. Use `superspec-next` when you want the system to choose the next sensible step and only ask when the route is ambiguous or has materially different consequences.

For a concrete example from discovery through archive, see [compatibility walkthrough](compatibility-walkthrough.md).
