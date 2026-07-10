## ADDED Requirements

### Requirement: Enhancement actions are explicit peer entry points
Superspec SHALL expose enhancement behaviors through explicit enhancement actions rather than hidden overrides of native OpenSpec action names. The initial compatibility-oriented enhancement set MUST include explicit entry points for structured brainstorming, micro-planning, disciplined apply, and workflow finalization.

#### Scenario: User wants stronger design discovery
- **WHEN** a user wants structured discovery before proposal creation
- **THEN** the workflow offers an explicit brainstorming enhancement action instead of changing the semantics of native OpenSpec exploration

#### Scenario: User wants stronger implementation discipline
- **WHEN** a user wants worktree, TDD, and review-backed implementation behavior
- **THEN** the workflow offers an explicit enhanced apply action instead of silently replacing native OpenSpec apply behavior

### Requirement: Enhancement actions follow durable-state boundaries
The compatibility-oriented integration SHALL distinguish between transient enhancement actions and durable enhancement outputs. Enhancements MUST produce durable artifacts only when they create workflow state that later steps, reviewers, or archival logic need to inspect.

#### Scenario: Planning output is durable
- **WHEN** an enhancement action decomposes coarse tasks into executable micro-steps
- **THEN** the workflow persists that output as a durable planning artifact for downstream execution and review

#### Scenario: Advisory enhancement remains transient
- **WHEN** an enhancement action only changes conversation style or provides conditional guidance without creating downstream workflow state
- **THEN** the workflow may keep that enhancement transient rather than introducing a new required artifact

### Requirement: Conditional enhancers remain policy-driven
Superspec SHALL support conditional Superpowers enhancers for domain-sensitive changes such as security, observability, API design, migration, and source-driven implementation. These enhancers MUST remain optional or policy-driven and MUST NOT become unconditional baseline steps for every change.

#### Scenario: Security-sensitive change
- **WHEN** a change affects untrusted input, authentication, authorization, or other security-sensitive surfaces
- **THEN** the compatibility workflow can attach a security-focused enhancement without forcing that enhancement for unrelated changes

#### Scenario: Ordinary change
- **WHEN** a change does not involve domain-sensitive concerns
- **THEN** the compatibility workflow remains understandable without requiring conditional enhancers to run
