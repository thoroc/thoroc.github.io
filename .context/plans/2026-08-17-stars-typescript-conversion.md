---
title: "Plan: Bring the ported stars app into TypeScript convention compliance"
type: plan
status: done
date: 2026-08-17
effort: "L"
value: "MEDIUM"
themes:
  - TOOLING
related:
  - "../learnings/2026-08-17-aislop-alignment.md"
---

## Goal

Convert `src/stars/` and `scripts/stars/` — ported from
[thoroc/stars](https://github.com/thoroc/stars) as a Vue 3 + Three.js subsection
mounted into this Astro site — from plain JavaScript into full compliance with
this repo's TypeScript conventions: arrow-functions-only, one function per
file, a barrel `index.ts` per directory, colocated tests at ≥90% coverage, and
extension-free imports. The galaxy-layout math must remain numerically
identical to the already-verified port throughout — every conversion step is
checked against the frozen `stars.json` → `galaxy.json` snapshot already
captured in this session, not just typechecked.

**Effort caveat (from plan review):** "L" was the initial estimate; a 3-reviewer
audit judged it optimistic for ~250 functions exploding into 250+ source files
plus 250+ colocated tests plus a 2,164-line component split. Phase 1 is
explicitly a spike — if it surfaces findings that invalidate later phases'
assumptions (mixed JS/TS build viability, coverage tooling capability), replan
before continuing rather than forcing the original phase shape.

## Decisions

### PR / branching strategy

**Decision:** Merge `feat/stars-subsection` (the already-verified port) as-is
first. Then open one separate PR per phase against `main` for this plan's
work, so each phase is independently reviewable and the working port isn't
held hostage to the cleanup effort.

**Why not the alternatives:** Folding all 5 phases into the still-unmerged
port branch (option: "keep building on feat/stars-subsection") would produce
a single, effectively unreviewable diff spanning the original port plus
250+ converted/split files. Draft-PR checkpoints without separate branches
(option: "one PR per phase, same branch") don't give `main` a stable
landing point between phases, so a mid-plan pause leaves the working port
still unmerged.

**Not an ADR:** this is a plan-execution/process choice (how to sequence
review for one improvement effort), not a binding architectural decision the
rest of the system depends on — checked against `docs/ADR/` conventions and
the `adr-capture` skill's scope; no ADR filed.

## Scope

### In scope

- All files under `src/stars/` (40 `.js` files, ~250 functions; 19 `.vue`
  components, one of which — `StarsGalaxyView.vue` — is 2,164 lines and mixes
  many concerns).
- `scripts/stars/generate.mjs` and `scripts/stars/compute-galaxy-layout.mjs`.
- New dev dependencies required to test Vue components (`@vue/test-utils`,
  a DOM environment for `bun test`, e.g. `happy-dom`).
- `package.json` scripts and any CI/workflow references to
  `scripts/stars/*.mjs` paths, updated once those files become `.ts`.

### Out of scope

- The rest of the site (`src/pages`, `src/lib`, `src/i18n`, `src/components`)
  — already TypeScript, untouched by this plan.
- Rendering fidelity changes to the galaxy visualization itself — this is a
  structural/typing conversion, not a feature or visual change.
- Raw WebGL/canvas draw calls (actual Three.js rendering) — cannot be
  meaningfully unit-tested without a real GPU context. These are explicitly
  excluded from the ≥90% coverage target per file, not silently skipped (see
  Verification).
- Merging `src/stars/i18n/`, `src/stars/theme/`, or `src/stars/storage/` into
  the site's existing `src/i18n/` or equivalents. They're intentionally
  parallel: the stars subsection uses its own zh-CN/en locale pair (distinct
  from the site's en/fr) and is a self-contained subsection by design, per
  the original port plan. Convert in place; do not consolidate.

## Phases

### Phase 1: Tooling, conventions, and spike verification — ✅ done

See `.context/learnings/2026-08-17-stars-ts-conversion-conventions.md` for
the recorded conventions and proof results.

Exit criterion: dev dependencies installed; a trivial Vue component test runs
green under `bun test`; the one-function-per-file/barrel directory layout,
module-class exemptions, and the `useStarsStore` mutable-state pattern are
all decided and documented; the coverage-and-exclusion mechanism is proven
end-to-end on a real file, not just chosen in the abstract; one full file is
converted end-to-end as a build/typecheck/test proof-of-pattern; the frozen
regression fixture is confirmed deterministic.

- Add `@vue/test-utils` and a DOM environment (`happy-dom`) as dev
  dependencies. Name the concrete wiring: the `.vue` SFC compile step `bun
  test` will use (Bun does not compile SFCs natively), the preload file that
  registers the happy-dom globals, and how DOM-vs-node environment is
  selected per test file. Prove it with one trivial Vue component test
  passing green. (wave: single)
- Choose the coverage tool/config that enforces ≥90% **per file** under
  `bun test`, and the exact mechanism for declaring a WebGL/canvas exclusion
  (inline ignore comment vs. coverage-config exclude list). Prove both halves
  concretely: write one normal test hitting ≥90% on a sample file, and one
  WebGL-touching file with a declared exclusion, and confirm the runner
  reports and enforces per-file thresholds as expected. If per-file
  enforcement isn't achievable under the pinned Bun version, re-specify the
  target now (e.g. a global threshold plus an explicit exclude list) — don't
  discover this in Phase 2. (wave: single)
- Decide and document the directory convention for splitting a multi-function
  `.js` file into one-function-per-file `.ts` modules with a barrel (e.g.
  `galaxy/hash.js` → `galaxy/hash/{gauss3,hashSeed,hashStr,hashUnit}.ts` +
  `galaxy/hash/index.ts`), including how internal (non-exported) helpers are
  named. Define explicit module-class exemptions: **function modules** (the
  default, one function each), **data modules** (constants, GLSL shader
  strings, i18n tables — no functions, exempt from the one-function rule),
  and **cohesive-state modules** (WebGL/Three.js code sharing closures over
  scene/camera/renderer handles — documented exemption with a stated reason,
  not split just to satisfy the rule). (wave: single)
- Decide and document the `useStarsStore` mutable-state pattern before Phase
  3 touches it: reassigned module-level `let` bindings (`scrollListFn`,
  `rowRemeasureFn`, `debounceTimer`, `searchDebounceMs`, `configuredUiLocale`,
  `galaxyLayoutPromise`, `bootstrapPromise`) cannot be reassigned across an ES
  module boundary — only object-property mutation survives a `.ts` file
  split. Adopt mutable box objects (e.g. `export const scrollController = {
  fn: (): void => undefined }`, reassign `.fn`, never rebind the export) as
  the standard pattern, applied per-binding. This keeps one-function-per-file
  intact for every function that only reads or invokes the state. (wave:
  single)
- Decide the typing strategy for shared shapes (galaxy layout payloads, star
  items): plain TypeScript interfaces for internal pipeline shapes; reserve
  Zod schemas for boundaries with untrusted input (e.g. the raw GitHub API
  response in `generate.ts`), per this repo's existing convention. Hard rule:
  no runtime validation (Zod `.parse()` or similar) is inserted into the
  `stars.json → galaxy.json` computation path itself — types only there — so
  the byte-identical oracle stays uncontaminated by a validation step that
  could reorder or coerce values. (wave: single)
- Convert one trivial file end-to-end (`src/stars/config/paths.js`) to prove
  the whole toolchain — `.ts`, one-function-per-file if applicable, barrel,
  colocated test — passes `bun run typecheck`, `bun test`, and `bun run
  build` with the rest of the tree still in JS. If mixed JS/TS doesn't build
  cleanly under this repo's `astro check` / `tsconfig` settings, that's a
  plan-altering discovery to resolve now, not mid-Phase-2. (wave: single,
  after the conventions above are decided)
- Freeze `public/stars/data/stars.json` as the regression-oracle fixture.
  Confirm determinism, not just correctness: call `computeGalaxyLayout(items)`
  (from `scripts/stars/compute-galaxy-layout.mjs`, imported directly with the
  frozen `items` array — bypassing `generate.mjs`'s live GitHub fetch
  entirely, exactly as verified earlier in this session) twice against the
  same frozen input and confirm the two outputs are identical to each other
  *before* comparing against the committed `galaxy.json`. Record this direct
  in-process call as the required verification method for every later phase
  — **never** `bun run generate:stars` for regression-checking purposes,
  since that always hits the live API and reproduces the exact false-positive
  (star-count drift between fetches) already hit once this session. Pin the
  Bun version this oracle is run under. (wave: single)

Dependencies: none.

### Phase 2: Pure modules — galaxy math, utils, storage, theme, i18n, config — ✅ done

Exit criterion: every non-Vue, non-composable module is `.ts`, one function
per file (or a declared data/cohesive-state exemption from Phase 1) with a
barrel, has colocated tests meeting the Phase-1-proven coverage convention,
and every file's split is followed immediately by a regeneration-and-diff
against the frozen fixture — not one diff at the end of the whole wave.

- Wave A: convert `src/stars/galaxy/*.js` one file at a time (constants,
  hash, colors, force-similarity, galaxy-field, gas-clump-field, gas-buffers,
  motion-math, motion-glsl, motion-hubs, motion, positions, repo-position,
  star-visuals, virtual-star-placement, virtual-stars, layout-payload, webgl,
  nebula-volume, cosmic-background, pick, zoom-controls, camera-transition).
  Commit each file's conversion atomically so a regression is bisectable.
  Split into two explicit tracks:
  - **Oracle-covered** (feeds `stars.json → galaxy.json`): constants, hash,
    colors, force-similarity, galaxy-field, gas-clump-field, gas-buffers,
    motion-math, motion-hubs, motion (the field-building parts),
    layout-payload, positions, repo-position, star-visuals,
    virtual-star-placement, virtual-stars. Verify each with the direct
    `computeGalaxyLayout()` diff from Phase 1.
  - **Runtime-only, not exercised by the fixture** (camera/interaction/render
    code): `pick`, `zoom-controls`, `camera-transition`, `nebula-volume`,
    `cosmic-background`, `webgl`, `motion-glsl`. These need their own
    colocated unit tests as the *actual* regression gate — the byte-diff
    gives zero coverage here — plus inclusion in Phase 4's manual interaction
    checklist (zoom limits, hover-pick target, background render).
- Wave B (parallel with A): convert `src/stars/utils/*.js`,
  `src/stars/storage/ui-prefs.js`, `src/stars/theme/color-theme.js`,
  `src/stars/i18n/index.js`, `src/stars/config/paths.js` (already done as
  Phase 1's proof file).
- After each oracle-covered file's conversion: regenerate via the direct
  `computeGalaxyLayout()` call against the frozen fixture and diff. Use a
  parsed/normalized deep-equal (sorted keys, zero numeric tolerance) rather
  than raw byte comparison, so a benign serialization-order change from
  restructuring a JS object into a TS interface doesn't register as a false
  regression — any divergence that *does* survive normalization is treated
  as real and must be explained in the commit message before proceeding, no
  exceptions.
- Run `aislop scan` (or `mise run aislop`) after Wave A completes and again
  after Wave B. This repo's pre-commit gate requires a score ≥85, and the
  prior session needed an aislop-driven split of several of these same files
  — splitting ~24 files into 100+ one-function modules plus barrels is
  exactly the shape that trips duplication/trivial-wrapper heuristics. Record
  the current aislop baseline before Wave A starts so any regression is
  attributable to this phase.

Dependencies: Phase 1.

### Phase 3: Composables — ✅ done

Exit criterion: `src/stars/composables/*.js` are one-function-per-file `.ts`
with a barrel and colocated tests at the Phase-1 coverage convention, and
`useStarsStore`'s singleton-reactive semantics (module-scope `ref`/`computed`,
not per-call instances) are preserved exactly using the mutable-box-object
pattern decided in Phase 1.

- Convert `useLayoutResize`, `useMediaQuery`, `useMobileSheetInset`,
  `useStarsI18n`, `useStarsTheme` (small, independent — wave: A).
- Convert `useStarsStore` (762 lines, the central reactive store) into its
  constituent one-function-per-file pieces plus a barrel, applying the Phase
  1 mutable-box-object pattern to every reassigned `let` binding (wave: B,
  after wave A's pattern is proven).
- Add a singleton-identity test: import the store barrel twice, mutate state
  through one import path, assert the mutation is observable through the
  other. Typecheck alone cannot catch a regression from singleton to
  per-call-instance semantics — this is the only thing that can.

Dependencies: Phase 2 (composables import galaxy/utils modules).

### Phase 5: Build scripts — ✅ done

Exit criterion: `scripts/stars/generate.mjs` and
`scripts/stars/compute-galaxy-layout.mjs` are one-function-per-file `.ts`
with a barrel and tests; calling the converted `computeGalaxyLayout()`
directly against the Phase 1 frozen fixture (never via a live `bun run
generate:stars` invocation) still produces output byte-identical (via the
normalized deep-equal from Phase 2) to the Phase 1 snapshot; `package.json`'s
`generate:stars` script and any CI/workflow references to the old `.mjs`
paths are updated to the new `.ts` entry points, with no stale references
left anywhere in the repo.

- Convert `compute-galaxy-layout.mjs` (imports from the now-`.ts` galaxy
  modules) (wave: A).
- Convert `generate.mjs` (wave: B, depends on A for the layout import).
- Update `package.json` scripts and grep the repo (CI workflows,
  `mise.toml`, `astro.config.mjs`) for any remaining reference to the old
  `scripts/stars/*.mjs` paths.

Dependencies: Phase 2. **Independent of Phases 3 and 4** — the build scripts
don't import Vue components, so this phase can run concurrently with either,
rather than strictly last. Sequence it whenever convenient once Phase 2 is
done.

### Phase 4: Vue components — ✅ done

Exit criterion: every `.vue` file uses `<script setup lang="ts">`;
`StarsGalaxyView.vue` is split into focused sub-components by concern (scene
setup, camera/zoom controls, picking, HUD overlays, etc.) rather than one
2,164-line file; testable logic has colocated `@vue/test-utils` tests,
prioritized by value (galaxy-math-adjacent logic and composable-backed
components first; simple prop/emit-only components lowest priority — the
phase may close with those incomplete if time-boxed, since they're the
lowest marginal-value tests in the whole plan); the `/stars` page still
builds, typechecks, and renders correctly against a recorded baseline, not
just "looks fine."

- **4a — typing only, no structural change:** convert `StarsGalaxyView.vue`
  to `<script setup lang="ts">` in place first, with zero structural change.
  Typecheck and build green. This alone satisfies the stated TS-compliance
  goal for this file and is fully separable from the split below — if 4b
  stalls or is deprioritized later, 4a still ships real, low-risk value.
  (wave: single)
- **4b — design, then split:** before touching the component, enumerate the
  intended sub-components and map which reactive state and Three.js object
  references (scene/camera/renderer handles — non-reactive mutable objects)
  cross each proposed boundary. Decide the sharing mechanism explicitly per
  boundary (a composable or `provide`/`inject` for Three.js handles; props/
  emits for simple reactive data — not one blanket choice). Capture a
  before-split baseline: screenshots at a few known camera positions/states,
  plus a short interaction checklist (zoom in/out to limits, hover-pick a
  star, select it, toggle theme, switch view mode) with expected outcomes
  written down. If the ideal decomposition reveals circular composable
  dependencies that don't cleanly separate, fall back to fewer, larger
  sub-components rather than stalling the phase on an unreachable ideal
  split. (wave: single, highest-risk task in the plan — do this after 4a)
- Convert the remaining 18 `.vue` files to `<script setup lang="ts">`,
  adding colocated tests for props/emits/computed logic, in the priority
  order stated in the exit criterion (wave: parallel across components once
  the split pattern from 4b is proven).
- Re-run the before/after checklist and screenshots from 4b against the
  split result. Manually verify the built `/stars` page in a browser (dev
  server): galaxy view renders, filters/search/list view work, no console
  errors — compared against the recorded baseline, not from memory.

Dependencies: Phase 3.

## Risks

- **Regression risk in the galaxy math** during one-function-per-file
  splitting — mitigated by a normalized-deep-equal fixture diff required
  after *each file's* split in Phase 2's oracle-covered track, not once per
  wave or once per phase.
- **Vue reactivity subtleties**: `useStarsStore`'s `let`-bound mutable
  closures (`scrollListFn`, `debounceTimer`, etc.) break if split across
  files without care — importing bindings across ES modules is read-only.
  Resolved in Phase 1 via the mutable-box-object pattern (see Decisions-
  adjacent Phase 1 task); Phase 3 must apply it, not rediscover it.
- **WebGL/canvas is not meaningfully unit-testable** in a headless DOM —
  the coverage target applies per-file after excluding declared WebGL/canvas
  call sites, not as a blanket repo-wide number; a coverage report that
  looks lower than 90% is expected and correct for files like `webgl.js`.
  These files instead get their own colocated unit tests for non-GL logic
  plus inclusion in Phase 4's manual interaction checklist.
- **`generate.mjs`'s live GitHub fetch can reproduce this session's exact
  false-positive** (star-count drift between two live fetches falsely
  reading as a regression). Mitigated by Phase 1 mandating the direct
  `computeGalaxyLayout(items)` in-process call against the frozen fixture as
  the *only* sanctioned verification method — never `bun run generate:stars`
  for regression-checking.
- **Effort is genuinely large** (~250 functions → ~250+ source files, ~250+
  test files, splitting a 2,164-line component) — larger than the initial
  "L" estimate per plan review. Ships in phases so partial progress is a
  working, buildable state at every checkpoint; Phase 1 is explicitly a
  spike that may force replanning the phases below it.
- **Scope creep into visual/behavioral changes** — the galaxy view's actual
  appearance and interaction must not change. Phase 4 is split into 4a
  (typing only) and 4b (structural split) specifically so the compliance
  goal doesn't get entangled with — or held hostage by — the riskier
  redesign.
- **This repo's `aislop` gate (≥85, pre-commit-enforced)** is a real
  constraint on the one-function-per-file/barrel convention: mass-splitting
  into small modules plus barrels is exactly the shape that trips
  duplication and trivial-wrapper heuristics. Phase 2 records a baseline and
  scans after each wave rather than discovering this at the first commit.
- **Parallel waves writing into the same directory's barrel `index.ts`** is
  a merge-conflict hotspot. Serialize barrel-file edits within a wave (last
  writer merges all new exports) rather than treating barrel updates as
  parallel-safe.

## Verification

- `bun run typecheck` — 0 errors after every phase.
- `bun test` — 0 failures; coverage meets the Phase-1-proven per-file
  convention, with WebGL/canvas-touching files' exclusions explicitly
  declared (comment or config) rather than silently under target.
- `bun run build` — succeeds after every phase.
- `aislop scan` (or `mise run aislop`) — score ≥85, checked after Phase 2's
  Wave A and Wave B and after any later phase that adds a meaningful number
  of new files.
- Regression oracle: call `computeGalaxyLayout(items)` directly (imported
  in-process) against the Phase 1 frozen `stars.json` fixture — **never**
  `bun run generate:stars`, which hits the live GitHub API — and diff via
  normalized deep-equal (sorted keys, zero numeric tolerance) against the
  Phase 1 snapshot. Run after each oracle-covered file's conversion in Phase
  2, and again after Phase 5.
- Manual dev-server check of `/stars` after Phase 4: galaxy renders, list
  view, filters, search, and theme toggle all work with no console errors,
  compared against the Phase 4b screenshot/interaction-checklist baseline.

## Open Questions

- Exact `bun test` coverage-tool capability for per-file thresholds and
  exclusion declarations is unverified as of this writing — Phase 1 treats
  proving this concretely as a blocking exit criterion rather than an
  assumption, but the specific tool/config isn't chosen yet.
