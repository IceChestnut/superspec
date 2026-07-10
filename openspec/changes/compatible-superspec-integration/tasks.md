## 1. Compatibility model and workflow vocabulary

- [x] 1.1 Define the compatibility-oriented workflow model in repo docs, including the three layers: native OpenSpec, explicit Superspec enhancements, and routing helpers
- [x] 1.2 Reposition the current `superspec` schema in documentation as strong-guidance mode rather than the only integrated workflow story
- [x] 1.3 Document the initial explicit enhancement actions for brainstorming, planning, apply, and finalize, including how they differ from native OpenSpec actions

## 2. Durable versus transient enhancement boundaries

- [x] 2.1 Decide and document which enhancement actions produce durable workflow artifacts versus remaining transient workflow helpers
- [x] 2.2 Align artifact-oriented enhancement behavior such as plan, apply receipt, and finalize receipt with the compatibility model
- [ ] 2.3 Document the policy for conditional enhancers such as security, observability, API design, migration, and source-driven implementation

## 3. Implementation and migration scaffolding

- [x] 3.1 Add or adapt the explicit Superspec enhancement skill definitions or wrappers needed by the compatibility model
- [x] 3.2 Update integration docs and usage examples so users can choose between compatibility mode and strong-guidance mode intentionally
- [x] 3.3 Verify the resulting docs and workflow descriptions remain internally consistent with the existing schema behavior and future routing integration
