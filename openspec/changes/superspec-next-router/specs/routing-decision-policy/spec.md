## ADDED Requirements

### Requirement: Router uses confidence-based execution policy
`superspec-next` SHALL classify routing decisions by confidence before executing them. High-confidence decisions MAY auto-execute, medium-confidence decisions MUST present a recommendation with a prompt, and low-confidence decisions MUST ask the user before acting.

#### Scenario: High-confidence route
- **WHEN** one active change exists and only one next action is clearly appropriate
- **THEN** `superspec-next` auto-executes that action and reports the decision

#### Scenario: Low-confidence route
- **WHEN** the available state is ambiguous, conflicting, or incomplete
- **THEN** `superspec-next` does not auto-execute and instead asks the user for direction

### Requirement: Router pauses at meaningful branch points
`superspec-next` MUST ask the user before taking a branch that introduces a durable artifact not implied by the current native path, changes the execution model substantially, or chooses between multiple valid routes with materially different workflow consequences.

#### Scenario: Planning versus direct apply
- **WHEN** a change can either proceed directly to native apply or first enter an enhanced planning step that creates a durable plan artifact
- **THEN** `superspec-next` asks the user before choosing the enhanced planning branch automatically

#### Scenario: Native apply versus enhanced apply
- **WHEN** a change can proceed through native apply or an enhanced apply path with worktrees, TDD, and review discipline
- **THEN** `superspec-next` asks the user before switching execution models unless one path is already clearly established by prior workflow state

### Requirement: Router follows an explicit state routing table
`superspec-next` SHALL define and follow an explicit routing table for major workflow states, including no active change, single active change early in artifact creation, mid-artifact progression, apply-ready state, implementation in progress, verify-ready state, finalize-appropriate state, and archive-ready state.

#### Scenario: Reviewable routing table
- **WHEN** maintainers review or update `superspec-next`
- **THEN** the routing logic is expressed through a documented state model rather than only through ad hoc conversational heuristics

#### Scenario: New enhancement action added later
- **WHEN** a new explicit Superspec enhancement action is introduced
- **THEN** maintainers can update the routing table to incorporate it without redefining the core confidence policy
