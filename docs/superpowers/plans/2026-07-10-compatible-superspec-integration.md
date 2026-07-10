# Compatible Superspec Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce a compatibility-oriented Superspec integration story that preserves native OpenSpec semantics, documents strong-guidance mode explicitly, and adds explicit Superspec enhancement skill wrappers.

**Architecture:** The work lands in thin documentation-and-skill slices. First establish the compatibility vocabulary in top-level docs, then relabel the existing schema docs as strong-guidance mode, then add wrapper skills that expose explicit enhancement entry points without changing native OpenSpec skill semantics.

**Tech Stack:** Markdown documentation, OpenSpec change artifacts, Codex skill definitions, ripgrep-based verification, OpenSpec CLI validation

## Global Constraints

- Preserve existing `openspec-*` meanings; do not silently repurpose native OpenSpec terms.
- Treat the current `superspec` schema as strong-guidance mode in docs rather than removing it.
- Keep edits scoped to documentation and `.codex/skills/` wrapper definitions for this slice.
- Avoid touching unrelated user changes elsewhere in the worktree.
- Verify claims with fresh command output before reporting completion.

---

### Task 1: Establish compatibility-mode documentation

**Files:**
- Create: `docs/compatibility-mode.md`
- Modify: `README.md`
- Modify: `docs/workflow.md`
- Modify: `docs/workflow-details.md`

**Interfaces:**
- Consumes: `openspec/changes/compatible-superspec-integration/proposal.md`, `openspec/changes/compatible-superspec-integration/design.md`, `openspec/changes/compatible-superspec-integration/specs/workflow-compatibility/spec.md`
- Produces: A documented two-mode story (`compatibility` vs `strong-guidance`) that later tasks can reference when updating schema docs and wrapper skill descriptions

- [ ] **Step 1: Draft the compatibility-mode page**

Create `docs/compatibility-mode.md` with sections for:
- compatibility mode goals
- native OpenSpec layer
- explicit Superspec enhancement actions
- durable vs transient enhancement boundaries
- conditional enhancers
- how compatibility mode differs from strong-guidance mode

- [ ] **Step 2: Update the top-level README to introduce both integration modes**

Edit `README.md` so it:
- explains Superspec now has a strong-guidance schema story and a compatibility-oriented integration story
- links to `docs/compatibility-mode.md`
- keeps the existing quick-start flow but labels it as the strong-guidance schema path

- [ ] **Step 3: Update workflow overview docs to label the existing flow correctly**

Edit `docs/workflow.md` and `docs/workflow-details.md` so the currently documented phase pipeline is described as the strong-guidance schema flow rather than the universal Superspec workflow.

- [ ] **Step 4: Verify the new mode language is present and consistent**

Run: `rg -n "compatibility mode|strong-guidance|native OpenSpec|explicit Superspec enhancement" README.md docs`

Expected: hits in the new compatibility page plus updated workflow-facing docs with no contradictory “only flow” wording in the edited sections

- [ ] **Step 5: Commit the documentation slice**

```bash
git add README.md docs/compatibility-mode.md docs/workflow.md docs/workflow-details.md
git commit -m "docs: introduce compatibility and strong-guidance workflow modes"
```

### Task 2: Reframe schema documentation as strong-guidance mode

**Files:**
- Modify: `openspec/schemas/superspec/README.md`
- Modify: `openspec/schemas/superspec/INTEGRATION.md`

**Interfaces:**
- Consumes: output from Task 1 and `openspec/changes/compatible-superspec-integration/specs/enhanced-change-actions/spec.md`
- Produces: schema-local docs that clearly state the current schema is the strong-guidance mode and describe its relationship to compatibility mode

- [ ] **Step 1: Update schema README framing**

Edit `openspec/schemas/superspec/README.md` so it:
- labels the current schema as strong-guidance mode
- explains why the schema remains valuable
- points readers to compatibility mode when they want native OpenSpec semantics plus explicit enhancements

- [ ] **Step 2: Update integration guide framing**

Edit `openspec/schemas/superspec/INTEGRATION.md` so it:
- describes the document as the strong-guidance schema integration guide
- clarifies the relationship between schema-owned orchestration and compatibility-mode explicit enhancement actions

- [ ] **Step 3: Verify schema docs align with the new framing**

Run: `rg -n "strong-guidance|compatibility mode|only integrated workflow|universal default" openspec/schemas/superspec`

Expected: strong-guidance and compatibility references appear where needed, and no edited section still implies the schema is the only supported integration story

- [ ] **Step 4: Commit the schema-doc slice**

```bash
git add openspec/schemas/superspec/README.md openspec/schemas/superspec/INTEGRATION.md
git commit -m "docs: reframe superspec schema as strong-guidance mode"
```

### Task 3: Add explicit Superspec enhancement wrapper skills

**Files:**
- Create: `.codex/skills/superspec-brainstorm/SKILL.md`
- Create: `.codex/skills/superspec-plan/SKILL.md`
- Create: `.codex/skills/superspec-apply-change/SKILL.md`
- Create: `.codex/skills/superspec-finalize/SKILL.md`

**Interfaces:**
- Consumes: compatibility-mode docs from Task 1, schema framing from Task 2, native OpenSpec skill behavior in `.codex/skills/openspec-*.md`
- Produces: explicit enhancement entry points that future routing work (`superspec-next`) can target by name

- [ ] **Step 1: Draft `superspec-brainstorm`**

Create a wrapper skill that:
- preserves native `openspec-explore`
- explicitly opts into structured brainstorming
- explains when it should create durable outputs versus remain conversational

- [ ] **Step 2: Draft `superspec-plan`**

Create a wrapper skill that:
- runs between coarse `tasks.md` and implementation
- points to micro-planning behavior and durable `plan.md` output when applicable

- [ ] **Step 3: Draft `superspec-apply-change` and `superspec-finalize`**

Create wrapper skills that:
- expose enhanced apply behavior with worktrees, TDD, and review
- expose enhanced finalize behavior for git-side closeout
- describe their relationship to native `openspec-apply-change`, verify, and archive

- [ ] **Step 4: Verify wrapper names and references are discoverable**

Run: `rg -n "superspec-brainstorm|superspec-plan|superspec-apply-change|superspec-finalize" .codex/skills README.md docs openspec`

Expected: all four wrappers exist and are referenced consistently from compatibility-facing docs

- [ ] **Step 5: Run workflow validation and commit the wrapper slice**

Run: `openspec validate --all --json`

Expected: all planning artifacts remain valid after documentation and wrapper-skill changes

```bash
git add .codex/skills/superspec-brainstorm/SKILL.md .codex/skills/superspec-plan/SKILL.md .codex/skills/superspec-apply-change/SKILL.md .codex/skills/superspec-finalize/SKILL.md
git commit -m "feat: add explicit superspec enhancement wrappers"
```
