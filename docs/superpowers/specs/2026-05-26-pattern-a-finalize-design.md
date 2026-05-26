# Rewrite finalize to Merge Worktree Back and Update Existing PR (Pattern A)

**Date:** 2026-05-26
**Schema:** `superspec`
**Target version bump:** `3 → 4`
**Branch:** TBD (current `spec/clarify-post-verify-workflow` carries v3 work; implementation will land on a new branch, e.g. `spec/pattern-a-finalize`)
**Parent change:** v3 promoted finalize from a manual post-verify step to a DAG artifact (PR #4). This change rewrites finalize's **behavior** to match Superspec's PR-pre-review workflow.

## Problem

The v3 finalize artifact instruction tells the agent to invoke `superpowers:finishing-a-development-branch` and pick one of its four options (merge locally / push and PR / keep as-is / discard). In practice, two failure modes emerge with the PR option, and a third, latent issue lives in `apply` step 0.

**1. finalize.md ends up off the PR branch.**
The instruction order is "invoke skill, then write finalize.md." The skill executes Option 2 (push + create PR) before finalize.md is written. After the skill returns, the agent writes finalize.md from whatever CWD it lands in — typically the main repo checkout, not the worktree. The PR (created from the worktree branch) does not contain finalize.md. The user must manually reconcile.

**2. Two related branches end up on remote.**
Superspec's documented pattern starts on a user-created feature branch (e.g., `spec/X`) that receives the artifact commits. The apply phase creates a worktree off that branch with a new local branch named after the change. The skill's Option 2 pushes that *new* branch and opens a PR from it — leaving the user's original `spec/X` branch on remote as an orphan, with no PR linking it to anything.

The combination of (1) and (2) makes the documented Phase 6 golden path (`/opsx:archive` on the feature branch → push to update the PR → merge) impossible to follow cleanly without manual reconciliation.

**3. `apply` step 0 inverts the recommended starting state.**
Step 0 treats "start on integration branch" as canonical and "start on a feature branch" as a tolerated deviation ("warn but still proceed"). For any team-shared PR-review workflow this is backwards: committing pre-implementation artifacts to main before the implementation exists pollutes main with "documented but not delivered" commits.

## Goals

- Restore the Phase 6 golden path: a single PR on the user's feature branch, opened during phases 1-6 for logic pre-review and updated through finalize and archive, containing every commit in the change.
- Make the canonical Superspec finalize flow execute deterministically via `/opsx:continue` with no copy-paste reconciliation.
- Demote `superpowers:finishing-a-development-branch` from "the finalize executor" to "an escape hatch users can invoke manually when their flow doesn't match Pattern A."
- Update `apply` step 0 wording to recommend a user-created feature branch as the canonical starting state.
- Document the logic borrowed from the upstream skill with explicit attribution and a recreation method, so the schema can be re-aligned with upstream if the skill changes.
- Update all docs, the SVG flowchart, INTEGRATION.md, and templates to reflect the new flow.
- **Onboard the code reviewer with a single PR comment** posted at finalize completion when a PR exists. The comment is aimed at a reviewer who did **not** pre-review the spec (the logic reviewer and code reviewer are often different humans). It links to the change artifacts, suggests a reading order, and summarizes what to look for in the diff.

## Non-goals

- Automating the `git push` + `gh pr create` step the user runs manually between plan and apply. (User decision: stays manual to minimize friction.)
- Detecting "no PR exists when finalize runs" and falling back to creating one. The schema documents the expected workflow; users who deviate handle reconciliation themselves.
- Modifying any upstream Superpowers skill.
- Supporting non-Pattern-A flows through the schema's auto-executed path. Users with different flows invoke the skill manually (escape hatch).
- Modifying `/opsx:archive` behavior. Archive remains spec-side only and unchanged from v3.
- Promoting `retrospective.md` to a DAG artifact. It stays as a recommendation in finalize's instruction.

## Pattern A definition

The workflow the schema commits to executing automatically:

| Phase | Where | What |
|---|---|---|
| brainstorm → plan | feature branch in main checkout | artifacts committed locally |
| (manual) `git push` + `gh pr create` | feature branch → main | PR opens, artifacts only — logic pre-review |
| reviewer approves logic | PR comments | (asynchronous, blocks `/opsx:apply` only by convention) |
| `/opsx:apply` | worktree off feature branch, new worktree branch | implementation + apply.md |
| `/opsx:verify` | worktree | verify.md |
| `/opsx:continue` → finalize | worktree → feature branch (merge-back) → push | finalize.md written on feature branch; PR auto-updates; code-reviewer onboarding comment posted/edited on the PR |
| reviewer approves code | PR comments | (asynchronous) |
| `/opsx:archive` | feature branch in main checkout | delta sync + change-dir move; push to update PR |
| PR merge | GitHub | squash-merge into main; branch deleted |

Two key invariants Pattern A guarantees:

- **One remote feature-related branch** (the user's feature branch). The worktree branch is local-only and is consumed at finalize time.
- **One PR carries everything.** Logic-review commits + implementation commits + finalize.md + archive commits are all in the same PR's diff before merge.

## Design

### Finalize artifact: schema executes Pattern A directly

The finalize instruction owns the full Pattern A sequence. Concretely the agent executes (paraphrased; final wording in the schema diff below):

1. Detect the worktree path and worktree branch name from `git worktree list`. Detect the feature branch (the branch the main checkout is on, or — more robustly — the branch the worktree was created from).
2. From the worktree, run the project test command. Stop on failure.
3. `cd` to main checkout root, `git checkout <feature-branch>`, `git pull`.
4. `git merge --ff-only <worktree-branch>`. Stop with a clear error if fast-forward fails (means the feature branch diverged after worktree creation; needs manual reconciliation).
5. Re-run the project test command on the merged result. Stop on failure.
6. **Worktree cleanup with provenance guard** (borrowed; see below). Only remove if the worktree path is under `.worktrees/`, `worktrees/`, or `~/.config/superpowers/worktrees/`.
7. `git branch -d <worktree-branch>`.
8. Write `openspec/changes/<name>/finalize.md` per `templates/finalize.md`. Outcome: `pr-updated` (a new outcome value, distinct from v3's `pr-created`). PR URL discovered via `gh pr view <feature-branch> --json url`.
9. `git commit` with message `docs(openspec): finalize receipt for <change>`.
10. `git push origin <feature-branch>` — the existing PR auto-updates with the implementation commits, finalize.md, and the merge.
11. **Detect existing PR and post a code-reviewer onboarding comment** (see "Code-reviewer onboarding comment" below). Non-blocking — if the comment step fails, finalize still succeeds; the failure is recorded in finalize.md.

### Code-reviewer onboarding comment

Assumption: the human who pre-reviewed the proposal/specs (logic review) may not be the same human who reviews the code. The code reviewer often comes in cold, sees a PR diff, and has to reverse-engineer the intent of the change from the artifacts. The schema posts a single PR comment at finalize time to orient them.

The comment runs after the push (step 10) completes, only when a PR exists for the feature branch. Discovery:

```
PR_NUMBER=$(gh pr view <feature-branch> --json number --jq .number 2>/dev/null)
```

If `PR_NUMBER` is empty (no PR found), skip the comment and continue. The escape-hatch flows that don't open a PR (Option 1 merge-locally, Option 3 keep-as-is, Option 4 discarded) naturally fall into this skip case. The escape-hatch Option 2 (skill created a new PR) reaches this step with a PR present, so it also gets a comment.

**Comment body structure** (markdown, posted via `gh pr comment`):

```markdown
<!-- superspec:finalize-comment -->
## Superspec finalize — code review orientation

This PR has just been updated with the implementation and the full openspec change directory at `openspec/changes/<change-name>/`. It is transitioning from logic pre-review (which the spec/design reviewer already completed) to **code review**.

### What this change is

<extracted from proposal.md — Why section, 1-3 sentences>

### Capabilities affected

<from proposal.md Capabilities section — bulleted: New + Modified>

### Suggested code-reviewer reading order

1. `openspec/changes/<change-name>/proposal.md` — motivation
2. `openspec/changes/<change-name>/specs/<capability>/spec.md` — behavioral requirements (the code must match these scenarios)
3. `openspec/changes/<change-name>/design.md` *(if present)* — technical approach and decisions
4. PR diff — the actual code
5. `openspec/changes/<change-name>/verify.md` — validation results (look for warnings)

### Implementation summary

- **Tasks**: `<X>` of `<Y>` complete (see `tasks.md` for details).
- **Apply iterations**: `<N>` (see `apply.md`).
- **Verify outcome**: `<PASS / PASS_WITH_WARNINGS>`.
- **Test baseline at finish**: passing.

### Notable from the implementer
<from retrospective.md "Plan deviations" + "Surprises" sections if retrospective.md exists; otherwise: "No retrospective notes provided.">

---
*Auto-generated by Superspec finalize (Pattern A). Full receipt at `openspec/changes/<change-name>/finalize.md`. Re-running finalize will edit this comment in place, not duplicate it.*
```

**Idempotency / re-run behavior.** The leading `<!-- superspec:finalize-comment -->` HTML comment is a marker. Before posting, the schema instructs the agent to list existing PR comments (`gh api repos/<owner>/<repo>/issues/<PR_NUMBER>/comments`), search for one whose body starts with that marker, and:

- If found → edit in place (`gh api -X PATCH repos/<owner>/<repo>/issues/comments/<COMMENT_ID> -f body=@-`), preserving its place in the PR conversation.
- If not found → post a new comment.

This keeps the PR clean even if the user re-enters finalize (e.g., after an iteration loop that updates tasks/verify status).

**Failure handling.** The comment-posting step is non-blocking. If `gh` is unavailable, the PR is in a draft state that disallows comments, or the API call fails for any reason, the agent records the failure in finalize.md (`PR comment: failed — <reason>`) but does not roll back the merge/push. The change is still git-clean; the comment is a nice-to-have, not a correctness gate.

**Where the comment content comes from.** All bracketed sections in the template are filled from the change directory's own artifacts. No external state required. If a referenced artifact is missing (e.g., no retrospective.md), the corresponding section uses the documented fallback wording shown above.

### Escape hatch: manual skill invocation

The finalize instruction's closing paragraph names `superpowers:finishing-a-development-branch` as the manual fallback for situations Pattern A doesn't cover:

- Solo / no-PR workflow → skill's Option 1 (merge locally to main).
- Iteration with worktree preserved → skill's Option 3 (keep as-is).
- Discard → skill's Option 4 (force-delete with typed confirmation).

The schema does not execute these paths itself. The instruction tells the user to invoke the skill via the Skill tool, pick the option, then hand-write finalize.md from `templates/finalize.md` once the skill returns.

### `apply` step 0 wording flip

Step 0's "Branch-state checks" subsection inverts its emphasis:

- **Recommended**: a feature branch (any branch that isn't the project's integration branch). Canonical Pattern A starting state.
- **Tolerated with warning**: on the integration branch (`main` / `master`). Proceed, but warn that artifact commits will land on the integration branch and that finalize's Pattern A flow will not produce a usable PR (no separate feature branch to merge into).
- **Detached HEAD**: warn; finalize's Pattern A flow is skipped because there is no feature branch to merge into. The user falls back to the manual escape hatch.

### Borrowed-logic discipline

The schema borrows two narrow pieces from the upstream skill:

- **Worktree-cleanup provenance check** (step 6): the allowlist for `.worktrees/` / `worktrees/` / `~/.config/superpowers/worktrees/`. The skill's reasoning — "only clean up worktrees Superpowers created; harness-owned worktrees stay in place" — applies identically here.
- **Structural pattern** of test-verify → merge → test-verify → cleanup → delete-branch. Taken from the skill's Step 5 Option 1.

Each borrow is annotated inline in the schema instruction with:

```
# Borrowed from superpowers:finishing-a-development-branch Step <N>.
# Upstream: https://github.com/obra/superpowers/blob/main/skills/finishing-a-development-branch/SKILL.md
# Commit at time of port: <SHA>  (resolved during implementation)
# To re-port: diff against latest upstream Step <N>, port meaningful changes,
# update the commit hash above.
```

A dedicated subsection in `docs/workflow-details.md` ("Borrowed logic and recreation method") restates this for discoverability and gives a recommended maintenance cadence (review on every upstream Superpowers minor version bump).

## Schema changes (diff sketch)

```yaml
name: SuperSpec
version: 4                # was 3
description: >
  ... existing description ...
  v4: finalize's instruction is rewritten to execute Pattern A directly
  (merge the implementation worktree branch back into the user's feature
  branch locally, push the feature branch to update the existing PR)
  rather than invoking superpowers:finishing-a-development-branch. The
  skill is retained as a manual escape hatch for non-Pattern-A flows.
  apply step 0 wording is also updated to recommend a user-created
  feature branch as the canonical starting state (previously the
  schema recommended starting on the integration branch).

artifacts:
  # brainstorm, proposal, design, specs, tasks, plan unchanged

  - id: apply
    # generates / description / template / requires unchanged
    # instruction unchanged (apply.md receipt instruction)

  - id: verify
    # unchanged from v3

  - id: finalize
    generates: finalize.md
    description: Pattern A git-side closeout — merge worktree back into feature branch and update PR
    template: finalize.md
    instruction: |
      <full Pattern A sequence — see "Design > Finalize artifact" above,
      with inline borrowed-logic annotations and escape-hatch paragraph>
    requires:
      - verify

apply:
  requires: [plan]
  tracks: tasks.md
  instruction: |
    # Step 0 reworded: "Recommended: feature branch" promoted from
    # warning-tolerated to canonical. "On integration branch" demoted
    # from canonical to tolerated-with-warning.
    # Steps 1-4 unchanged.
```

## Template changes

### `templates/finalize.md`

- Add `pr-updated` as a valid Outcome value (distinct from v3's `pr-created`). `pr-updated` is the Pattern A canonical outcome: an existing PR was updated, not newly created. The other values (`merge-locally`, `kept-as-is`, `discarded`) remain for escape-hatch users.
- Update Final state values to include `pr-updated` alongside the existing set, kept distinct from `pr-open`: `merged` | `pr-open` | `pr-updated` | `kept-open` | `deleted`.
- Update Next step outcome-specific wording: add `pr-updated` bullet pointing at the archive-then-push-then-merge sequence (same as v3's `pr-created` wording, since the downstream sequence is identical).
- Add a new field `PR comment status`: `posted` | `edited-existing` | `skipped (no PR)` | `failed: <reason>`. This records whether the code-reviewer onboarding comment landed.

### `templates/verify.md`

No content change needed; the convergence-loop reminder already says "PASS → `/opsx:continue` advances to finalize." Nothing in the reminder commits to a specific finalize implementation, so it remains valid.

## Doc updates

| File | What changes |
|---|---|
| `openspec/schemas/superspec/schema.yaml` | Version bump 3 → 4. Finalize artifact instruction fully rewritten per Pattern A. Apply step 0 branch-state wording flipped. Description block updated to note v4 changes. |
| `openspec/schemas/superspec/templates/finalize.md` | Add `pr-updated` Outcome and update Next step wording. |
| `openspec/schemas/superspec/INTEGRATION.md` | Section 2 (7 touch-points table): row 7 changes from "Direct (finalize artifact invokes finishing-a-development-branch)" to "Fallback only — schema executes Pattern A directly." Section 4 (walkthrough): rewrite Step 4 (Finalization) to describe Pattern A's auto-executed sequence; mention the escape hatch. Section 6 (design choices): new entry "Why the schema executes Pattern A directly (v4)." New "Migration from v3" subsection. |
| `openspec/schemas/superspec/README.md` | Workflow overview diagram unchanged (still 10 steps). Differences table: update finalize row. Decision log: add "Why we own Pattern A's logic instead of calling the skill (v4)." |
| `docs/workflow.md` | Phase 5 (Finalization) summary subsection: replace the "invoke finishing-a-development-branch" line with "schema executes Pattern A: merge worktree back, push to update PR." |
| `docs/workflow-details.md` | Phase 5 (Finalization) section: full rewrite. Document the Pattern A sequence as the canonical flow; document the manual escape hatch; document the code-reviewer onboarding comment (what it contains, why it exists, marker-based idempotency). Add a "Pattern A workflow" framing that complements the existing "Canonical PR-review golden path" in Phase 6. Phase 6 golden path: update step 2 ("finalize") to reflect Pattern A's merge-back-and-push-and-comment behavior instead of skill-creates-PR behavior. Step 7 (worktree cleanup) becomes unnecessary in Pattern A (cleanup happens during finalize) — note this. Add a new "Borrowed logic and recreation method" subsection in the Superpowers skill index. |
| `docs/workflow-mermaid.md` | If the mermaid diagram mentions skill invocation for finalize, update the label. |
| `docs/project-layout.md` | No structural change; finalize.md is already documented. Verify wording for accuracy if it mentions the skill. |
| `docs/assets/superspec-phases-flowchart.svg` | Regenerate. If Phase 5 block currently labels the skill as the executor, update to reflect schema-owned Pattern A. (Recent commit 8dce140 regenerated for v3; this regen replaces that one.) |
| `README.md` (root) | Tagline: bump to schema v4 if the README mentions schema version. Quick Start section: update the description of `/opsx:continue` to mention "merge worktree back, update PR" instead of "invoke finishing-a-development-branch." |

## Testing

- `openspec validate` against the new schema parses cleanly (zod) and validates the DAG (no cycle; all `requires` resolve; finalize.requires: [verify] still points at an existing artifact).
- Hand-walk `version == 4`, artifact list unchanged from v3 in shape (`[brainstorm, proposal, design, specs, tasks, plan, apply, verify, finalize]`), finalize.requires still `[verify]`.
- Doc-DAG consistency: grep every mention of "finishing-a-development-branch" across the repo. Each occurrence must either (a) describe the escape hatch correctly or (b) reference the borrowed logic with attribution. No bare "the schema invokes finishing-a-development-branch" lines should survive.
- Template-instruction alignment: finalize's instruction references `pr-updated`; templates/finalize.md must list `pr-updated` as a valid Outcome.
- Manual integration test: in a test project, run the full Pattern A flow against this schema. Confirm: only one feature branch on remote, PR contains finalize.md before the second-round code review begins, archive runs on the same branch, single merge closes the PR.
- Manual escape-hatch test: in a test project, deliberately skip the manual PR-open step and run `/opsx:continue`. Confirm: the instruction's escape-hatch paragraph triggers, the user can invoke the skill manually, and writing finalize.md by hand from the template works.
- Manual code-reviewer-comment test: run Pattern A end-to-end. Confirm a single PR comment appears with the marker, the reading-order list, and the fallback wording for any artifact that wasn't present (e.g., no design.md, no retrospective.md). Re-run finalize against the same PR; confirm the existing comment is **edited in place**, not duplicated.
- Failure-tolerance test: simulate a `gh` failure (e.g., temporary auth issue or rate-limit) during the comment step; confirm finalize still completes with the merge/push intact and finalize.md records `PR comment: failed — <reason>`.

## Edge cases

- **Fast-forward merge fails in step 4** (feature branch diverged after worktree creation). Stop with a clear error. User reconciles manually (rebase, etc.). This is an uncommon corner — typically the feature branch is untouched while apply runs in the worktree.
- **Tests pass in worktree (step 2) but fail on merged result (step 5).** Stop. Worktree branch contains the failing state; user investigates. The worktree is still on disk for forensics until they re-run finalize.
- **`gh pr view` returns no PR for the feature branch.** Pattern A's prerequisite was missed (user skipped the manual `gh pr create`). Schema instruction tells the agent to alert the user and either (a) run `gh pr create` themselves and re-enter finalize, or (b) fall back to the manual escape hatch.
- **Worktree path is harness-owned** (not under `.worktrees/`/`worktrees/`/`~/.config/superpowers/worktrees/`). Provenance guard skips removal. Finalize completes; user removes the worktree manually via their harness.
- **User on detached HEAD when running `/opsx:continue`.** Apply step 0 already warned about this. Pattern A is skipped; user uses the escape hatch.
- **User started apply on the integration branch.** Apply step 0 warned about this. Pattern A's merge-back step would try to merge into main, which is nominally possible but not the workflow Superspec is documenting. Finalize soft-fails: warn the user that Pattern A isn't appropriate, point them at the escape hatch, and let them choose.
- **PR comment cannot be posted** (gh unavailable, draft PR with comments disabled, network/auth failure, rate limit). Pattern A continues; finalize.md records `PR comment: failed — <reason>`. The merge, push, and finalize.md write are not rolled back. Optionally, a follow-up `/opsx:continue` could re-attempt the comment once the underlying issue is fixed.
- **PR comment marker collides with an existing comment** authored by the user that happens to contain the marker string. Extremely unlikely (the marker is `<!-- superspec:finalize-comment -->`), but if it happens, the agent edits that comment in place. Mitigation is purely "don't author user comments containing that marker."

## Migration from schema v3

In-flight v3 changes that already have finalize.md will progress through `/opsx:continue` unchanged — the existence of finalize.md is what the walker checks, and Pattern A only kicks in when finalize.md is being generated for the first time.

For users mid-change-with-no-finalize.md-yet, the v4 schema simply changes what `/opsx:continue` instructs them to do at finalize time. Their feature branch and worktree are unaffected; they get the Pattern A flow on next finalize attempt.

Projects pinned to v3 keep working. v4's changes are confined to the finalize artifact's instruction body, the apply step-0 wording, and the finalize.md template's enumerations. The DAG shape (artifact list, `requires` edges, generates files) is identical to v3.

## Risks

- **Schema instruction grows in complexity.** Pattern A is ~10 explicit steps with conditional branches (test failures, provenance check, escape-hatch trigger). Mitigation: numbered steps, inline borrowed-logic comments, clear bail-out points. Reviewers should reject PRs that drift the instruction from the documented Pattern A.
- **Borrowed logic drifts from upstream.** Mitigation: the inline attribution comments include the upstream commit SHA at port time. A subsection in workflow-details.md restates the discipline and recommends re-checking on every upstream Superpowers minor version bump. No automation; this is discipline-by-convention.
- **Users skip the manual PR-open step.** Pattern A breaks (step 10's push has no PR to update). Mitigation: the schema instruction detects "no PR for this feature branch" at step 8 and falls back to the escape hatch with a clear message. Documented as an edge case above. Non-blocking on the schema side.
- **The skill upstream renames Step 5 / Step 6 / Option 1.** The inline attribution comments still point at the upstream URL; the SHA captures the pin. Even if structure changes, the borrowed *logic* (test-verify → merge → cleanup with provenance guard) is the artifact that needs re-evaluation, not the section numbering. The recreation method covers this.
- **Pattern A doesn't fit every team's GitFlow.** Mitigation: the escape hatch is first-class, not a footnote. Teams that want sequential PRs (Pattern B) or stacked PRs (Pattern C) can invoke the skill manually or build a follow-up schema variant.

## Resolved decisions (formerly open)

These were open during brainstorming and now have explicit answers, recorded here for the implementation phase:

- **`Outcome` enum keeps `pr-created` and `pr-updated` distinct.** `pr-created` is the escape-hatch path (skill's Option 2 created a new PR). `pr-updated` is the Pattern A canonical path (existing PR was updated). finalize.md self-documents which flow ran.
- **`Final state` enum keeps `pr-open` and `pr-updated` distinct**, same rationale.
- **`apply` step 0 soft-fails on the integration branch.** Warn the user, but proceed. Hard-fail would force users to back out and create a branch first, which is more disciplinarian than necessary for a default.
- **Finalize soft-fails on "feature branch == integration branch".** Warn and direct the user to the escape hatch (manual skill invocation), but do not block. Pattern A is not attempted when there is no separate feature branch to merge into; the warning explains why.

## Open questions

None remaining.

## Out of scope (deferred or upstream)

- Modifying `/opsx:archive` to push or merge PRs. Archive stays pure spec-side.
- A literal `/opsx:finish` command. `/opsx:continue` is the entry point; no new CLI surface needed.
- Automating the `git push` + `gh pr create` step between plan and apply. (User decision: stays manual.)
- Linting or tooling to detect "PR doesn't exist when finalize runs." The edge-case handling inside the instruction covers this without external tooling.
- Promoting `retrospective.md` to a DAG artifact. Stays as a recommendation in finalize's instruction.
- Supporting Patterns B (sequential PRs) and C (stacked PRs) through the schema. Documented as patterns that users implement manually using the escape hatch.
