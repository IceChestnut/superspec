---
name: superspec-next
description: State-aware workflow router for Superspec compatibility mode. Use when the user does not know the correct next action and wants routing between native OpenSpec and explicit Superspec enhancements.
license: MIT
compatibility: Requires OpenSpec CLI and the explicit Superspec compatibility-mode wrapper skills.
---

Route the user to the most appropriate next action.

`superspec-next` is a router, not an artifact. It does not redefine native OpenSpec semantics. It reads OpenSpec state, determines which native and enhanced actions are available, chooses automatically when confidence is high, and asks the user when the target change or route is ambiguous.

## Core Rules

### 1. Never guess the target change

Start by running:

```bash
openspec list --json
```

Interpret the result this way:

- **No active changes**: ask the user whether they want to explore a new idea or create a new change.
- **Exactly one active change**: continue routing using that change.
- **More than one active change**: ask the user which change to continue. Do not infer from recency alone.

### 2. Inspect state from OpenSpec, not from memory

Once the target change is known, run:

```bash
openspec status --change "<name>" --json
```

Use the returned artifact statuses, schema name, and planning context as the source of truth for routing.

### 3. Use confidence-based routing

- **High confidence**: one clearly best next action exists. Auto-execute it and report what was chosen and why.
- **Medium confidence**: there is a recommended route, but another valid route has materially different consequences. Ask the user.
- **Low confidence**: state is ambiguous or incomplete. Ask the user.

### 4. Ask before meaningful branch points

Even with one active change, ask the user before:

- creating a durable artifact not implied by the current native path
- switching execution model substantially (for example from native apply to enhanced worktree/TDD/review apply)
- choosing between multiple valid routes with clearly different workflow obligations

### 5. Prefer native artifact progression, enhanced transition points

The default routing bias is:

- native OpenSpec for proposal, specs, design, tasks, verify, and archive
- Superspec enhancement actions around transition points:
  - structured brainstorming before proposal
  - micro-planning between tasks and implementation
  - enhanced apply at implementation time
  - enhanced finalize around git-side closeout

## Suggested Routing Table

### No active change

Ask the user:
- explore a new idea with native `openspec-explore`
- use `superspec-brainstorm` for structured discovery
- create a new change with native OpenSpec change creation

### One active change, proposal ready

If the change is very early and the user has not already chosen a structured discovery path:
- recommend native artifact progression by default
- offer `superspec-brainstorm` only if stronger discovery is useful

### One active change, design/specs/tasks in progress

- prefer native `openspec-continue-change`
- if user uncertainty is about solution quality rather than sequence, offer `superspec-brainstorm` as an explicit side path

### Apply-ready state

- ask before choosing between native `openspec-apply-change` and `superspec-plan` / `superspec-apply-change`
- recommend `superspec-plan` when the user wants stronger execution discipline and no durable plan exists yet

### Implementation in progress

- continue along the already-established execution path unless the user wants to switch models explicitly

### Verify-ready state

- prefer native OpenSpec verification

### Finalize-appropriate state

- offer `superspec-finalize` when enhanced closeout is desired

### Archive-ready state

- prefer native OpenSpec archive behavior

## Reporting

After any automatic choice, report:

- which change is being routed
- which action was selected
- why it was selected from the current state
- how the user can override the route if they want a different path

Keep the explanation short and concrete.
