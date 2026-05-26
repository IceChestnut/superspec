# Git-Side Closeout Finalize Implementation Plan (schema v4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the finalize artifact so the schema executes the git-side closeout directly (merge worktree back into feature branch, push to update existing PR, post code-reviewer onboarding comment) instead of delegating to `superpowers:finishing-a-development-branch`, demote that skill to a manual escape hatch, soft-warn instead of canonical when `apply` starts on the integration branch, and bring every dependent doc in line with the new behavior.

**Architecture:** All work lives in the schema/templates/docs/SVG layer — no application code, no test runner. "Tests" are schema validation (`openspec validate --all --json`), grep-based doc consistency checks, and one end-to-end manual integration test plus targeted manual tests for the new PR-comment subroutine. The PR-comment subroutine itself is a sequence of `gh` shell commands embedded in the finalize artifact instruction (not standalone code).

**Tech Stack:** YAML (schema), Markdown (docs/templates), `openspec` CLI for validation, `gh` CLI for the PR-comment subroutine, Mermaid → SVG for the flowchart regen.

**Spec:** [`/Users/DHanold/dev/superspec/docs/superpowers/specs/2026-05-26-pattern-a-finalize-design.md`](../specs/2026-05-26-pattern-a-finalize-design.md) — every task in this plan implements a section of that spec; the spec is the authoritative source for content choices.

**Implementation branch:** `spec/pattern-a-finalize` (already checked out off `spec/clarify-post-verify-workflow`).

---

## Task ordering rationale

1. **Schema first (Tasks 1–3)** — schema.yaml + templates/finalize.md form the contract. Get them right before docs reference them.
2. **Schema-area docs (Tasks 4–5)** — INTEGRATION.md and the schema README live next to schema.yaml and must agree with it.
3. **Project docs (Tasks 6–10)** — every doc that references finalize behavior or schema version. Order: workflow.md (overview), workflow-details.md (deep dive), workflow-mermaid.md (source of truth for the SVG), project-layout.md (trivial check), root README.md (user-facing).
4. **SVG regen (Task 11)** — depends on the updated mermaid.
5. **Validation passes (Tasks 12–13)** — `openspec validate` + a doc-consistency grep before manual integration.
6. **Manual integration tests (Task 14)** — end-to-end verification of the git-side closeout and the escape hatch.
7. **PR-update commit and ready-for-review (Task 15)** — final state on the branch.

Commits land at the end of each task. No squashing in-plan — final squash is the PR merge.

---

## File Structure

| File | Action | Owner | Brief |
|---|---|---|---|
| `openspec/schemas/superspec/schema.yaml` | Modify | Tasks 1, 2 | Apply step 0 wording (Task 1), finalize artifact instruction full rewrite + version bump (Task 2) |
| `openspec/schemas/superspec/templates/finalize.md` | Modify | Task 3 | New enums (`pr-updated`), new `PR comment status` field, updated Next-step bullet for `pr-updated` |
| `openspec/schemas/superspec/INTEGRATION.md` | Modify | Task 4 | Touch-point table row 7, walkthrough Step 4 (Finalization) rewrite, Design Choice #6 update, Section 6 new "Migration from v3" subsection, schema version reference |
| `openspec/schemas/superspec/README.md` | Modify | Task 5 | Differences table finalize row, new Decision Log entry "Why we own the git-side closeout's logic (v4)", schema version reference |
| `docs/workflow.md` | Modify | Task 6 | Phase 5 summary subsection rewrite, schema version reference |
| `docs/workflow-details.md` | Modify | Task 7 | Phase 5 full rewrite (canonical git-side closeout + escape hatch + PR comment subroutine + borrowed-logic subsection), Phase 6 golden-path rewrite, Superpowers skill index touch-point row 7 update |
| `docs/workflow-mermaid.md` | Modify | Task 8 | Phase 5 mermaid block content (git-side closeout semantics instead of "finishing-a-development-branch") |
| `docs/project-layout.md` | Check / modify if needed | Task 9 | No structural change expected; verify finalize.md is described in a way consistent with v4 |
| `docs/assets/superspec-phases-flowchart.svg` | Regen | Task 11 | Mermaid → SVG regeneration; check commit `8dce140` for how the last regen was done |
| `README.md` (root) | Modify | Task 10 | Tagline "Schema version 4", Quick Start `/opsx:continue → finalize` description |

No new files. No file deletions.

---

## Task 1: Apply step-0 branch wording flip

**Files:**
- Modify: `openspec/schemas/superspec/schema.yaml` — specifically the `apply:` top-level phase block, sub-step 0 (`Pre-flight — commit change artifacts to current branch`), step `d` (the "If on a detached HEAD or a branch that is not the project's integration branch..." paragraph)

**Spec reference:** "`apply` step 0 wording flip" subsection in the design doc.

**What's changing:** The current wording at `schema.yaml` (the schema.apply.instruction step 0d paragraph) treats "not on integration branch" as the tolerated-with-warning case and implies "integration branch" is canonical. We invert that: feature branch is canonical and recommended; integration branch is tolerated with a louder warning that names the consequence for finalize.

- [ ] **Step 1: Read the current schema and locate step 0d.**

Open `openspec/schemas/superspec/schema.yaml`. Find the `apply:` top-level block, sub-step 0, paragraph beginning `d. If on a detached HEAD or a branch that is not the project's integration branch`. Confirm you're on the right paragraph before editing.

- [ ] **Step 2: Replace step 0 with the v4 wording.**

Replace the entire body of step 0 (paragraphs a–d) with this exact YAML-friendly multi-line string (preserving the existing two-space indentation of the surrounding `instruction:` block):

```
    0. **Pre-flight — commit change artifacts to feature branch**:

       Superspec's canonical starting state is a user-created feature
       branch (e.g., `spec/<change-name>`, `feat/<change-name>`). The
       artifact phases (brainstorm through plan) should have committed
       their files to this branch. Step 0 ensures the change directory
       is committed before the worktree is created.

       Steps:
       a. Run `git status --porcelain openspec/changes/<name>/` to
          inspect state.
       b. If the output contains untracked entries (lines starting
          with `??`), stage and commit ONLY this change's directory
          (do NOT use `git add -A`):

          ```
          git add openspec/changes/<name>/
          git commit -m "docs(openspec): scaffold <name> change

          Captures pre-implementation artifacts (brainstorm/proposal/
          specs/tasks/plan) so the implementation worktree starts
          with the change directory already tracked."
          ```

       c. If the output is empty (everything committed) or contains
          only modifications (`M`) without untracked entries, skip
          the commit — the change directory is already tracked.

       d. **Branch-state checks** (v4):
          - **Recommended**: a feature branch (any branch that is not
            the project's integration branch — typically `main` or
            `master`). This is the canonical starting state for the
            git-side closeout. Finalize's git-side closeout will merge
            the worktree back into this branch and push to update the
            existing PR.
          - **Tolerated with warning**: on the integration branch.
            Proceed, but warn the user that (1) artifact commits will
            land on the integration branch and (2) finalize's git-side
            closeout will not produce a usable PR because there is no
            separate feature branch to merge into; the user will need
            to fall back to the manual escape hatch in finalize.
          - **Detached HEAD**: warn the user that finalize's git-side
            closeout will be skipped (no branch to merge into), and
            the user will need to use the escape hatch. Proceed with
            apply on the detached HEAD; the worktree will still be
            created.
```

- [ ] **Step 3: Validate the schema still parses.**

Run from the repo root:

```bash
openspec validate --all --json
```

Expected: all items return `"valid": true`. If there's a YAML indentation error in the new paragraph, fix and re-run.

- [ ] **Step 4: Commit.**

```bash
git add openspec/schemas/superspec/schema.yaml
git commit -m "feat(schema): apply step 0 recommends feature branch (v4 prep)"
```

(The version bump itself happens in Task 2.)

---

## Task 2: Finalize artifact full rewrite + version bump

**Files:**
- Modify: `openspec/schemas/superspec/schema.yaml` — top-level `version:` field; `description:` block; the `finalize` artifact (`id: finalize`) block, specifically its `instruction:` body and `description:` line

**Spec reference:** "The git-side closeout (canonical, schema-executed)", "Code-reviewer onboarding comment", "Escape hatch: manual skill invocation", "Schema changes (diff sketch)" sections of the design doc. The instruction body below is the assembled result of those sections.

- [ ] **Step 1: Bump `version` from `3` to `4`.**

In `openspec/schemas/superspec/schema.yaml`, change the top-level line:

```yaml
version: 3
```

to:

```yaml
version: 4
```

- [ ] **Step 2: Update the `description:` block to record what v4 changes.**

Replace the existing `description:` block's trailing v3 paragraph (the one starting `v3: finalize is promoted...`) with both the v3 paragraph and a new v4 paragraph. The full updated block should end with these two paragraphs (preserve indentation):

```
  v3: finalize is promoted from a manual post-verify step (documented
  inside the apply: block) to a real DAG artifact; /opsx:continue is
  now the OPSX-vocabulary entry point for git-side closeout.
  v4: finalize's instruction is rewritten to execute the git-side
  closeout directly (merge the implementation worktree branch back
  into the user's feature branch locally, push the feature branch to
  update the existing PR) rather than invoking
  superpowers:finishing-a-development-branch. The skill is retained
  as a manual escape hatch for non-canonical flows. Apply step 0
  wording is also updated to recommend a user-created feature branch
  as the canonical starting state (previously the schema recommended
  starting on the integration branch).
```

- [ ] **Step 3: Update the finalize artifact's `description:` line.**

In the `finalize` artifact block, change:

```yaml
    description: Git-side closeout (PR / merge / worktree cleanup) before archive
```

to:

```yaml
    description: Git-side closeout — merge worktree back into feature branch and update PR
```

- [ ] **Step 4: Replace the finalize artifact's `instruction:` body with the v4 git-side closeout instruction.**

Replace the entire existing `instruction: |` block of the `finalize` artifact with this body (keep the `instruction: |` line and the indentation):

```
      The git-side closeout is Superspec's canonical finalize flow:
      merge the implementation worktree branch back into your feature
      branch locally, push the feature branch to update the existing
      PR (the one opened manually between plan and apply for spec
      pre-review), write the finalize.md receipt, and post a
      code-reviewer onboarding comment on the PR.

      Prerequisites for the git-side closeout:
      - You are on a feature branch in the main checkout (apply
        step 0 should have recommended this — check `git branch
        --show-current`).
      - The feature branch is NOT the integration branch (main /
        master); if it is, skip the git-side closeout and use the
        escape hatch at the bottom of this instruction.
      - A PR for this feature branch already exists on the remote
        (you opened it manually between plan and apply).
      - Apply ran in a worktree at `.worktrees/<change-name>/` with
        a worktree branch named `<change-name>`.

      If any prerequisite is not met, skip the auto-executed flow
      below and invoke `superpowers:finishing-a-development-branch`
      manually — see "Escape hatch" at the bottom.

      Git-side closeout execution steps:

      1. Compute paths and discover branch names:

         WORKTREE=$(git worktree list --porcelain | awk '/^worktree / {wt=$2} /^branch refs\/heads\/<change-name>/ {print wt; exit}')
         # If WORKTREE is empty, list `git worktree list` and ask the
         # user which path corresponds to this change.
         WORKTREE_BRANCH="<change-name>"
         FEATURE_BRANCH=$(git -C "$WORKTREE" log --format=%D -1 HEAD~$(git -C "$WORKTREE" rev-list --count HEAD ^"<integration-branch>") | tr ',' '\n' | grep -oE '^ *[^ ]+' | head -1)
         # Fallback: ask the user to confirm FEATURE_BRANCH if
         # detection is ambiguous.

      2. Verify tests pass in the worktree:

         cd "$WORKTREE"
         <project test command, e.g. `npm test`, `cargo test`, `pytest`>
         # Stop on failure — record the failure in finalize.md and
         # do not proceed.

      3. Switch to feature branch in main checkout and pull:

         MAIN_ROOT=$(git -C "$WORKTREE" rev-parse --git-common-dir)/..
         cd "$MAIN_ROOT"
         git checkout "$FEATURE_BRANCH"
         git pull

      4. Merge worktree branch (fast-forward only):

         git merge --ff-only "$WORKTREE_BRANCH"
         # If fast-forward fails, stop. The feature branch diverged
         # after worktree creation; the user must reconcile manually
         # (rebase the worktree branch onto the feature branch, then
         # re-enter finalize).

      5. Re-verify tests on the merged result:

         <project test command>
         # Stop on failure — the worktree branch is still on disk for
         # forensics until the user re-runs finalize.

      6. Worktree cleanup with provenance guard
         (borrowed from superpowers:finishing-a-development-branch
         Step 6 — see "Borrowed logic" below for attribution and the
         recreation method):

         WORKTREE_REL=$(realpath --relative-to="$MAIN_ROOT" "$WORKTREE")
         case "$WORKTREE_REL" in
           .worktrees/*|worktrees/*) OWN=1 ;;
           *) case "$WORKTREE" in
                "$HOME/.config/superpowers/worktrees/"*) OWN=1 ;;
                *) OWN=0 ;;
              esac ;;
         esac
         if [ "$OWN" = "1" ]; then
           git worktree remove "$WORKTREE"
           git worktree prune
         else
           # Harness owns this worktree; leave it in place.
           # Record this in finalize.md as Cleanup: preserved (harness-owned).
           true
         fi

      7. Delete the local worktree branch:

         git branch -d "$WORKTREE_BRANCH"

      8. Write finalize.md per templates/finalize.md to
         openspec/changes/<change-name>/finalize.md. Required values
         for the git-side closeout:
         - Outcome: `pr-updated`
         - Branch: <feature-branch>
         - Base branch: <integration branch, typically `main`>
         - Final state: `pr-updated`
         - PR URL: discovered via `gh pr view <feature-branch> --json url --jq .url`
         - Worktree: <path or "removed">
         - Cleanup: `removed` (or `preserved (harness-owned)`)
         - Tests baseline status at finish: `passing`
         - PR comment status: filled in by step 11 below
         - Next step: per templates/finalize.md `pr-updated` bullet
           (archive → push → merge sequence).

      9. Commit the receipt on the feature branch:

         git add openspec/changes/<change-name>/finalize.md
         git commit -m "docs(openspec): finalize receipt for <change-name>"

      10. Push to update the existing PR:

          git push origin "$FEATURE_BRANCH"
          # The PR auto-updates with the merge commits, finalize.md,
          # and the implementation history.

      11. Run the comment-posting subroutine (see "Code-reviewer
          onboarding comment subroutine" below). Update the
          `PR comment status` field in finalize.md with the result
          and amend the receipt commit (or add a follow-up commit
          and push) so finalize.md is accurate. Non-blocking — on
          subroutine failure, record `failed: <reason>` and continue.

      Recommended (non-blocking): before step 8, write a short
      retrospective.md in the change directory. Six suggested
      sections: Wins, Misses, Plan deviations, Skill/workflow
      compliance, Surprises, Promote candidates. Evidence first,
      opinion second. Skippable for trivial single-commit fixes.

      ------------------------------------------------------------
      Code-reviewer onboarding comment subroutine
      ------------------------------------------------------------

      Assumption: the human who pre-reviewed the proposal/specs
      (logic review) may not be the same human who reviews the code.
      This subroutine posts a single PR comment to orient the code
      reviewer. It is invoked from the git-side closeout (step 11)
      AND from the escape hatch (step 3 of the escape-hatch
      instructions below)
      so that any PR present at finalize completion gets a comment.

      Subroutine body:

      a. Detect the PR:
         PR_NUMBER=$(gh pr view "$FEATURE_BRANCH" --json number --jq .number 2>/dev/null)
         If empty: record `PR comment: skipped (no PR)` in
         finalize.md and return.

      b. Build the comment body. The body starts with the literal
         marker `<!-- superspec:finalize-comment -->` on its own
         line, followed by sections per the body template. The
         agent MUST summarize content from proposal.md /
         retrospective.md in its own words (200-400 words target,
         hard ceiling 600 words). Do NOT paste from the source
         artifacts. Capability names are taken verbatim because
         they are identifiers; everything else is paraphrased.

         Body template:

         <!-- superspec:finalize-comment -->
         ## Superspec finalize — code review orientation

         This PR has just been updated with the implementation and
         the full openspec change directory at
         `openspec/changes/<change-name>/`. It is transitioning
         from logic pre-review (which the spec/design reviewer
         already completed) to **code review**.

         ### What this change is

         <2-3 sentences SUMMARIZING proposal.md's Why and What
         Changes sections in the agent's own words. Do NOT paste
         from proposal.md.>

         ### Capabilities affected

         <Bulleted list, one bullet per capability. Capability
         NAMES verbatim from proposal.md; per-bullet summary in
         the agent's own words.>

         ### Suggested code-reviewer reading order

         1. `openspec/changes/<change-name>/proposal.md` — motivation
         2. `openspec/changes/<change-name>/specs/<capability>/spec.md` — behavioral requirements (the code must match these scenarios)
         3. `openspec/changes/<change-name>/design.md` *(if present)* — technical approach
         4. PR diff — the actual code
         5. `openspec/changes/<change-name>/verify.md` — validation results (look for warnings)

         ### Implementation summary

         - **Tasks**: <X> of <Y> complete (see `tasks.md`).
         - **Apply iterations**: <N> (see `apply.md`).
         - **Verify outcome**: <PASS / PASS_WITH_WARNINGS>.
         - **Test baseline at finish**: passing.

         ### Notable from the implementer

         <2-4 bullets summarizing retrospective.md's Plan deviations
         + Surprises sections in the agent's own words. If
         retrospective.md is missing: "No retrospective notes
         provided.">

         ---
         *Auto-generated by Superspec finalize. Full receipt at
         `openspec/changes/<change-name>/finalize.md`. Re-running
         finalize will edit this comment in place, not duplicate
         it.*

      c. Idempotency check: list existing PR comments and look for
         one whose body starts with the marker:

         REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
         EXISTING=$(gh api "repos/$REPO/issues/$PR_NUMBER/comments" \
           --jq '.[] | select(.body | startswith("<!-- superspec:finalize-comment -->")) | .id' | head -1)

      d. If EXISTING is non-empty, edit in place:

         gh api -X PATCH "repos/$REPO/issues/comments/$EXISTING" \
           -f body=@/tmp/superspec-finalize-comment.md
         Record `PR comment: edited-existing` in finalize.md.

         Otherwise, post a new comment:

         gh pr comment "$PR_NUMBER" --body-file /tmp/superspec-finalize-comment.md
         Record `PR comment: posted` in finalize.md.

      e. On any failure (gh missing, draft PR with comments
         disabled, network/auth/rate-limit error), record
         `PR comment: failed — <reason>` in finalize.md. Do NOT
         roll back the merge/push. The change is git-clean; the
         comment is a nice-to-have, not a correctness gate.

      ------------------------------------------------------------
      Borrowed logic and recreation method
      ------------------------------------------------------------

      The worktree-cleanup provenance guard (step 6) and the
      structural pattern of test-verify → merge → test-verify →
      cleanup → delete-branch are adapted from
      superpowers:finishing-a-development-branch Step 5 (Option 1)
      and Step 6 (Cleanup Workspace).

      Upstream URL:
      https://github.com/obra/superpowers/blob/main/skills/finishing-a-development-branch/SKILL.md
      Commit at time of port: <SHA — resolved during Task 2
      implementation; use `gh api repos/obra/superpowers/commits/main --jq .sha`>

      To re-port if the upstream skill changes meaningfully: diff
      the steps above against the upstream skill's current Step 5
      (Option 1) and Step 6, port any meaningful behavioral
      changes back into this instruction, then update the commit
      hash above. A short subsection in docs/workflow-details.md
      ("Borrowed logic and recreation method") restates this
      discipline.

      ------------------------------------------------------------
      Escape hatch: manual skill invocation
      ------------------------------------------------------------

      If your workflow does not match the git-side closeout — solo /
      local-only (skill Option 1 merge-locally to main); brand-new PR
      via the skill (Option 2); keep the worktree alive for iteration
      (Option 3); or discard the work (Option 4) — invoke
      `superpowers:finishing-a-development-branch` directly via
      the Skill tool and pick the matching option.

      After the skill returns:
      1. Hand-write finalize.md from
         openspec/schemas/superspec/templates/finalize.md, picking
         the matching Outcome value (`merge-locally`, `pr-created`,
         `kept-as-is`, or `discarded`).
      2. Commit finalize.md to whichever branch is appropriate for
         the outcome.
      3. Run the comment-posting subroutine above regardless of
         which option ran. It self-skips when no PR exists
         (Options 1, 3, 4) and posts/edits when a PR exists
         (Option 2 or an earlier git-side closeout run left one).

      This step 3 is the explicit guarantee that the code-reviewer
      comment exists on any PR that exists at finalize completion,
      even outside the canonical automation.

      Once finalize.md exists, the change is git-clean and ready
      for /opsx:archive. See docs/workflow-details.md Phase 6
      (Archival) for the golden path.
```

- [ ] **Step 5: Resolve the borrowed-logic commit SHA.**

Inside the instruction body you just wrote, the `<SHA — resolved during Task 2 implementation>` placeholder needs to become an actual upstream commit hash. Run:

```bash
gh api repos/obra/superpowers/commits/main --jq .sha
```

Take the output (40-char SHA), and replace `<SHA — resolved during Task 2 implementation; use ...>` in the instruction body with the SHA. Keep the surrounding sentence wording. Example end state:

```
Commit at time of port: a1b2c3d4e5f6...
```

- [ ] **Step 6: Validate the schema parses.**

```bash
openspec validate --all --json
```

Expected: all PASS. If YAML indentation broke, fix it (the `instruction: |` block content must be uniformly indented at six spaces relative to the `- id: finalize` line).

- [ ] **Step 7: Commit.**

```bash
git add openspec/schemas/superspec/schema.yaml
git commit -m "feat(schema): rewrite finalize to execute the git-side closeout; bump v3→v4"
```

---

## Task 3: Update templates/finalize.md

**Files:**
- Modify: `openspec/schemas/superspec/templates/finalize.md`

**Spec reference:** "Template changes > `templates/finalize.md`" section of the design doc.

- [ ] **Step 1: Read the existing template** to confirm structure.

`openspec/schemas/superspec/templates/finalize.md` currently lists Outcome values `merge-locally | pr-created | kept-as-is | discarded` and Final state values `merged | pr-open | kept-open | deleted`, and has a Next step section with one bullet per Outcome.

- [ ] **Step 2: Add `pr-updated` to the Outcome enum.**

Find the line:

```markdown
**Outcome**: `merge-locally` | `pr-created` | `kept-as-is` | `discarded`
```

Replace with:

```markdown
**Outcome**: `merge-locally` | `pr-created` | `pr-updated` | `kept-as-is` | `discarded`
```

- [ ] **Step 3: Add `pr-updated` to the Final state enum (kept distinct from `pr-open`).**

Find the line:

```markdown
- **Final state**: `merged` | `pr-open` | `kept-open` | `deleted`
```

Replace with:

```markdown
- **Final state**: `merged` | `pr-open` | `pr-updated` | `kept-open` | `deleted`
```

- [ ] **Step 4: Add the `PR comment status` field under the Workspace section.**

After the existing Workspace block (which ends with `**Cleanup**: ...`), insert a new section before the `## Tests` section:

```markdown
---

## PR comment

- **Comment status**: `posted` | `edited-existing` | `skipped (no PR)` | `failed: <reason>`
```

The intent: this records the outcome of the code-reviewer onboarding comment subroutine. If finalize was run via the escape hatch and no PR exists, this will be `skipped (no PR)`.

- [ ] **Step 5: Add the `pr-updated` Next-step bullet.**

Find the existing Next step block. Insert a new bullet immediately after the `pr-created` bullet:

```markdown
- `pr-updated`: "Wait for PR code-review (the logic pre-review has already happened). After approval, run `/opsx:archive` on this feature branch (commits land here), push the archive commits to update the PR, then merge the PR (`gh pr merge --squash --delete-branch` or GitHub UI) — that single merge lands implementation + archive into main."
```

- [ ] **Step 6: Confirm the template still validates.**

The template is not parsed by `openspec validate` directly (it's a stub copied into change directories), so there's no machine check here. Manually re-read the template top-to-bottom for markdown well-formedness.

- [ ] **Step 7: Commit.**

```bash
git add openspec/schemas/superspec/templates/finalize.md
git commit -m "feat(schema): templates/finalize.md adds pr-updated and PR comment status"
```

---

## Task 4: Update INTEGRATION.md

**Files:**
- Modify: `openspec/schemas/superspec/INTEGRATION.md`

**Spec reference:** "Doc updates" table row for INTEGRATION.md in the design doc.

- [ ] **Step 1: Update the schema version reference.**

Find the line at the top of INTEGRATION.md:

```markdown
> Corresponding schema version: `sdd-plus-superpowers` v3
```

Replace with:

```markdown
> Corresponding schema version: `sdd-plus-superpowers` v4
```

- [ ] **Step 2: Update touch-point table row 7 (`finishing-a-development-branch`).**

Find the row:

```markdown
| 7 | `superpowers:finishing-a-development-branch` | `finalize` artifact instruction | Direct |
```

Replace with:

```markdown
| 7 | `superpowers:finishing-a-development-branch` | Manual escape hatch only — the git-side closeout is executed by the schema directly (v4) | **Fallback** |
```

- [ ] **Step 3: Rewrite walkthrough Step 4 (Finalization).**

Find the section `### Step 4: Finalization` and replace its entire body (from the section header through to but not including the next section header `### Step 5: Archive`) with:

```markdown
### Step 4: Finalization

`/opsx:continue` after verify completes surfaces the `finalize` artifact's instruction. As of schema v4, the instruction executes **the git-side closeout** directly — it does NOT invoke `superpowers:finishing-a-development-branch` in the canonical flow.

#### 4-1. Canonical git-side closeout sequence (executed by the schema)

1. Detect worktree path and worktree branch name; detect the feature branch.
2. Verify tests pass in the worktree.
3. Switch to the feature branch in the main checkout, pull.
4. `git merge --ff-only <worktree-branch>` into the feature branch.
5. Re-verify tests on the merged result.
6. Worktree cleanup with provenance guard (only for paths under `.worktrees/`, `worktrees/`, or `~/.config/superpowers/worktrees/`).
7. Delete the local worktree branch.
8. Write `finalize.md` on the feature branch with Outcome: `pr-updated`.
9. Commit the receipt on the feature branch.
10. `git push origin <feature-branch>` — the existing PR (opened manually between plan and apply for spec pre-review) auto-updates.
11. Post (or edit in place) a single code-reviewer onboarding comment on the PR, summarizing the change for a reviewer who did not see the spec pre-review.

The comment uses a marker (`<!-- superspec:finalize-comment -->`) for idempotent upsert; re-running finalize edits the existing comment rather than duplicating it. The body is **summarized in the agent's own words** from the change artifacts; verbatim paste is forbidden.

#### 4-2. Escape hatch (manual skill invocation)

If your workflow doesn't match the git-side closeout — solo / no-PR, brand-new PR from the skill, keep-as-is, or discard — invoke `superpowers:finishing-a-development-branch` directly via the Skill tool, pick the matching option, hand-write `finalize.md` from `templates/finalize.md`, and then run the comment-posting subroutine (defined in the finalize instruction). The subroutine self-skips when there's no PR and posts/edits the orientation comment when one exists.

#### 4-3. Retrospective (recommended, non-blocking)

Same as v3 — write a short `retrospective.md` in the change directory before `finalize.md` if the change is non-trivial. Six suggested sections: Wins, Misses, Plan deviations, Skill/workflow compliance, Surprises, Promote candidates.
```

- [ ] **Step 4: Update Section 5 (Archive) to point at the new canonical golden path.**

Find the subsection `#### Canonical PR-review golden path` and replace its body (the entire code block plus the explanatory paragraph immediately following) with:

```markdown
#### Canonical PR-review golden path (v4)

```text
1. verify completes (verify.md committed on feature branch in the worktree)
2. finalize (the git-side closeout — schema merges worktree → feature
   branch, pushes to update the existing PR, posts code-reviewer
   onboarding comment; finalize.md records Outcome: pr-updated, Final
   state: pr-updated; worktree is removed during finalize)
3. [PAUSE: human code review on the PR; reviewer approves]
4. /opsx:archive on the feature branch (syncs delta specs, moves change
   dir; new commits land on the feature branch)
5. Push the archive commits to update the PR
6. PR merge (gh pr merge --squash --delete-branch or GitHub UI)
```

The archive-before-merge ordering keeps the PR's diff complete: every commit that went into the change (implementation, finalize.md, archive sync) is in the PR. If the PR is merged before archive runs, the archive commits would have to be authored on main after the fact — recoverable but loses the unified audit trail. Note that step 7 from v3 ("local worktree cleanup if still present") is no longer needed in the git-side closeout because the worktree is removed during finalize itself.
```

- [ ] **Step 5: Update the local-merge variant note.**

Find the subsection `#### Local-merge variant (acceptable for solo / local-only changes)` and update its first paragraph to reflect that this is now reached via the escape hatch:

Replace:

```markdown
If finalize chose Option 1 (Merge locally), the skill performs the merge inline and removes the worktree. `/opsx:archive` then runs on main directly. This inverts the archive/merge order vs. the canonical path. Acceptable for solo or local-only changes where the PR audit trail isn't relevant.
```

With:

```markdown
If the user falls back to the escape hatch and picks the skill's Option 1 (Merge locally), the skill performs the merge into the integration branch inline and removes the worktree. `/opsx:archive` then runs on the integration branch directly. This inverts the archive/merge order vs. the canonical git-side closeout path. Acceptable for solo or local-only changes where the PR audit trail isn't relevant.
```

- [ ] **Step 6: Update Section 6 Decision Choice #6 ("Finalize is a real artifact, not a hidden phase (v3)") with a v4 addendum.**

After the existing v3 paragraphs in that subsection, append:

```markdown
**v4 addendum — schema owns the git-side closeout's logic.**

Promoting finalize to an artifact (v3) made the call site discoverable but kept the executor delegated to `superpowers:finishing-a-development-branch`. That skill's 4-option menu doesn't fit Superspec's PR-pre-review workflow: its "Option 2: push and create PR" creates a *new* PR from the worktree branch, leaving the user's pre-existing feature branch (with the artifacts and the open pre-review PR) orphaned, and its Option 1 ("Merge locally") merges into the integration branch instead of the feature branch. In v4, the finalize instruction executes the git-side closeout directly — merge worktree → feature branch, push to update the existing PR, post a code-reviewer comment — and demotes the skill to a manual escape hatch for non-canonical flows (solo/no-PR, brand-new PR via the skill's Option 2, keep-as-is, discard). The schema borrows two narrow pieces from the skill (worktree-provenance guard, test-verify → merge structural pattern) with explicit attribution and a documented recreation method; everything else lives in the schema.
```

- [ ] **Step 7: Add the v3 → v4 migration subsection.**

After the existing `### Migration from schema v2` subsection, append a new subsection:

```markdown
### Migration from schema v3

In-flight v3 changes that already have `finalize.md` are unaffected — the file exists and `/opsx:continue` advances past finalize. Re-running finalize on those changes is optional.

For v3 changes mid-flight with no `finalize.md`:

1. `/opsx:continue` under v4 will surface the new git-side closeout instruction. If your workflow matches the git-side closeout (feature branch + pre-review PR opened manually), the schema executes the git-side closeout automatically — no manual finalize.md authoring needed.
2. If your workflow doesn't match (no PR yet, or you started on the integration branch), use the escape hatch documented in the finalize instruction.

If you previously ran the v3 finalize and ended up with the two-branch schism (an orphan branch on remote and a PR from a different branch), the recommended cleanup is:
- Decide which branch is the real PR. Usually that's the worktree-named branch.
- Delete the orphan branch on the remote: `git push origin --delete <orphan>`.
- Re-run finalize under v4 to ensure the receipt and comment are in place. (Or hand-write finalize.md and run only the comment subroutine.)

This is a one-time migration cost per in-flight v3 change with a schism; archived changes are unaffected.
```

- [ ] **Step 8: Commit.**

```bash
git add openspec/schemas/superspec/INTEGRATION.md
git commit -m "docs(integration): document v4 git-side closeout finalize and v3→v4 migration"
```

---

## Task 5: Update schema README.md

**Files:**
- Modify: `openspec/schemas/superspec/README.md`

**Spec reference:** "Doc updates" table row for schema README in the design doc.

- [ ] **Step 1: Update the differences table.**

Find the `Differences from spec-driven:` table and update the finalize row(s) to reflect v4 semantics. Replace the line:

```markdown
| Endpoint | tasks (coarse-grained) | **finalize** (git-side closeout receipt; archive follows as a CLI step) |
```

with:

```markdown
| Endpoint | tasks (coarse-grained) | **finalize** (the git-side closeout: merge worktree → feature branch + push to update PR + code-reviewer onboarding comment; archive follows as a CLI step) |
```

Also update the table header to say `sdd-plus-superpowers (v4)` instead of `(v3)`.

- [ ] **Step 2: Update the Integrated Superpowers Skills table.**

Find the row for `superpowers:finishing-a-development-branch` and update it:

```markdown
| finalize artifact | `superpowers:finishing-a-development-branch` | **Manual escape hatch only (v4)** — the git-side closeout is executed by the schema directly |
```

- [ ] **Step 3: Add a new Decision Log entry: "Why we own the git-side closeout's logic (v4)".**

After the existing entry `### Why finalize Is a DAG Artifact (v3)`, insert:

```markdown
### Why We Own the Git-Side Closeout's Logic Instead of Calling the Skill (v4)

The v3 finalize artifact invoked `superpowers:finishing-a-development-branch` and let its 4-option menu drive the closeout. In practice this produced two failure modes for any team using the canonical Superspec PR-pre-review workflow:

1. **finalize.md ended up off the PR branch.** The skill ran Option 2 (push + create PR) before finalize.md was written; the agent then wrote finalize.md from whatever CWD it landed in (typically the main checkout, on the user's feature branch). The PR — created from the worktree branch — did not contain finalize.md.
2. **Two related branches ended up on remote.** The user's feature branch (with artifacts and pre-review PR) sat orphaned while the skill opened a new PR from the worktree branch.

The skill's "base branch" is `main`; its "feature branch" is the worktree branch. Neither aligns with Superspec's "merge worktree into the user's feature branch, then push to update the existing PR" intent. Overriding the skill's interpretation from the schema instruction was attempted and judged too brittle.

v4's resolution: the schema executes the git-side closeout directly (merge worktree → feature branch → push → code-reviewer comment). Two narrow pieces are borrowed from the skill with explicit attribution and a documented recreation method — the worktree-cleanup provenance guard and the test-verify → merge → test-verify → cleanup structural pattern. The skill remains a first-class manual escape hatch for users whose workflow doesn't match the git-side closeout (solo / no-PR, brand-new PR, keep-as-is, discard).
```

- [ ] **Step 4: Update the Fallback Strategy section to mention finalize.**

Find the section `### Fallback Strategy` and update its bullet list. Replace:

```markdown
- brainstorm → Manually write brainstorm.md
- plan → Manually write plan.md
- apply → Standard task-by-task manual implementation
```

with:

```markdown
- brainstorm → Manually write brainstorm.md
- plan → Manually write plan.md
- apply → Standard task-by-task manual implementation
- finalize → Run the git operations manually (merge / push / open PR / comment) and author finalize.md directly from templates/finalize.md
```

- [ ] **Step 5: Commit.**

```bash
git add openspec/schemas/superspec/README.md
git commit -m "docs(schema): README documents v4 git-side closeout decision and finalize fallback"
```

---

## Task 6: Update docs/workflow.md

**Files:**
- Modify: `docs/workflow.md`

**Spec reference:** "Doc updates" table row for workflow.md in the design doc.

- [ ] **Step 1: Replace the Phase 5 summary subsection.**

Find the subsection `### 5. Finalization` and replace its body (everything between that heading and the next `### 6. Archival` heading) with:

```markdown
### 5. Finalization

The `finalize` artifact is reached via `/opsx:continue` after verify reports PASS. As of schema v4, its instruction executes **the git-side closeout** directly — merging the implementation worktree branch back into the user's feature branch, pushing the feature branch to update the PR that was opened manually for spec pre-review, writing `finalize.md`, and posting a single code-reviewer onboarding comment on the PR. `superpowers:finishing-a-development-branch` is retained only as a manual escape hatch for workflows that don't match the git-side closeout (solo / no-PR, brand-new PR, keep-as-is, discard). The recommended retrospective lives here as well, before archive.

Primary outputs: `finalize.md` (the closeout receipt) + an updated PR with a code-reviewer onboarding comment; optional `retrospective.md`.
```

- [ ] **Step 2: Verify the At-a-Glance table still reads accurately for v4.**

Re-read the at-a-glance table at the top of `workflow.md`. The row for Phase 5 says `finalize` and brief `Close out the git side cleanly before archive.` — that wording is still accurate for v4. No change needed. Confirm only.

- [ ] **Step 3: Commit.**

```bash
git add docs/workflow.md
git commit -m "docs(workflow): Phase 5 summary reflects v4 git-side closeout finalize"
```

---

## Task 7: Update docs/workflow-details.md (largest doc change)

**Files:**
- Modify: `docs/workflow-details.md`

**Spec reference:** "Doc updates" table row for workflow-details.md in the design doc — full Phase 5 rewrite, golden-path update, borrowed-logic subsection.

- [ ] **Step 1: Rewrite Phase 5 (Finalization) section in full.**

Find the section `## Phase 5: Finalization` and replace its entire body (from that header through to but not including the next `## Phase 6: Archival` header) with:

```markdown
## Phase 5: Finalization

The Finalization phase performs the git-side closeout for the change — merging the implementation worktree branch back into the user's feature branch, pushing the feature branch to update the existing PR, writing the finalize receipt, and posting a single code-reviewer onboarding comment on the PR. Schema v4 introduced **the git-side closeout** as the canonical finalize flow, executed directly by the schema instruction.

It contains a single step.

### Step 9. Finalize — `finalize` (the git-side closeout)

> Closes out the development branch in git terms; writes the finalize.md receipt; updates the existing PR; posts a code-reviewer onboarding comment.

**Brief why:** Restore the documented golden path — a single PR on the user's feature branch that carries logic pre-review, implementation, finalize, and archive commits in one reviewable diff before merge.

**Why it's required.** Before v4, the post-verify closeout invoked `superpowers:finishing-a-development-branch` and let its 4-option menu drive things. In practice this produced two failure modes (finalize.md off the PR branch; two related branches on remote — the user's feature branch with the pre-review PR sat orphaned while the skill opened a new PR from the worktree branch). v4 fixes this by having the schema execute the git-side closeout directly so the canonical flow is deterministic and matches the documented golden path.

**What the step does.** `/opsx:continue` advances to the finalize artifact, whose v4 instruction executes the git-side closeout sequence:

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

**Prerequisites for the git-side closeout.** The schema instruction checks all of these and skips the git-side closeout (directing the user to the escape hatch) if any is unmet:

- Currently on a feature branch in the main checkout (not the integration branch, not detached HEAD).
- A PR for the feature branch exists on the remote (`gh pr view <feature-branch>` returns a number).
- A worktree at the expected path exists for the change.

**Source phase used.** Schema-owned. Two narrow pieces are borrowed from `superpowers:finishing-a-development-branch` (Step 5 Option 1 merge structure + Step 6 worktree-cleanup provenance guard) with attribution and a recreation method — see the dedicated subsection below in the Superpowers skill index.

**Step not used / replaced and why.** v3 invoked `superpowers:finishing-a-development-branch` directly and used its 4-option menu. That menu doesn't fit Superspec's PR-pre-review workflow: its Option 2 creates a new PR from the worktree branch (leaving the user's feature branch orphaned), and its Option 1 merges into the integration branch (not the feature branch). v4 demotes the skill to a manual escape hatch for non-canonical flows.

#### Escape hatch (manual skill invocation)

If your workflow doesn't match the git-side closeout, invoke `superpowers:finishing-a-development-branch` directly via the Skill tool and pick the option that matches your situation:

- **Option 1 (Merge locally)** — solo / local-only; merges into the integration branch and removes the worktree.
- **Option 2 (Push and create PR)** — brand-new PR via the skill (rare in the canonical Superspec workflow; only useful if you skipped the manual pre-review PR open between plan and apply).
- **Option 3 (Keep as-is)** — keep the worktree alive for iteration on PR feedback.
- **Option 4 (Discard)** — force-delete the work with the skill's typed-confirmation gate.

After the skill returns, hand-write `finalize.md` from `templates/finalize.md` picking the matching Outcome (`merge-locally`, `pr-created`, `kept-as-is`, `discarded`), commit it on the appropriate branch, and **always run the comment-posting subroutine** (defined in the finalize instruction). The subroutine self-skips when no PR exists (Options 1, 3, 4) and posts/edits the orientation comment when a PR exists (Option 2 or a previously opened PR). This step is the explicit guarantee that the code-reviewer comment exists on any PR present at finalize completion, even outside the canonical automation.

#### Recommended (non-blocking)

Before writing `finalize.md`, write a short `retrospective.md` in the change directory. Six suggested sections: Wins, Misses, Plan deviations, Skill/workflow compliance, Surprises, Promote candidates. Evidence first, opinion second. Skippable for trivial single-commit fixes. The retrospective's Plan deviations and Surprises sections feed the "Notable from the implementer" section of the PR onboarding comment.
```

- [ ] **Step 2: Rewrite the Phase 6 canonical PR-review golden path.**

Find the subsection `#### Canonical PR-review golden path` inside Phase 6 and replace its body (the code block plus the explanatory paragraph) with:

```markdown
#### Canonical PR-review golden path (v4)

```text
1. verify completes (verify.md committed on feature branch in the worktree)
2. finalize (the git-side closeout — schema merges worktree → feature
   branch, pushes to update existing PR, posts code-reviewer onboarding
   comment; finalize.md records Outcome: pr-updated, Final state:
   pr-updated; worktree is removed during finalize)
3. [PAUSE: human code review on the PR; reviewer approves]
4. /opsx:archive on the feature branch (syncs delta specs, moves change
   dir; new commits land on the feature branch)
5. Push the archive commits to update the PR (git push)
6. PR merge (gh pr merge --squash --delete-branch or GitHub UI)
```

The archive-before-merge ordering keeps the PR's diff complete: every commit that went into the change (implementation, finalize.md, archive sync) is in the PR. If the PR is merged before archive runs, the archive commits would have to be authored on the integration branch after the fact — recoverable but loses the unified audit trail.

Note: v3's step 7 ("Local worktree cleanup if still present") is no longer needed in the git-side closeout because the worktree is removed during finalize itself. Users falling back to the escape hatch with Option 3 (keep-as-is) or Option 2 (skill-created PR) may still need to clean up manually; see the local-merge variant below.
```

- [ ] **Step 3: Update the local-merge variant subsection inside Phase 6.**

Find `#### Local-merge variant (solo / local-only changes)` inside Phase 6 and rewrite to reflect that this is now an escape-hatch path:

```markdown
#### Local-merge variant (escape hatch, acceptable for solo / local-only changes)

If the user falls back to the escape hatch and picks the skill's Option 1 (Merge locally), the skill performs the merge into the integration branch inline and removes the worktree. `/opsx:archive` then runs on the integration branch directly. This inverts the archive/merge order vs. the canonical git-side closeout path. Acceptable for solo or local-only changes where the PR audit trail isn't relevant.
```

- [ ] **Step 4: Update the Superpowers skill index touch-point table (row 7).**

Find the table in the "Superpowers skill index & fallbacks" section and update row 7:

```markdown
| 7 | `superpowers:finishing-a-development-branch` | Phase 5 / Step 9 — **Manual escape hatch only (v4)** | **Fallback** |
```

- [ ] **Step 5: Update the Manual fallbacks table (Step 9 row).**

Find the second table titled `Manual fallbacks` and replace the Step 9 row:

```markdown
| 9 — `finalize` | the git-side closeout (schema-executed; the schema instruction is the executor) | Manual fallback only if the schema instruction itself is unavailable (extremely rare) — invoke `superpowers:finishing-a-development-branch` directly, then hand-write `finalize.md`, then run the comment-posting subroutine. |
```

- [ ] **Step 6: Add a new subsection "Borrowed logic and recreation method" inside the Superpowers skill index.**

After the Manual fallbacks table, add a new subsection:

```markdown
### Borrowed logic and recreation method

Schema v4 owns the git-side closeout's execution but borrows two narrow pieces of logic from `superpowers:finishing-a-development-branch`:

1. **Worktree-cleanup provenance guard** — only remove a worktree if its path is under `.worktrees/`, `worktrees/`, or `~/.config/superpowers/worktrees/`. Otherwise the harness owns the workspace and we leave it in place.
2. **Structural pattern** — test-verify in worktree → merge → test-verify on merged result → cleanup → delete branch. Taken from the skill's Step 5 Option 1.

Each borrow is annotated inline in the finalize artifact instruction with the upstream URL (`https://github.com/obra/superpowers/blob/main/skills/finishing-a-development-branch/SKILL.md`) and the commit SHA at the time of the port.

**Recreation method.** If the upstream skill evolves and we need to re-port: diff the relevant steps against the upstream skill's current Step 5 Option 1 and Step 6, port any meaningful behavioral changes back into the finalize instruction, then update the inline SHA. Recommended cadence: re-check on every upstream Superpowers minor version bump. No automation — discipline by convention.
```

- [ ] **Step 7: Commit.**

```bash
git add docs/workflow-details.md
git commit -m "docs(workflow-details): rewrite Phase 5 for v4 git-side closeout; add borrowed-logic subsection"
```

---

## Task 8: Update docs/workflow-mermaid.md

**Files:**
- Modify: `docs/workflow-mermaid.md`

**Spec reference:** "Doc updates" table row for workflow-mermaid.md.

- [ ] **Step 1: Update the Phase 5 mermaid subgraph.**

Find the block:

```
    %% ---------- Phase 5 ----------
    subgraph P5[" ⚡ &nbsp;Phase 5 · Finalization &nbsp;<code>/opsx:continue</code> → <code>finalize</code> "]
        direction TB
        P5a["⚡ <b>finishing-a-development-branch</b><br/>Merge · PR · worktree teardown"]
        P5b[/"📄 finalize.md"/]
        P5a --> P5b
    end
    class P5 sp
```

Replace it with:

```
    %% ---------- Phase 5 ----------
    subgraph P5[" ⚡ &nbsp;Phase 5 · Finalization &nbsp;<code>/opsx:continue</code> → <code>finalize</code> "]
        direction TB
        P5a["⚡ <b>Git-side closeout (schema-executed, v4)</b><br/>Merge worktree → feature branch · push to update PR<br/>· post code-reviewer onboarding comment"]
        P5b[/"📄 finalize.md"/]
        P5c["⚡ <i>finishing-a-development-branch</i><br/>Manual escape hatch only"]
        P5a --> P5b
        P5a -.fallback.-> P5c
    end
    class P5 sp
```

- [ ] **Step 2: Update the Phase summary table row for Phase 5.**

Find the row:

```markdown
| 5 | Finalization         | ⚡      | `/opsx:continue` → `finalize` · `superpowers:finishing-a-development-branch`                                                         | `finalize.md` (git closeout receipt) · optional `retrospective.md` |
```

Replace with:

```markdown
| 5 | Finalization         | ⚡      | `/opsx:continue` → `finalize` (schema-executed git-side closeout, v4) · escape hatch: `superpowers:finishing-a-development-branch`            | `finalize.md` + PR onboarding comment · optional `retrospective.md` |
```

- [ ] **Step 3: Commit.**

```bash
git add docs/workflow-mermaid.md
git commit -m "docs(workflow-mermaid): Phase 5 reflects v4 git-side closeout with escape-hatch fallback"
```

---

## Task 9: Sanity-check docs/project-layout.md

**Files:**
- Modify (if needed): `docs/project-layout.md`

**Spec reference:** "Doc updates" table row notes "No structural change; verify wording for accuracy."

- [ ] **Step 1: Read project-layout.md and check the finalize.md mention.**

Read `docs/project-layout.md` end-to-end. The file currently lists `finalize.md` in the per-change-directory description at line 33-34 and the templates tree (line 22). No claim about *how* finalize works is made in this file.

- [ ] **Step 2: If no v3/v4 finalize claims are present, no change is required.**

If the file passes the check unchanged, no commit for this task. Note "no change required" and proceed to Task 10.

If you find an outdated claim (none expected, but check the "Purpose" column of the table for templates/finalize.md), fix it minimally to remove version-specific wording.

- [ ] **Step 3: If you modified the file, commit; otherwise skip.**

```bash
# Only if changes were made:
git add docs/project-layout.md
git commit -m "docs(project-layout): minor wording alignment with v4"
```

---

## Task 10: Update root README.md

**Files:**
- Modify: `README.md`

**Spec reference:** "Doc updates" table row for root README in the design doc.

- [ ] **Step 1: Bump the schema-version tagline.**

Find the line near the top:

```markdown
  MIT licensed · Schema version 3 · Requires OpenSpec + Superpowers
```

Replace with:

```markdown
  MIT licensed · Schema version 4 · Requires OpenSpec + Superpowers
```

- [ ] **Step 2: Update the Quick Start `/opsx:continue → finalize` line(s).**

Find both occurrences (one in the step-by-step flow, one in the quick flow) of:

```
/opsx:continue         # → finalize (invokes superpowers:finishing-a-development-branch, writes finalize.md; v3)
```

Replace both with:

```
/opsx:continue         # → finalize (the git-side closeout: merges worktree → feature branch, updates PR, writes finalize.md, posts code-reviewer comment; v4)
```

- [ ] **Step 3: Update the Phase 5 line in the "Six phases" concept list.**

Find the line:

```markdown
5. **Finalization** — close out the git side (create PR / merge / clean up the worktree) and record the outcome in `finalize.md`.
```

Replace with:

```markdown
5. **Finalization** — the git-side closeout (schema-executed): merge the worktree branch back into your feature branch, push to update the PR opened earlier for spec pre-review, record the outcome in `finalize.md`, and post a code-reviewer onboarding comment on the PR.
```

- [ ] **Step 4: Commit.**

```bash
git add README.md
git commit -m "docs(readme): bump tagline to v4 and update Quick Start finalize description"
```

---

## Task 11: Regenerate the SVG flowchart

**Files:**
- Modify: `docs/assets/superspec-phases-flowchart.svg`

**Spec reference:** "Doc updates" table row for the SVG.

**Approach:** The most recent SVG regen happened in commit `8dce140`. Check that commit's diff or message for how the SVG was produced. If a script or tooling is documented in the repo, use it. Otherwise, render the updated mermaid in `docs/workflow-mermaid.md` to SVG via the mermaid CLI (`mmdc`) or via the Mermaid Live Editor and replace the file.

- [ ] **Step 1: Inspect the prior regen.**

```bash
git show 8dce140 --stat
git log --all --source --grep="SVG" --oneline | head -20
```

If a script (`scripts/regen-svg.sh`, `Makefile` target, or similar) exists, use it. If the prior regen was a manual export, replicate that process.

- [ ] **Step 2: Re-render the SVG from the v4 mermaid.**

Two viable paths:

A) **mermaid CLI**:

```bash
# Install if not present:
npm install -g @mermaid-js/mermaid-cli
# Extract the mermaid block from workflow-mermaid.md into a temp file:
awk '/^```mermaid$/,/^```$/' docs/workflow-mermaid.md | sed '1d;$d' > /tmp/flow.mmd
mmdc -i /tmp/flow.mmd -o docs/assets/superspec-phases-flowchart.svg -b transparent
```

B) **Mermaid Live Editor** (https://mermaid.live):

- Paste the mermaid block from `docs/workflow-mermaid.md` into the editor.
- Export → SVG.
- Save the file as `docs/assets/superspec-phases-flowchart.svg`, overwriting the existing one.

- [ ] **Step 3: Sanity-check the rendered SVG.**

Open the SVG in a browser. Confirm:

- Phase 5 now shows the git-side closeout node (`Merge worktree → feature branch · push to update PR · post code-reviewer onboarding comment`) and the escape-hatch sub-node.
- All other phases (1–4, 6) are visually identical to the previous v3 render.
- The legend, colors, and overall layout are intact.

- [ ] **Step 4: Commit.**

```bash
git add docs/assets/superspec-phases-flowchart.svg
git commit -m "feat(docs): regenerate SVG flowchart for v4 (git-side closeout finalize)"
```

---

## Task 12: Run `openspec validate` end-to-end

**Files:** None modified; this is a verification step.

- [ ] **Step 1: Run the validator.**

From the repo root:

```bash
openspec validate --all --json
```

Expected: every item returns `"valid": true`. If any schema item fails, return to Task 1 or Task 2 and fix the YAML.

- [ ] **Step 2: Hand-walk the schema fields manually.**

Confirm by reading `openspec/schemas/superspec/schema.yaml`:

- `version: 4`
- artifact ids in order: `brainstorm, proposal, design, specs, tasks, plan, apply, verify, finalize`
- `finalize.requires: [verify]`
- `verify.requires: [apply]`
- `apply (artifact).requires: [plan]`
- `apply (top-level block).requires: [plan]`
- description block has both v3 and v4 paragraphs.

No new commit for this task — it's a verification gate before Task 13.

---

## Task 13: Doc-DAG consistency grep

**Files:** None modified; this is a verification step.

- [ ] **Step 1: Grep for stale v3 schema references.**

```bash
grep -rn "schema version 3\|Schema version 3\|sdd-plus-superpowers v3\|Schema v3" \
  README.md openspec/ docs/ 2>/dev/null | grep -v -E "(v3|version 3) (paragraph|addendum|introduced|introduces|→ v4|to v4|migration)"
```

Every survivor must either be (a) a historical reference (e.g., a migration paragraph) or (b) something you forgot to update — fix the latter.

- [ ] **Step 2: Grep for stale claims that the schema invokes `finishing-a-development-branch`.**

```bash
grep -rn "invokes superpowers:finishing-a-development-branch\|invoke superpowers:finishing-a-development-branch" \
  README.md openspec/ docs/ 2>/dev/null
```

Each survivor must read clearly as either "escape hatch" or "v3 historical context." If any reads as "the schema does this in v4," fix it.

- [ ] **Step 3: Grep for the marker string to confirm only the finalize instruction defines it.**

```bash
grep -rn "superspec:finalize-comment" README.md openspec/ docs/ 2>/dev/null
```

Should appear in the finalize artifact instruction (schema.yaml), the design doc, the plan doc, and the new workflow-details Phase 5 prose. Should NOT appear anywhere else.

- [ ] **Step 4: Confirm `pr-updated` is referenced in templates/finalize.md and only there + design + plan + relevant docs.**

```bash
grep -rn "pr-updated" README.md openspec/ docs/ 2>/dev/null
```

Should appear at minimum in `templates/finalize.md`, `schema.yaml` (finalize instruction), `INTEGRATION.md`, `README.md` (root, if you mention it there), `workflow-details.md`, `workflow.md` (optional), the design doc, and this plan doc.

No commit for this task — it's a verification gate before manual testing.

---

## Task 14: Manual integration tests

**Files:** None modified inside this repo. These tests are run **in a separate test project** that has Superspec installed.

**Spec reference:** Testing section of the design doc.

- [ ] **Step 1: Set up a test project.**

Either reuse an existing test project that has Superspec installed and is on schema v4 (after pulling this branch), or create a fresh one per the install instructions in `README.md`. The test project needs `gh` configured and authenticated to a GitHub remote you control (a sandbox repo).

- [ ] **Step 2: Git-side closeout end-to-end test.**

Run a complete Superspec change from start to finish in the test project:

1. Create a feature branch.
2. `/opsx:new test-pattern-a` → run through brainstorm/proposal/specs/tasks/plan.
3. Push the feature branch and `gh pr create` for spec pre-review.
4. `/opsx:apply`, `/opsx:verify`.
5. `/opsx:continue` → finalize executes the git-side closeout.
6. **Verify**: only one feature-related branch on the remote (the feature branch); the PR contains all commits including finalize.md before code review starts; archive can run on the same branch.

- [ ] **Step 3: PR comment idempotency test.**

In the same test project, re-run `/opsx:continue` against the same change (e.g., after a minor fix). Confirm the existing PR comment is **edited in place** (the comment ID is unchanged on GitHub) rather than duplicated.

- [ ] **Step 4: Escape-hatch Option 2 test.**

In a second test change, deliberately skip the manual `gh pr create` between plan and apply. Run `/opsx:continue` → finalize. Confirm:

- The instruction detects "no PR" and directs to the escape hatch.
- After invoking `superpowers:finishing-a-development-branch` and picking Option 2, the skill creates a new PR.
- Hand-writing finalize.md and running the comment subroutine posts the orientation comment on the new PR.

- [ ] **Step 5: Escape-hatch Options 1/3/4 tests.**

Three quick smoke tests (separate changes or scratch branches):

- Option 1 (merge locally): confirm the integration branch receives the merge, worktree is removed, finalize.md records `merge-locally`, comment subroutine self-skips (`PR comment: skipped (no PR)`).
- Option 3 (keep as-is): confirm the worktree is preserved, finalize.md records `kept-as-is`, comment subroutine self-skips.
- Option 4 (discard): confirm the typed-confirmation gate fires, the branch is force-deleted on confirm, finalize.md records `discarded`, comment subroutine self-skips.

- [ ] **Step 6: Summarization test.**

Prepare a test change with a deliberately long, verbose `proposal.md` and `retrospective.md`. Run the git-side closeout. Inspect the resulting PR comment:

- Total length 200–400 words (within ceiling 600).
- The text is paraphrased, not pasted. Grep the comment body for distinctive phrases from the source artifacts:

```bash
gh pr view <PR> --json comments --jq '.comments[] | select(.body | startswith("<!-- superspec:finalize-comment -->")) | .body' > /tmp/comment.md
# Grep for distinctive phrases that appear in proposal.md but should NOT appear verbatim in the comment.
grep -F "<distinctive proposal phrase>" /tmp/comment.md && echo "FAIL: verbatim paste detected" || echo "OK: paraphrased"
```

- [ ] **Step 7: Failure-tolerance test.**

In a test change, temporarily revoke `gh` auth (`gh auth logout`). Run the git-side closeout. Confirm:

- The merge/push complete successfully.
- The comment subroutine fails gracefully.
- finalize.md records `PR comment: failed — <reason>`.
- The change is otherwise git-clean and ready for `/opsx:archive`.

Restore `gh` auth at the end.

- [ ] **Step 8: Record the test outcomes.**

In this implementation's PR description (the v4 PR you're building toward), include a checklist of which tests passed. No commit needed.

---

## Task 15: Run finalize on this change (the v4 implementation)

**Files:** None modified directly; this is the recursive finalize step where v4's own implementation dogfoods the git-side closeout.

- [ ] **Step 1: Push the feature branch and open the PR (if you haven't already).**

```bash
git push -u origin spec/pattern-a-finalize
gh pr create --title "feat(schema): v4 git-side closeout finalize rewrite" --body "$(cat <<'EOF'
## Summary
- Schema v4 promotes the git-side closeout to a schema-executed canonical finalize flow.
- Demotes superpowers:finishing-a-development-branch to a manual escape hatch.
- Adds a single code-reviewer onboarding comment on the PR, marker-based idempotent upsert.
- Apply step 0 soft-warns instead of canonical-tolerates when on the integration branch.
- All docs, templates, mermaid, and SVG flowchart updated.

## Spec
See `docs/superpowers/specs/2026-05-26-pattern-a-finalize-design.md`.

## Test plan
See Task 14 of `docs/superpowers/plans/2026-05-26-pattern-a-finalize.md` for the manual integration test matrix run before this PR was opened.
EOF
)"
```

- [ ] **Step 2: This change itself doesn't need to run through `/opsx:apply` (it has no openspec change directory — the design and plan live under `docs/superpowers/`). Skip directly to the PR-update push and comment.**

The git-side closeout automation in the schema only kicks in for changes managed under `openspec/changes/<name>/`. Since this is a schema-level rewrite that lives under `docs/superpowers/`, it ships as a normal PR following the conventions in this repo's other recent changes (e.g., the v3 PR series).

- [ ] **Step 3: Manually post the code-reviewer onboarding comment on this PR.**

Even though the git-side closeout isn't auto-invoked for schema-level PRs, the comment is valuable. Write a comment that follows the same template structure (manually filled). Use `gh pr comment` to post it. This serves as a real-world dogfood test of the comment template's readability.

- [ ] **Step 4: Confirm the PR is reviewable.**

The PR is ready for code review when:

- `openspec validate --all --json` passes locally.
- All tasks in this plan have green checkboxes.
- Task 13's grep checks return no unexpected hits.
- Task 14's manual integration tests are all green.

No further commit. The PR is the deliverable.

---

## Self-Review

Spec-coverage check (every spec section maps to at least one task in this plan):

- Goals: covered by Tasks 1–11 collectively. ✓
- Git-side closeout definition: implemented in Task 2 (finalize instruction) and documented in Tasks 4, 6, 7. ✓
- Code-reviewer onboarding comment: implemented in Task 2 (subroutine), documented in Tasks 4, 7; tested in Task 14. ✓
- Escape hatch: documented in Tasks 2 (instruction), 4 (INTEGRATION), 7 (workflow-details). ✓
- `apply` step 0 wording flip: Task 1. ✓
- Borrowed-logic discipline: Tasks 2 (inline attribution) and 7 (workflow-details subsection). ✓
- Schema diff sketch: Tasks 1, 2. ✓
- Template changes: Task 3. ✓
- Doc updates table (every row): Tasks 4, 5, 6, 7, 8, 9, 10, 11. ✓
- Testing section (every item): Task 14. ✓
- Edge cases: implicitly covered by Task 14 tests (fast-forward failure, gh failure, marker collision is documented but untested — extremely low probability). ✓
- Migration from v3: Task 4 Step 7. ✓
- Resolved decisions: all four are reflected in Tasks 1 (apply soft-warn), 2 (finalize soft-fail + pr-updated distinct), 3 (template enums distinct). ✓

Placeholder scan: no `TBD`, no `TODO`, no `add appropriate X`, no "similar to Task N" without showing the work. The borrowed-logic SHA placeholder in Task 2 is resolved by Step 5 of that task before commit.

Type / name consistency check: `<feature-branch>`, `<worktree-branch>`, `<change-name>` are used consistently; marker string is `<!-- superspec:finalize-comment -->` everywhere; Outcome value `pr-updated` is consistent across schema, template, and instruction.
