## Context

Once native OpenSpec actions and explicit Superspec enhancement actions coexist, users gain flexibility but also face a new navigation problem: they must know which action makes sense at the current change state. Existing OpenSpec continuation behavior is intentionally narrow. `openspec-continue-change` advances the next artifact in the active schema; it does not choose between alternative workflow styles, implementation disciplines, or optional enhancement steps.

`superspec-next` is intended to solve that navigation problem without becoming a new hidden schema. It should inspect OpenSpec state, understand which native and enhanced actions are available, and choose the most appropriate next move when confidence is high. When confidence is low or the consequence difference is meaningful, it should stop and ask.

## Goals / Non-Goals

**Goals:**
- Provide a single “help me move forward” entry point for users who do not know the correct next action.
- Route between native OpenSpec actions and explicit Superspec enhancement actions without redefining the semantics of either.
- Auto-execute when the next step is clear and low-risk.
- Ask for user selection when the active change is ambiguous or the workflow branch has materially different consequences.
- Build decisions from OpenSpec status and artifact state rather than hidden session assumptions.

**Non-Goals:**
- Replace `openspec-continue-change` for users who explicitly want schema-linear artifact creation.
- Introduce a new artifact type just to record routing decisions.
- Automatically guess between multiple active changes.
- Hide all workflow complexity; expert users should still be able to invoke native or enhanced actions directly.

## Decisions

### 1. Make `superspec-next` a router skill, not an artifact

Routing is control flow, not durable change content. There is no long-term review value in persisting a “next step was chosen” artifact for ordinary progression. `superspec-next` should therefore live as a skill or command wrapper that reads change state and dispatches to another action.

This keeps artifact graphs honest. Artifacts should represent reviewable planning or implementation state, while `superspec-next` remains a runtime guide.

### 2. Require explicit change selection whenever the target change is not unique

If there is:

- no active change, or
- more than one active change,

the router must ask the user what to do rather than guess. Multiple active changes are an inherently ambiguous situation, and even “most recently modified” is not a reliable enough proxy for user intent. When there is exactly one active change, the router may proceed automatically based on that change’s state.

### 3. Use a confidence-based routing policy

The router should classify its decision confidence before acting:

- **High confidence**: one clearly best next action exists; auto-execute and explain briefly.
- **Medium confidence**: one action is recommended, but a reasonable alternative exists with different workflow consequences; ask the user with a short recommendation.
- **Low confidence**: the state is ambiguous, incomplete, or conflicting; do not execute automatically.

This provides predictable behavior while still honoring the “use `next` when you do not know what to do” user intent.

### 4. Ask before branch points that introduce durable artifacts or different execution models

Even when a change is unique, the router should pause before automatically taking a branch that:

- creates a new durable artifact such as a plan or closeout receipt beyond the currently expected native path,
- changes the execution model significantly, such as switching from direct apply to TDD/worktree/review orchestration,
- or chooses between two valid paths with materially different user obligations.

Examples:

- Asking before choosing `superspec-plan` versus direct native apply.
- Asking before entering a structured brainstorming flow that creates a durable record when the user may have expected free-form exploration.

This keeps automation helpful without making irreversible style decisions on the user’s behalf.

### 5. Prefer OpenSpec-native progression for artifact creation, and Superspec enhancements around transition points

The initial routing policy should treat OpenSpec-native artifact progression as the default for proposal, specs, design, tasks, verify, and archive. Superspec enhancement actions should be considered mainly at transition points where stronger discipline matters:

- before proposal, when structured brainstorming may help
- between tasks and implementation, when planning may help
- at implementation time, when TDD/worktree/review apply may help
- after verify, when closeout or PR orientation may help

This mirrors the compatibility model rather than trying to replace it.

### 6. Publish an explicit routing table instead of relying on ad hoc heuristics

The first implementation should define a concrete routing table by change state, including:

- no active change
- one active change with `proposal` ready
- one active change mid-artifact sequence
- apply-ready state
- implementation in progress
- verify-ready state
- finalize-appropriate state
- archive-ready state

An explicit table is easier to review, test, and extend than a purely narrative prompt. Heuristics can still be used inside a state bucket, but the top-level state model should be stable and inspectable.

## Risks / Trade-offs

- **[Risk] Automatic routing can feel surprising if explanations are too thin** → Mitigation: always report what was chosen and why after automatic execution.
- **[Risk] Asking too often defeats the convenience goal** → Mitigation: limit prompts to ambiguous change selection and meaningful branch points.
- **[Risk] The router can drift from actual workflow capabilities as new enhancement actions are added** → Mitigation: keep the routing table explicit and version it alongside documented enhancement actions.
- **[Risk] Medium-confidence cases may be hard to classify consistently** → Mitigation: define concrete prompt triggers such as artifact creation, execution-model change, or competing valid branches.

## Migration Plan

1. Finalize the compatibility-oriented enhancement vocabulary that `superspec-next` can target.
2. Define the initial routing table and confidence rules in docs and specs.
3. Implement `superspec-next` as a thin state-inspection and dispatch layer around existing native or enhanced actions.
4. Add examples covering no-change, one-change, and many-change scenarios.
5. Refine prompts and automatic behavior only after routing outcomes are observable in practice.

## Open Questions

- Should `superspec-next` default to native exploration or enhanced brainstorming when there is no active change and the user simply asks to “continue” or “start”?
- Should medium-confidence prompts always present both native and enhanced choices, or only the recommended one plus a “show alternatives” option?
- How should `superspec-next` detect “implementation in progress” when the underlying change state is not fully reflected in artifact completion alone?
