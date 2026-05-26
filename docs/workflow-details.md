# Superspec Workflow Details

A Superspec change moves through **six phases**, broken into **ten concrete steps**. This page walks through each step — what it is, **why it's required**, what concretely happens, which source system (OpenSpec or Superpowers) owns it, and what step from the other source is replaced.

Use it as the long-form companion to the [workflow overview](workflow.md), [top-level README](../README.md), and the schema's own [INTEGRATION.md](../openspec/schemas/superspec/INTEGRATION.md).

## At a glance

| Phase | # | Step | Brief Why | Source Phase Used |
|---|---|---|---|---|
| **1. Brainstorm** | 1 | `brainstorm` | Avoid building the wrong thing. | Superpowers: `brainstorming` |
| **2. Artifact Creation** | 2 | `proposal` | Define the change boundary. | OpenSpec: `proposal` artifact |
| | 3 | `design` *(optional)* | Explain the chosen solution. | Hybrid: Superpowers brainstorming + OpenSpec `design.md` |
| | 4 | `specs` | Create the testable contract. | OpenSpec: `specs` artifact |
| | 5 | `tasks` | Scope the work. | OpenSpec: `tasks` artifact |
| | 6 | `plan` | Make the work executable. | Superpowers: `writing-plans` |
| **3. Code Implementation** | 7 | `apply` | Change the system. | Superpowers: `using-git-worktrees`, `subagent-driven-development`, `test-driven-development`, `requesting-code-review` |
| **4. Spec Validation** | 8 | `verify` | Prove it matches intent. | OpenSpec: `/opsx:verify` |
| **5. Finalization** | 9 | `finalize` | Close out the git side cleanly before archive. | Schema-executed Pattern A (v4); `finishing-a-development-branch` is escape hatch |
| **6. Archival** | 10 | `archive` boundary | Sync deltas and freeze the change. | OpenSpec: `/opsx:archive` |

Read top-to-bottom for the full lifecycle, or jump to any step.

---

## Phase 1: Brainstorm

The Brainstorm phase nails down the idea for the change before any formal artifacts are produced. It contains a single step.

### Step 1. Discovery — `brainstorm`

> Front-end discovery and design shaping before formal artifacts are created.

**Brief why:** Avoid building the wrong thing.

**Why it's required.** This phase prevents the workflow from formalizing the wrong problem. It forces ambiguity, constraints, alternatives, and trade-offs to be explored *before* OpenSpec artifacts harden the change. Once `proposal` and `specs` exist, they become a contract; everything downstream — design decisions, task decomposition, code, tests, archive history — anchors to them. If the underlying problem was misframed, that misframing now lives in the contract and is expensive to walk back.

**What the step does.** Collaborative design exploration using **Superpowers' brainstorming skill**. It explores project context, asks clarifying questions one at a time, proposes 2–3 approaches with trade-offs, presents design sections for approval, and outputs the validated design.

**Source phase used.** `superpowers:brainstorming`.

**Step not used / replaced and why.** OpenSpec's `/opsx:explore` is mostly replaced. OpenSpec explore investigates unclear requirements, but Superpowers brainstorming is more structured for collaborative design validation. OpenSpec still has `/opsx:explore` available for ad-hoc inspection, but Superspec deliberately picks Superpowers as the stronger discovery phase.

---

## Phase 2: Artifact Creation

The Artifact Creation phase produces every governed artifact for the change — the proposal, optional design, delta specs, coarse tasks, and the executable micro-task plan. It contains five steps (steps 2–6).

### Step 2. Change Contract — `proposal`

> Converts the brainstormed design into an OpenSpec-style change contract.

**Brief why:** Define the change boundary.

**Why it's required.** This step creates the formal OpenSpec change boundary. Every later phase — specs, design, tasks, verification, archive — depends on a single shared answer to "what capability is changing, why, and with what impact?" Without a proposal, the workflow has nothing to validate against and no stable target for the delta-spec mechanism that powers OpenSpec's archival history.

**What the step does.** The agent reads `brainstorm.md` and creates `proposal.md`, extracting:

- **Why** (50–1000 chars, validated by OpenSpec's zod schema)
- **What Changes** (specific changes agreed during brainstorming)
- **Capabilities** (new vs. modified, in kebab-case — each becomes a `specs/<name>/spec.md`)
- **Impact** (affected code, APIs, dependencies, systems)

The Capabilities section is the load-bearing piece: it forms the contract between proposal and specs phases, and every name listed must end up with a corresponding spec file.

**Source phase used.** OpenSpec `proposal` artifact / `/opsx:propose` behavior.

**Step not used / replaced and why.** Superpowers has no equivalent standalone proposal phase. Brainstorming saves a design document, but it does not produce an OpenSpec proposal with capability-level spec-contract semantics. Superspec slots OpenSpec's proposal in immediately after Superpowers brainstorming so the design is captured as a governed change rather than a free-form note.

---

### Step 3. Architecture — `design` *(optional)*

> Captures implementation approach and technical rationale.

**Brief why:** Explain the chosen solution.

**Why it's required.** Design records the *technical* approach and rationale behind the change. This keeps requirements (`specs`) free of implementation details while preserving the decisions needed for code review, ongoing maintenance, rollout planning, and future audits. It is the only artifact that explains *why this implementation was chosen over alternatives*.

This artifact is **optional** — only write it when there are non-trivial technical decisions to record (per `openspec-conventions`). For simple changes the brainstorm + proposal + specs combination is enough.

**What the step does.** Create or refine `design.md`, covering:

- **Context** — background, current state, constraints, stakeholders
- **Goals / Non-Goals** — explicit scope
- **Decisions** — the chosen approach, with rationale
- **Risks / Trade-offs** — known compromises
- *(optional)* migration plan and open questions

Focus is on architecture and approach, not line-by-line implementation. If brainstorming already produced a design document, the agent reviews and refines it rather than starting over.

**Source phase used.** Hybrid — Superpowers `brainstorming` may pre-fill `design.md`, then the OpenSpec `design.md` artifact takes ownership.

**Step not used / replaced and why.** A pure-Superpowers design document at the default Superpowers location is replaced. The schema's `brainstorm` instruction explicitly redirects design output into the OpenSpec change directory (`openspec/changes/<name>/design.md`) instead of `docs/superpowers/specs/`. This keeps every artifact for one change co-located in one directory, so `openspec validate` and `openspec archive` see all of it.

---

### Step 4. Requirements — `specs`

> Defines testable system behavior.

**Brief why:** Create the testable contract.

**Why it's required.** Specs are the testable behavioral contract. OpenSpec needs them to produce *delta specs*, validate the change end-to-end, and — most importantly — prove after implementation that the delivered system actually satisfies the intended behavior. Without specs, "did we build the right thing?" has no objective answer.

**What the step does.** Create one specification file per capability listed in the proposal, at `specs/<capability>/spec.md`. Each file uses delta sections:

- `## ADDED Requirements` — new behavior
- `## MODIFIED Requirements` — existing requirements changed (header must match the live spec exactly; full new content required, not a diff)
- `## REMOVED Requirements`
- `## RENAMED Requirements` — header rename only

Hard formatting rules (validated by OpenSpec):

- Requirement sentences must contain `SHALL` or `MUST`.
- Each Requirement must have at least one `#### Scenario:` block.
- Scenarios must use level-4 headings (`####`); level-3 or bullet form silently fails validation.

**Source phase used.** OpenSpec `specs` artifact.

**Step not used / replaced and why.** Superpowers has no equivalent — this is a major contribution from the OpenSpec/spec-driven side. Superpowers has plans and tests, but not capability-level requirement deltas with archive semantics.

---

### Step 5. Implementation Scope — `tasks`

> Creates the coarse implementation checklist.

**Brief why:** Scope the work.

**Why it's required.** `tasks.md` turns the approved change into a *scoped body of implementation work*. It gives OpenSpec a trackable checklist that can be parsed during apply and verify, without dropping immediately into low-level coding steps. It also creates a coarse grouping that maps cleanly to commits and review boundaries.

**What the step does.** Create `tasks.md` with grouped, ordered, dependency-respecting checkbox tasks:

```
## 1. Group Name
- [ ] 1.1 Task description
- [ ] 1.2 Task description
```

The format matters: the apply phase parses `- [ ]` to track progress, so tasks not using checkboxes are invisible to it. Each task should be small enough to complete in one session.

**Source phase used.** OpenSpec `tasks` artifact.

**Step not used / replaced and why.** Superpowers' `writing-plans` is **not yet** invoked here. Superpowers planning is more granular (2–5 minute micro-steps). Superspec deliberately keeps a coarse OpenSpec layer first — it is the level a human reviewer actually wants to scan during proposal review — and decomposes into Superpowers-style micro-steps in the next phase.

---

### Step 6. Implementation Plan — `plan`

> Converts coarse OpenSpec tasks into executable micro-steps.

**Brief why:** Make the work executable.

**Why it's required.** This phase transforms high-level tasks into instructions an agent (or a human pairing with an agent) can execute consistently. It is where Superpowers adds file-level steps, exact test commands, the TDD sequence, and commit points. Without it, the apply loop has to re-decide *how* to execute every task, which is where drift between spec and code typically starts.

**What the step does.** Invokes `superpowers:writing-plans`. The skill reads `tasks.md` (and `design.md` if present), then for each task produces a `plan.md` section with:

- 2–5 minute TDD-style micro-steps (RED → GREEN → REFACTOR)
- exact file paths and code/test snippets
- the test command to run
- a commit point at the end of each task

**Source phase used.** `superpowers:writing-plans`.

**Step not used / replaced and why.** Going directly from OpenSpec tasks to `/opsx:apply` is delayed. Native OpenSpec can apply task-by-task, but Superspec inserts a stricter micro-planning layer between tasks and apply so the executor has unambiguous instructions for each TDD cycle.

---

## Phase 3: Code Implementation

The Code Implementation phase produces the actual code for the change, executed in an isolated git worktree under Superpowers' subagent + TDD + code-review loop. It contains a single step.

### Step 7. Implementation — `apply`

> Executes the implementation.

**Brief why:** Change the system.

**Why it's required.** This is the phase that actually changes code, config, or system state. In Superspec it is intentionally delegated to Superpowers' stricter execution loop instead of vanilla OpenSpec apply, so every task ships through the same TDD-and-review pipeline.

**What the step does.** The apply phase chains four Superpowers skills (with two more triggered transitively) and writes a receipt:

1. **`using-git-worktrees`** — creates an isolated workspace at `.worktrees/<change-name>/`, switches to a new branch, runs project setup, and confirms a clean test baseline.
2. **`subagent-driven-development`** (default path, requires subagent support) — the main agent reads `plan.md` and dispatches a fresh subagent per micro-task. Each subagent transitively activates:
   - **`test-driven-development`** — write a failing test first, watch it fail, then write the minimum code to make it pass. Implementation written before a failing test is deleted and redone.
   - **`requesting-code-review`** — after each task, a code-reviewer subagent checks spec compliance and code quality. A final review runs over the whole implementation before apply concludes.
   - As coarse tasks complete, `tasks.md` checkboxes flip to `- [x]`.
3. **Receipt** — at the end of the phase, a minimal `apply.md` is written per `openspec/schemas/superspec/templates/apply.md`: iteration counter, applied-at timestamp, executor identity, worktree path, branch, commit range, and tasks completed X of Y. This is the v2 DAG artifact that gates `verify`. If `apply.md` already exists, the iteration counter is incremented.
4. **Phase 5 closeout** — Pattern A (schema-executed in v4) handles the git-side closeout; covered in Phase 5 / Step 9 below. The skill `finishing-a-development-branch` is retained as a manual escape hatch only.

**Pre-flight requirement.** Before creating the worktree, the change directory `openspec/changes/<name>/` must already be committed on the current branch. Otherwise, when the worktree merges back, git will refuse with "untracked files would be overwritten by merge."

**Fallback path.** If subagents are unavailable, `superpowers:executing-plans` is the documented fallback. It does *not* transitively activate TDD or code review — you take responsibility for both manually. On Claude Code, subagents are available, so this path is rarely needed.

**Source phase used.** `superpowers:using-git-worktrees`, `superpowers:subagent-driven-development`, `superpowers:test-driven-development`, `superpowers:requesting-code-review`.

**Step not used / replaced and why.** Vanilla `/opsx:apply` execution is effectively overridden. OpenSpec apply can work through tasks directly, but Superspec chooses Superpowers' stricter loop with isolated worktrees, subagents, TDD, and review. The OpenSpec docs show `/opsx:apply` "working through tasks," but in this schema Superpowers is the executor.

### Convergence loop (apply → verify → repeat)

Because `apply.md` and `verify.md` are both overwritten on each iteration and both carry the same `Iteration:` counter, Superspec supports (and recommends) a convergence loop where apply and verify run repeatedly until verify reports a clean state.

```text
        plan
         │
         ▼
       apply  ────► apply.md   (iteration N)
         │
         ▼
       verify ────► verify.md  (iteration N)
         │
         ├── PASS or PASS_WITH_WARNINGS ──► /opsx:continue → finalize → /opsx:archive
         │
         ├── FAIL, items fixable by code change ──► return to apply (N+1)
         │
         ├── FAIL, items in artifacts (spec drift) ──► fix artifact → apply (N+1)
         │
         └── Iteration > 5 ──► stop; report to the user
```

Termination rules (recorded in the verify artifact instruction and the apply: phase block step 4 in schema.yaml):

- **PASS** — `/opsx:continue` advances to the finalize artifact (Step 9). After finalize.md is written, run `/opsx:archive` (Step 10).
- **PASS_WITH_WARNINGS** — proceed; warnings are recorded for posterity but do not block.
- **FAIL with code-fixable items** — return to the apply phase, re-run, overwrite `apply.md` with iteration N+1, then re-run verify.
- **FAIL with artifact-level items** (e.g. spec drift, a requirement that is no longer satisfied by the plan) — fix the offending artifact first, then re-enter apply with iteration N+1.
- **Iteration > 5** — stop the loop and report to the user. This is a soft safeguard against non-convergence; the schema enforces nothing here, but the verify instruction tells the agent to halt the pattern.

The schema enforces only the file-existence dependency (`verify.requires: [apply]`). The iteration decision — whether to loop, stop, or escalate — is made by the agent (or, in a follow-up change, by a dedicated loop-runner command). No automated loop runner ships with v2.

---

## Phase 4: Spec Validation

The Spec Validation phase proves the implementation actually matches the proposal, specs, design, and tasks before the change is considered complete. It contains a single step.

### Step 8. Validation — `verify`

> Validates the completed implementation against the artifacts.

**Brief why:** Prove it matches intent.

**Why it's required.** Verify closes the loop between intent and implementation. It checks that the proposal, specs, design, tasks, and the actual code still agree before the change is considered complete. Code review alone — even a thorough Superpowers review — only checks that the code matches the *plan*; it does not check that the plan still matches the *specs*.

As of schema v2, `verify.requires: [apply]` — the DAG genuinely gates verify on the existence of `apply.md`. In v1 the dependency was declared as `[plan]` with a comment that "actually verify needs apply"; that mismatch was a frequent source of agents running verify before apply had executed. The v2 schema removes the mismatch.

**What the step does.** Invokes `openspec-verify-change` (the user-facing equivalent is `/opsx:verify`). Five checks are run, with results recorded in `verify.md`:

1. **Structural validation** — `openspec validate --all --json` returns all PASS.
2. **Task completion** — every `- [ ]` in `tasks.md` is now `- [x]`.
3. **Delta spec sync state** — `changes/<name>/specs/` has been synced into `openspec/specs/`.
4. **Design / specs coherence** — design decisions and spec requirements remain consistent (non-blocking warning).
5. **Implementation signal** — no unstaged files in the worktree.

If any check fails, the agent returns to the offending artifact, fixes it, and re-runs verify.

**Source phase used.** OpenSpec `/opsx:verify`.

**Step not used / replaced and why.** Superpowers code review alone is not enough. Review checks plan compliance and code quality; OpenSpec verify checks artifact-level correctness across specs, tasks, design, and implementation. Both layers are kept — review during apply, verify after apply.

---

## Phase 5: Finalization

The Finalization phase performs the git-side closeout for the change — merging the implementation worktree branch back into the user's feature branch, pushing the feature branch to update the existing PR, writing the finalize receipt, and posting a single code-reviewer onboarding comment on the PR. Schema v4 introduced **Pattern A** as the canonical finalize flow, executed directly by the schema instruction.

It contains a single step.

### Step 9. Finalize — `finalize` (Pattern A)

> Closes out the development branch in git terms; writes the finalize.md receipt; updates the existing PR; posts a code-reviewer onboarding comment.

**Brief why:** Restore the documented golden path — a single PR on the user's feature branch that carries logic pre-review, implementation, finalize, and archive commits in one reviewable diff before merge.

**Why it's required.** Before v4, the post-verify closeout invoked `superpowers:finishing-a-development-branch` and let its 4-option menu drive things. In practice this produced two failure modes (finalize.md off the PR branch; two related branches on remote — the user's feature branch with the pre-review PR sat orphaned while the skill opened a new PR from the worktree branch). v4 fixes this by having the schema execute Pattern A directly so the canonical flow is deterministic and matches the documented golden path.

**What the step does.** `/opsx:continue` advances to the finalize artifact, whose v4 instruction executes the Pattern A sequence:

1. Detect the worktree path, the worktree branch (`<change-name>`), and the feature branch.
2. Verify tests pass in the worktree.
3. Switch to the feature branch in the main checkout, pull from remote.
4. `git merge --ff-only <worktree-branch>` into the feature branch.
5. Re-verify tests on the merged result.
6. **Worktree cleanup** with a provenance guard — only remove if the worktree path is under `.worktrees/`, `worktrees/`, or `~/.config/superpowers/worktrees/`. Harness-owned worktrees are left in place.
7. Delete the local worktree branch (`git branch -d <worktree-branch>`).
8. Write `finalize.md` on the feature branch with Outcome `pr-updated`, the PR URL (discovered via `gh pr view`), final branch state, worktree cleanup status, test-baseline status, and the comment-status field (filled in step 11).
9. Commit the receipt: `docs(openspec): finalize receipt for <change>`.
10. `git push origin <feature-branch>` — the existing PR (opened manually between plan and apply for spec pre-review) auto-updates with the merge commits, finalize.md, and the full implementation history.
11. Post (or edit in place) a single code-reviewer onboarding comment on the PR.

The PR comment uses a marker (`<!-- superspec:finalize-comment -->`) to support idempotent upsert — re-running finalize edits the existing comment rather than duplicating it. The body is **paraphrased by the agent** from `proposal.md`, `tasks.md`, `apply.md`, `verify.md`, and (if present) `retrospective.md`. Verbatim copy from the source artifacts is forbidden. Target length 200–400 words, hard ceiling 600 words.

**Prerequisites for Pattern A.** The schema instruction checks all of these and skips Pattern A (directing the user to the escape hatch) if any is unmet:

- Currently on a feature branch in the main checkout (not the integration branch, not detached HEAD).
- A PR for the feature branch exists on the remote (`gh pr view <feature-branch>` returns a number).
- A worktree at the expected path exists for the change.

**Source phase used.** Schema-owned. Two narrow pieces are borrowed from `superpowers:finishing-a-development-branch` (Step 5 Option 1 merge structure + Step 6 worktree-cleanup provenance guard) with attribution and a recreation method — see the dedicated subsection below in the Superpowers skill index.

**Step not used / replaced and why.** v3 invoked `superpowers:finishing-a-development-branch` directly and used its 4-option menu. That menu doesn't fit Superspec's PR-pre-review workflow: its Option 2 creates a new PR from the worktree branch (leaving the user's feature branch orphaned), and its Option 1 merges into the integration branch (not the feature branch). v4 demotes the skill to a manual escape hatch for non-Pattern-A flows.

#### Escape hatch (manual skill invocation)

If your workflow doesn't match Pattern A, invoke `superpowers:finishing-a-development-branch` directly via the Skill tool and pick the option that matches your situation:

- **Option 1 (Merge locally)** — solo / local-only; merges into the integration branch and removes the worktree.
- **Option 2 (Push and create PR)** — brand-new PR via the skill (rare in the canonical Superspec workflow; only useful if you skipped the manual pre-review PR open between plan and apply).
- **Option 3 (Keep as-is)** — keep the worktree alive for iteration on PR feedback.
- **Option 4 (Discard)** — force-delete the work with the skill's typed-confirmation gate.

After the skill returns, hand-write `finalize.md` from `templates/finalize.md` picking the matching Outcome (`merge-locally`, `pr-created`, `kept-as-is`, `discarded`), commit it on the appropriate branch, and **always run the comment-posting subroutine** (defined in the finalize instruction). The subroutine self-skips when no PR exists (Options 1, 3, 4) and posts/edits the orientation comment when a PR exists (Option 2 or a previously opened PR). This step is the explicit guarantee that the code-reviewer comment exists on any PR present at finalize completion, even outside the Pattern A automation.

#### Recommended (non-blocking)

Before writing `finalize.md`, write a short `retrospective.md` in the change directory. Six suggested sections: Wins, Misses, Plan deviations, Skill/workflow compliance, Surprises, Promote candidates. Evidence first, opinion second. Skippable for trivial single-commit fixes. The retrospective's Plan deviations and Surprises sections feed the "Notable from the implementer" section of the PR onboarding comment.

---

## Phase 6: Archival

The Archival phase syncs the change's delta specs into the living spec tree and moves the change directory into the archive. It contains a single step.

### Step 10. Archive — `/opsx:archive`

> Syncs delta specs and freezes the change directory.

**Brief why:** Sync deltas and freeze the change.

**Why it's required.** Once the git side is closed out (Phase 5), the OpenSpec change still needs to be merged into the project's *living specs* and archived for history. `/opsx:archive` does both. It is intentionally git-agnostic — it does NOT merge branches or create PRs; that's Phase 5's job.

**What the step does.** Runs `/opsx:archive my-feature` (or `openspec archive`). Behavior:

- Validates the change (`openspec validate`) and checks task completion (unchecked items warn but don't block).
- Syncs delta specs into `openspec/specs/<capability>/spec.md`. Apply order: RENAMED → REMOVED → MODIFIED → ADDED. If already manually synced, use `--skip-specs`.
- Moves `openspec/changes/<name>/` into `openspec/changes/archive/YYYY-MM-DD-<name>/`. Both moves are committed on the current branch — typically the feature branch in the canonical golden path below.

#### Canonical PR-review golden path (v4)

```text
1. verify completes (verify.md committed on feature branch in the worktree)
2. finalize (Pattern A — schema merges worktree → feature branch, pushes
   to update existing PR, posts code-reviewer onboarding comment;
   finalize.md records Outcome: pr-updated, Final state: pr-updated;
   worktree is removed during finalize)
3. [PAUSE: human code review on the PR; reviewer approves]
4. /opsx:archive on the feature branch (syncs delta specs, moves change
   dir; new commits land on the feature branch)
5. Push the archive commits to update the PR (git push)
6. PR merge (gh pr merge --squash --delete-branch or GitHub UI)
```

The archive-before-merge ordering keeps the PR's diff complete: every commit that went into the change (implementation, finalize.md, archive sync) is in the PR. If the PR is merged before archive runs, the archive commits would have to be authored on the integration branch after the fact — recoverable but loses the unified audit trail.

Note: v3's step 7 ("Local worktree cleanup if still present") is no longer needed in Pattern A because the worktree is removed during finalize itself. Users falling back to the escape hatch with Option 3 (keep-as-is) or Option 2 (skill-created PR) may still need to clean up manually; see the local-merge variant below.

#### Local-merge variant (escape hatch, acceptable for solo / local-only changes)

If the user falls back to the escape hatch and picks the skill's Option 1 (Merge locally), the skill performs the merge into the integration branch inline and removes the worktree. `/opsx:archive` then runs on the integration branch directly. This inverts the archive/merge order vs. the canonical Pattern A path. Acceptable for solo or local-only changes where the PR audit trail isn't relevant.

**Source phase used.** OpenSpec `/opsx:archive` (or `openspec archive`).

**Step not used / replaced and why.** Superpowers has no equivalent step. Archive is OpenSpec's mechanism for promoting a change's delta specs into the living specs tree and freezing the change directory; it is fundamental to the spec-driven workflow and is not replaced by anything.

---

## Superpowers skill index & fallbacks

A flat view of every Superpowers skill Superspec invokes, where it's hooked in, and how to recover if it's unavailable.

### The 7 Superpowers touch points

| # | Skill | Hook | Trigger |
|---|---|---|---|
| 1 | `superpowers:brainstorming` | Phase 1 / Step 1 (`brainstorm`) | Direct |
| 2 | `superpowers:writing-plans` | Phase 2 / Step 6 (`plan`) | Direct |
| 3 | `superpowers:using-git-worktrees` | Phase 3 / Step 7 (`apply`), sub-step 1 | Direct |
| 4 | `superpowers:subagent-driven-development` | Phase 3 / Step 7 (`apply`), sub-step 2 | Direct |
| 5 | `superpowers:test-driven-development` | inside #4 | **Transitive** |
| 6 | `superpowers:requesting-code-review` | inside #4 | **Transitive** |
| 7 | `superpowers:finishing-a-development-branch` | Phase 5 / Step 9 — **Manual escape hatch only (v4)** | **Fallback** |

Direct triggers are invoked by the schema's artifact instructions; transitive triggers are activated *inside* another skill's loop (the subagent-driven-development workhorse — see [Step 7](#step-7-implementation--apply) for how it dispatches per-task subagents that enforce TDD and run code review).

### Manual fallbacks

If a Superpowers skill is unavailable (not installed, version mismatch), each artifact instruction includes a manual fallback so Superspec degrades gracefully to plain OpenSpec:

| Step | Skill normally invoked | Manual fallback |
|---|---|---|
| 1 — `brainstorm` | `superpowers:brainstorming` | Write `brainstorm.md` directly. |
| 6 — `plan` | `superpowers:writing-plans` | Write `plan.md` directly. |
| 7 — `apply` (subagents unavailable) | `superpowers:subagent-driven-development` | Use `superpowers:executing-plans`, or run tasks manually. Either path requires you to maintain TDD discipline and invoke `superpowers:requesting-code-review` yourself — neither is activated transitively when the subagent path is bypassed. |
| 9 — `finalize` | Pattern A (schema-executed; the schema instruction is the executor) | Manual fallback only if the schema instruction itself is unavailable (extremely rare) — invoke `superpowers:finishing-a-development-branch` directly, then hand-write `finalize.md`, then run the comment-posting subroutine. |

### Borrowed logic and recreation method

Schema v4 owns Pattern A's execution but borrows two narrow pieces of logic from `superpowers:finishing-a-development-branch`:

1. **Worktree-cleanup provenance guard** — only remove a worktree if its path is under `.worktrees/`, `worktrees/`, or `~/.config/superpowers/worktrees/`. Otherwise the harness owns the workspace and we leave it in place.
2. **Structural pattern** — test-verify in worktree → merge → test-verify on merged result → cleanup → delete branch. Taken from the skill's Step 5 Option 1.

Each borrow is annotated inline in the finalize artifact instruction with the upstream URL (`https://github.com/obra/superpowers/blob/main/skills/finishing-a-development-branch/SKILL.md`) and the commit SHA at the time of the port (`f2cbfbefebbfef77321e4c9abc9e949826bea9d7` as of v4).

**Recreation method.** If the upstream skill evolves and we need to re-port: diff the relevant steps against the upstream skill's current Step 5 Option 1 and Step 6, port any meaningful behavioral changes back into the finalize instruction, then update the inline SHA. Recommended cadence: re-check on every upstream Superpowers minor version bump. No automation — discipline by convention.

---

## See also

- [Workflow overview](workflow.md) — visual overview and quick mental model
- [README](../README.md) — install and quick start
- [`openspec/schemas/superspec/schema.yaml`](../openspec/schemas/superspec/schema.yaml) — machine-readable definition that drives all of the above
- [`openspec/schemas/superspec/INTEGRATION.md`](../openspec/schemas/superspec/INTEGRATION.md) — CLI cheat sheet, lifecycle, and design-choice rationale
- [`openspec/schemas/superspec/README.md`](../openspec/schemas/superspec/README.md) — schema design log and fallback strategy
