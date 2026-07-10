## Why

Once native OpenSpec actions and explicit Superspec enhancement actions coexist, users should not have to memorize which command fits the current change state. Existing `openspec-continue-change` only advances the next artifact in the active schema and cannot arbitrate between native and enhanced actions. We need a routing entry point now so Superspec becomes easier to use as it becomes more flexible, rather than more confusing.

## What Changes

- Add `superspec-next` as a state-aware router that inspects the current OpenSpec change and determines the most appropriate next action.
- Let the router choose between native OpenSpec actions and explicit Superspec enhancement actions based on change state and routing confidence.
- Auto-execute when one path is clearly best, but require user selection when there are multiple active changes or materially different valid next steps.
- Define the decision policy for ambiguity, change selection, confidence thresholds, and when the router must ask before proceeding.

## Capabilities

### New Capabilities
- `next-step-routing`: Defines how `superspec-next` reads OpenSpec change state and maps it to native or enhanced next actions.
- `routing-decision-policy`: Defines auto-execution rules, confidence thresholds, and required confirmation cases such as multiple active changes or artifact-creating branch points.

### Modified Capabilities
- None.

## Impact

- New routing-oriented skill or command behavior, plus supporting documentation for user-facing workflow guidance.
- Additional state inspection and decision logic that coordinates with OpenSpec status, artifact readiness, and explicit Superspec enhancement entry points.
- Cross-change UX rules for change selection, safe auto-progression, and fallback prompting when the router cannot choose confidently.
