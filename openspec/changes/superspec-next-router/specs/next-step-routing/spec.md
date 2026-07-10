## ADDED Requirements

### Requirement: Router chooses the next action from OpenSpec state
`superspec-next` SHALL inspect OpenSpec change state and determine the most appropriate next action from the currently available native OpenSpec actions and explicit Superspec enhancement actions. The router MUST base routing on observable change state rather than hidden assumptions about session intent.

#### Scenario: Single active change with clear next step
- **WHEN** exactly one active change exists and its state clearly indicates a single best next action
- **THEN** `superspec-next` selects that action from the available native or enhanced actions

#### Scenario: Apply-ready transition point
- **WHEN** a single active change has completed the artifacts required for implementation
- **THEN** `superspec-next` evaluates both native apply and any applicable enhanced planning or enhanced apply actions before selecting the next step

### Requirement: Router does not guess the target change
`superspec-next` MUST require explicit user selection whenever no active change exists or more than one active change exists. The router SHALL NOT infer the target change from recency alone in those cases.

#### Scenario: Multiple active changes
- **WHEN** more than one active change exists
- **THEN** `superspec-next` asks the user which change to continue before routing any further

#### Scenario: No active change
- **WHEN** no active change exists
- **THEN** `superspec-next` asks the user whether to explore a new idea or create a new change before choosing a workflow action

### Requirement: Router reports its selected action
After choosing an action automatically, `superspec-next` SHALL report what it selected and why that action was recommended. The explanation MUST be brief but specific enough for the user to understand the routing decision.

#### Scenario: Automatic progression
- **WHEN** `superspec-next` auto-executes a high-confidence next step
- **THEN** it reports the selected action and the state-based reason for that choice
