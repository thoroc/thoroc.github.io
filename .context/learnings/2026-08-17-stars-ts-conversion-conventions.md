---
title: "Stars TS-conversion conventions (Phase 1 decisions)"
type: learning
date: 2026-08-17
status: active
related:
  - "../plans/2026-08-17-stars-typescript-conversion.md"
---

# Stars TS-conversion conventions (Phase 1 decisions)

## Learning

Phase 1 of the stars TypeScript-conversion plan settled five conventions
Phases 2–5 must follow. Recorded here so later phases don't rediscover them.

## Directory convention: one-function-per-file + barrel

A multi-function `.js` file splits into a directory of one-function-per-file
`.ts` modules plus a barrel:

```text
galaxy/hash.js
  → galaxy/hash/gauss3.ts
    galaxy/hash/hashSeed.ts
    galaxy/hash/hashStr.ts
    galaxy/hash/hashUnit.ts
    galaxy/hash/index.ts   (re-exports all four)
```

Internal (non-exported) helpers used by only one exported function move into
that function's own file as private, unexported locals — they don't get
their own file. A helper shared by two or more exported functions in the
same original file gets its own file too, imported by both.

## Module-class exemptions

Not everything is a function module. Three classes:

1. **Function module** (default) — one exported function per file, per above.
2. **Data module** — no functions: constants, GLSL shader strings
   (`motion-glsl.js`), i18n tables. Exempt from the one-function rule
   entirely; stays as one file, just converted to `.ts`.
3. **Cohesive-state module** — functions share closures over non-serializable
   state (WebGL/Three.js scene, camera, renderer handles: `webgl.js`,
   `nebula-volume.js`, `cosmic-background.js`). Exempt with a one-line
   comment stating why (e.g. "functions share a closed-over THREE.Scene
   reference; splitting would require threading it through every call").

## `useStarsStore` mutable-state pattern

ES module imports are read-only bindings — a `let` reassigned from another
file's function throws or silently fails to propagate. `useStarsStore.js`
has seven such bindings (`scrollListFn`, `rowRemeasureFn`, `debounceTimer`,
`searchDebounceMs`, `configuredUiLocale`, `galaxyLayoutPromise`,
`bootstrapPromise`). Pattern: wrap each in a mutable box object and mutate
the property, never rebind the export:

```ts
// Before (breaks across a file split):
let scrollListFn = () => undefined
export function registerScroller(fn) { scrollListFn = fn }

// After:
export const scrollController = { fn: (): void => undefined }
export function registerScroller(fn: () => void): void {
  scrollController.fn = fn
}
```

This keeps one-function-per-file intact for every function that only reads
or invokes the state — only the box object's *declaration* needs a home
(colocate it with the functions that mutate it, or its own small state file).

## Typing strategy

Plain TypeScript interfaces for internal pipeline shapes (galaxy layout
payloads, star items). Zod only at real input boundaries (the raw GitHub API
response in `generate.ts`) — never inside the `stars.json → galaxy.json`
computation path itself, so a validation step can't reorder or coerce values
and contaminate the byte-for-byte regression oracle.

## Regression oracle: the only sanctioned verification method

Call `computeGalaxyLayout(items)` **directly, in-process**, against the
frozen `stars.json` fixture (`public/stars/data/stars.json`, captured this
session as the Phase 1 baseline). Diff the result against the frozen
`galaxy.json` snapshot via parsed/normalized deep-equal (sorted keys, zero
numeric tolerance) — not raw byte comparison, and not `bun run
generate:stars`, which hits the live GitHub API and previously produced a
false-positive "regression" from live star-count drift between two fetches
an hour apart. Determinism confirmed: two consecutive in-process calls
against the same frozen input produce identical output.

## Test tooling (proven working, not just chosen)

- `bunfig.stars.toml` — a **scoped** config (not the root `bunfig.toml`,
  which doesn't exist) invoked via `bun test --config=bunfig.stars.toml
  src/stars`, so the site's existing `.agents/scripts`/`.agents/hooks` tests
  stay unaffected by DOM globals or a coverage gate that doesn't apply to
  them.
- `test-support/dom-setup.ts` — registers happy-dom globals via
  `@happy-dom/global-registrator` (version-pinned to match the installed
  `happy-dom` package; the API changed across happy-dom major versions).
- `test-support/vue-loader.ts` — a custom Bun plugin compiling `.vue` SFCs
  via `@vue/compiler-sfc` (`compileScript` + `compileTemplate`), since Bun
  has no native SFC support and no mature `bun-plugin-vue` package exists.
  Proven against a real component (`StarsViewToggle.vue`) via
  `@vue/test-utils`'s `mount()`, not a synthetic toy component.
- Coverage: `coverageThreshold = { lines = 0.9, functions = 0.9 }` in
  `bunfig.stars.toml` enforces **per file**, confirmed empirically (a file
  at 80% still fails even when the run's aggregate average is exactly 90%).
  Bun accepts a `statements` key but doesn't enforce it.
- WebGL/canvas exclusion: `coveragePathIgnorePatterns` (glob array) in the
  same config, each entry commented with why — confirmed empirically to
  remove the listed file from both the report and the threshold check.
