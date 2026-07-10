## ADDED Requirements

### Requirement: Native OpenSpec semantics remain stable
The integrated workflow SHALL preserve the existing meaning of native `openspec-*` skills and commands when compatibility mode is used. Superspec integration MUST NOT silently reinterpret native OpenSpec exploration, proposal, continuation, apply, verify, or archive behavior behind unchanged native names.

#### Scenario: Native explore remains open-ended
- **WHEN** a user invokes native OpenSpec exploration behavior in the compatibility-oriented integration model
- **THEN** the workflow preserves open-ended exploration semantics rather than forcing structured brainstorming as the default interpretation

#### Scenario: Native artifact progression remains OpenSpec-owned
- **WHEN** a user invokes native OpenSpec artifact creation or continuation behavior
- **THEN** proposal, specs, design, tasks, verify, and archive continue to follow OpenSpec-native ownership and expectations

### Requirement: Compatibility mode is documented separately from strong-guidance mode
The project SHALL define compatibility-oriented Superspec integration and strong-guidance Superspec integration as separate workflow stories with explicit trade-offs. Documentation MUST explain when each mode is appropriate and MUST NOT present the opinionated schema as the only integrated workflow.

#### Scenario: User chooses integration mode
- **WHEN** a user reads Superspec workflow documentation to decide how to start a change
- **THEN** the documentation presents both compatibility mode and strong-guidance mode with a clear explanation of how they differ

#### Scenario: Existing schema remains available
- **WHEN** a team wants the current fully guided Superspec workflow
- **THEN** the workflow model still supports that mode without requiring compatibility-mode entry points
