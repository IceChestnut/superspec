## 1. Routing model and decision policy

- [x] 1.1 Define the `superspec-next` state model for no active change, one active change, multiple active changes, artifact progression, apply-ready, verify-ready, finalize-appropriate, and archive-ready states
- [x] 1.2 Define the confidence policy for high-confidence auto-execution, medium-confidence prompting, and low-confidence non-execution
- [x] 1.3 Define the mandatory prompt rules for multiple active changes and meaningful branch points such as durable artifact creation or execution-model changes

## 2. Routing table and action selection

- [x] 2.1 Map each router state to the available native OpenSpec actions and explicit Superspec enhancement actions
- [x] 2.2 Define the default recommendation logic for early exploration, mid-artifact progression, implementation transitions, verification, and closeout
- [x] 2.3 Define the post-selection reporting behavior so automatic choices explain what action was chosen and why

## 3. Skill design, examples, and validation

- [x] 3.1 Draft the `superspec-next` skill or command behavior around OpenSpec status inspection and action dispatch
- [x] 3.2 Add user-facing examples covering no-change, one-change, and many-change scenarios plus native-versus-enhanced branch points
- [x] 3.3 Verify the router design stays aligned with the compatibility-oriented enhancement vocabulary and does not redefine native OpenSpec semantics
