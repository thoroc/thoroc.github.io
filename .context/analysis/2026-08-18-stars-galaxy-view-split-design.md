---
title: "StarsGalaxyView.vue split design (Phase 4b)"
type: analysis
date: 2026-08-18
status: active
related:
  - "../plans/2026-08-17-stars-typescript-conversion.md"
---

# StarsGalaxyView.vue split design (Phase 4b)

## Context

`StarsGalaxyView.vue` is 2230 lines post-Phase-4a (`<script setup lang="ts">`, commit `cd95ee2`). Almost all
the *pure math* this component uses is already extracted and tested as Phase 2 `.ts` modules:
`galaxy/camera-transition/`, `galaxy/pick/`, `galaxy/zoom-controls/`, `galaxy/positions/`
(`buildGalaxyBuffers`, `buildDustBuffers`, `finalizeGalaxyMotion`, ...), `galaxy/nebula-volume/`,
`galaxy/motion`, `galaxy/colors`, `galaxy/hash`. This component itself contains almost no math of its own —
it is an **orchestrator**: it owns the Three.js object graph (scene/camera/renderer/controls/materials/
meshes), wires DOM pointer/wheel/keyboard events to the pure functions above, and drives the render loop.

That changes the shape of this split from "extract more pure logic" (already done in Phase 2) to
"separate concerns of *state ownership* within one large stateful object graph." The four template dir
name pieces (`<template>`, 65 lines, byte-identical since Phase 4a) barely reference any of this — it reads
`legendItems`, `starTierItems`, `legendFilter`, `hoverLabel`, `hoverTip`, `autoRotate`, `showLegend`,
`showFocusOwnerRepo`, `loadingScene`, `layoutComputing`, and about a dozen method calls
(`zoomIn`/`zoomOut`/`resetView`/...). Splitting the script does not require touching the template beyond
what a composable-based extraction naturally implies (see §5).

## 1. Proposed sub-components/composables, by concern

| Concern | Owns | Classification |
| --- | --- | --- |
| **Scene bootstrap & lifecycle** | `initScene`, `dispose`, `resize`, the `THREE.Scene`/`camera`/`renderer`/`controls`/`viewPivot`/`galaxyGroup`/`dust`/`cosmicSky` handles, the 3 `ShaderMaterial`s + their GLSL source strings, `resizeObserver` | **Cohesive-state module** — one composable, not split further |
| **Camera / auto-rotate / transitions** | `cameraTransition`, `applyCameraAutoRotate`, `saveDefaultView`/`resetViewPivot`, `animateCameraTo`/`animateDolly`/`dollyByNotches`, `zoomIn`/`zoomOut`/`resetView`, `fitCamera`, `focusStarByIndex`/`focusCenterStar`/`focusGalaxySelected`/`focusOwnerStar` | **Cohesive-state module** — reads/writes `camera`+`controls` from Scene bootstrap; see §4 circular-dependency note |
| **Buffer sync (stars + gas/dust/nebula)** | `applyBuffers`, `syncMotionAttributes`, `syncPickPositions`, `syncGasClouds`/`syncGasDustClouds`/`disposeGasLangLayers`/`updateGasLangLayers`, `runGalaxyRebuild`/`rebuildGalaxy`/`buildGalaxyBuffersForItems`/`canUsePrecomputedLayout`/`refreshGalaxyShaderSources`, all the `let` buffer state (`starCount`, `restPositions`, `starSizes`, `starBrights`, `motionFields`, `gasLangLayers`, `gasDustLangLayers`, `fieldGasMesh`, `fieldGasDustMesh`, `fieldVolumeMesh`, `interactionData`, `idToIndex`, `repoIdToIndices`, `currentVirtualStars`, `currentItems`, `anchorStarIndex`, `ownerStarIndex`) | **Cohesive-state module** — the single largest, most self-contained piece |
| **Pointer/wheel/pinch interaction + picking** | `onPointerDown/Move/Up/Cancel`, `onCanvasHover`/`flushCanvasHover`/`onCanvasLeave`, `onGalaxyWheel`, `beginPinchGesture`/`endPinchGestureIfNeeded`/`pinchPointerDistance`/`syncControlsForPointerCount`, `applyOrbitDragFromPointer`, `trackPointerDrag`, `onGalaxyAuxClick`, `onGalaxyKeyDown`/`isGalaxyKeyboardContext`, `pickIndex`/`pickIndexWithView`/`snapshotPickView`/`clearPointerPick`, all the gesture `let`s (`pointerDown`, `orbitGestureActive`, `pointerDragMoved`, `activePointers`, `pinchActive`, `lastPinchDistance`, `middleDragLastY`, `orbitDragLastX/Y`, `wheelDeltaAccum`, `pointerPickIdx`, `pointerPickView`) | **Cohesive-state module** — reads Scene (camera/controls/points/rendererRef) and calls into Camera (animateDolly, cancelCameraTransition) and Buffer-sync (pickIndex needs restPositions/starCount/motionFields) |
| **Legend filter highlight sync** | `emptyLegendFilter`/`isLegendFilterActive`/`itemMatchesLegendFilter`/`syncLegendHighlight`, `toggleLegendLang`/`toggleLegendTier`/`clearLegendFilter`/`onLegendSelectLang`/`onLegendSelectTier`, `legendFilter` ref, `legendLangSet` | **Genuinely extractable** — only needs read access to `points` (geometry attribute) + `currentItems`/`starCount` from Buffer-sync, one-way |
| **Render loop** | `animate`, `pauseGalaxyForDocumentHidden`/`resumeGalaxyFromDocumentVisible`/`onDocumentVisibilityChange`, `markRender`/`needsRender`, `lastRenderMs`, `animationId`, `TWINKLE_FRAME_MS` | **Cohesive-state module** — reads from every other piece each frame (camera, controls, materials, gasLangLayers, cameraTransition) |
| **Selection/hover state + HUD** | `hoveredIndex`/`selectedIndex`, `hoverTip` ref, `hoverLabel` computed, `syncSelectedIndex`/`setHoverIndex`/`syncRepoHighlightMask`, `highlightItem` | Small, mostly reactive — natural to keep as thin glue rather than its own file (see §4) |
| **Component root (`StarsGalaxyView.vue` itself)** | `props`/`emit`, `containerRef`/`galaxyRootRef`/`loadingScene`/`layoutComputing`/`autoRotate`/`showLegend`/`showFocusOwnerRepo`, the `watch()`s, `onMounted`/`onUnmounted`, the template | Orchestration + Vue lifecycle wiring |

## 2. What crosses each boundary

**Scene bootstrap ↔ everything else** (the widest boundary — nearly every other piece reads these):
`camera: THREE.PerspectiveCamera | null`, `controls: TrackballControls | null`, `galaxyGroup: THREE.Group | null`,
`viewPivot: THREE.Group | null`, `points: THREE.Points | null` (written by Buffer-sync, read by
Camera/Interaction/Render), `dust`, `cosmicSky`, `pointMaterial`/`gasMaterial`/`gasDustMaterial` (written at
init by Scene, mutated by Render's per-frame uniform updates and Buffer-sync's `refreshGalaxyShaderSources`/
`syncMotionAttributes`), `sceneRef`/`rendererRef` (already `shallowRef`s — these can stay as the composable's
public reactive surface), `resize()` (called by Scene's own ResizeObserver, but also by 3 `watch()`s in the
root and by `toggleFullscreen`).

**Camera ↔ Scene**: reads `camera`/`controls`/`galaxyGroup`/`viewPivot` (all from Scene). **Camera ↔
Interaction**: Interaction calls `cancelCameraTransition`, `animateDolly`, `dollyByNotches`; Camera's
`focusStarByIndex` calls Interaction-adjacent `syncSelectedIndex` (actually Selection/HUD) and emits
`select`. **Camera ↔ Buffer-sync**: `focusStarByIndex`/`focusCenterStar` read `starCount`/`currentItems`/
`anchorStarIndex` and call `starWorldPosition`→`resolveStarLocalPosition` which reads `restPositions`/
`motionFields` (Buffer-sync state) — **this is a real two-way coupling**, not just Camera-reads-Buffer-sync:
`applyBuffers` (Buffer-sync) calls `fitCamera` (Camera) and, when `props.focusId` is set, calls
`focusStarByIndex` (Camera) directly. See §4.

**Interaction ↔ Buffer-sync**: `pickIndex` reads `points`/`restPositions`/`starCount`/`starSizes`/
`starBrights`/`motionFields`/`currentItems` — all Buffer-sync state — via the pure `pickStarIndexScreen`
function. **Interaction ↔ Selection/HUD**: `onPointerUp` calls `setHoverIndex` and (via `focusStarByIndex`)
triggers selection; `flushCanvasHover`/`onCanvasLeave` call `setHoverIndex` directly.

**Legend ↔ Buffer-sync**: `syncLegendHighlight`/`itemMatchesLegendFilter` read `points` (geometry attribute),
`starCount`, `currentItems`, `legendLangSet` (written by `applyBuffers` in Buffer-sync). One-way: Legend
reads, never writes, Buffer-sync state.

**Render ↔ everything**: reads `camera`, `controls`, `cameraTransition` (Camera), `pointMaterial`/
`gasMaterial`/`nebulaVolumeTimeUniform` (Scene), `gasLangLayers` (Buffer-sync), `autoRotate`/
`autoRotateSuspended`/`galaxyMotionFrozen` (Camera-owned flags), `sceneRef`/`rendererRef` (Scene). Calls
`applyCameraAutoRotate` (Camera), `updateGasLangLayers` (Buffer-sync).

**Root component ↔ all composables**: `props.items`/`props.focusId`/`props.isMobile` drive 4 `watch()`s that
call `rebuildGalaxy` (Buffer-sync), `syncSelectedIndex`+`focusStarByIndex` (Selection+Camera), `resize`
(Scene). `onMounted` calls `initScene` (Scene) → `store.ensureGalaxyLayout()` → `runGalaxyRebuild`
(Buffer-sync) → starts the render loop (Render) → registers `onGalaxyKeyDown` (Interaction) and
visibility-change handlers (Render's pause/resume).

## 3. Sharing mechanism per boundary

All of Scene/Camera/Buffer-sync/Interaction/Render own **non-reactive closure state** (raw Three.js handles,
`let` bindings) — none of it needs to be Vue-reactive (the existing code never reads these through Vue's
reactivity system; `markRender()` + the RAF loop is the actual invalidation mechanism, not `watch`). This
matches the Phase 1 `useStarsStore` **mutable-box-object pattern** almost exactly, except scoped to one
component instance instead of a module-level singleton — so the composables should be **per-invocation**
(returning a fresh box each call, called once from `StarsGalaxyView.vue`'s own `<script setup>`), not
singletons like `useStarsStore`.

Recommended shape:

```ts
// composables/useGalaxyScene.ts (or src/stars/composables/useGalaxyScene/index.ts)
export const useGalaxyScene = () => {
  const sceneRef = shallowRef<THREE.Scene | null>(null)
  const rendererRef = shallowRef<THREE.WebGLRenderer | null>(null)
  const state = {
    camera: null as THREE.PerspectiveCamera | null,
    controls: null as TrackballControls | null,
    viewPivot: null as THREE.Group | null,
    galaxyGroup: null as THREE.Group | null,
    points: null as THREE.Points | null,   // WRITTEN by useGalaxyBuffers — see below
    dust: null as THREE.Points | null,
    cosmicSky: null as THREE.Mesh | null,
    pointMaterial: null as THREE.ShaderMaterial | null,
    gasMaterial: null as THREE.ShaderMaterial | null,
    gasDustMaterial: null as THREE.ShaderMaterial | null,
    resizeObserver: null as ResizeObserver | null,
  }
  const initScene = (containerEl: HTMLElement) => { /* ... */ }
  const resize = () => { /* ... */ }
  const dispose = () => { /* ... */ }
  return { sceneRef, rendererRef, state, initScene, resize, dispose }
}
```

- **Scene ↔ Camera/Buffer-sync/Interaction/Render**: pass the **same `state` box object** into each sibling
  composable's factory function (`useGalaxyCamera(scene.state)`, `useGalaxyBuffers(scene.state, ...)`, etc.)
  so every piece reads/writes the *same* `camera`/`controls`/`points`/materials through one shared object —
  exactly like `useStarsStore`'s `scrollController`/`rowRemeasureController` boxes, just wired explicitly at
  construction time instead of via module-scope singletons. **This is the mechanism for every
  Scene-adjacent boundary in §2** — a single shared mutable box, not props/emits, not provide/inject (no
  child *component* boundary exists here — these are all plain composables called from the same
  `<script setup>`, not separate SFCs).
- **Legend → Buffer-sync**: same shared-box read access; Legend's own `legendFilter` ref and
  `legendLangSet`/`toggleLegendLang`/etc. can live in a small `useGalaxyLegendFilter(buffers.state)`
  composable, or simply stay in `StarsGalaxyView.vue`'s own script if it turns out to be barely 40 lines
  once extracted — see §4's recommendation to keep this one inline.
- **Root component → composables**: plain function calls + reading the returned refs/state directly in the
  template (`sceneRef`/`rendererRef` are already `shallowRef`s so template bindings work unchanged;
  `legendItems`/`starTierItems`/`hoverTip`/`hoverLabel`/`autoRotate`/`showLegend`/`showFocusOwnerRepo`
  either move into the relevant composable's return value or stay as root-level refs the composables accept
  as parameters — see §5 for which).
- **Existing sibling SFCs** (`StarsGalaxyControls.vue`, `StarsGalaxyDetail.vue`, `StarsGalaxyLegend.vue`)
  are unaffected — they already receive plain props/emit and don't need `provide`/`inject`; nothing in this
  split changes their contract. The inline `hoverLabel`/`hoverTip` tooltip markup could theoretically become
  a 4th sibling SFC, but it's 6 lines of template bound to one computed + one ref — not worth a file for
  Phase 4b; leave it inline in `StarsGalaxyView.vue`'s template (flagged as a "simple prop/emit-only"
  candidate the plan explicitly deprioritizes).

## 4. Circular-dependency check

Two real bidirectional couplings surfaced:

1. **Camera ↔ Buffer-sync**: `applyBuffers` (Buffer-sync) calls `fitCamera` and conditionally
   `focusStarByIndex` (both Camera); `focusStarByIndex`/`focusCenterStar` (Camera) call
   `starWorldPosition`→`resolveStarLocalPosition` which reads Buffer-sync's `restPositions`/`motionFields`/
   `starCount`. **Resolution**: don't split these into two separate composables. Merge into one
   `useGalaxyBuffers` composable that owns both the buffer state *and* the camera-fitting/focus functions
   that need buffer-derived world positions (`fitCamera`, `focusStarByIndex`, `focusCenterStar`,
   `focusGalaxySelected`, `focusOwnerStar`, `starWorldPosition`, `resolveStarLocalPosition`,
   `snapshotPickView`). The remaining pure camera-manipulation functions (`animateCameraTo`, `animateDolly`,
   `dollyByNotches`, `zoomIn`/`zoomOut`/`resetView`, `applyCameraAutoRotate`, `toggleAutoRotate`) become a
   separate `useGalaxyCamera` composable that `useGalaxyBuffers` depends on (one-directional:
   Buffers→Camera, not Camera→Buffers) — Camera never needs to reach back into buffer state directly.

2. **Interaction ↔ Buffer-sync/Camera**: `onPointerDown`/`onPointerUp` call `pickIndexWithView`/`pickIndex`
   (needs buffer state) *and* `animateDolly`/`cancelCameraTransition` (Camera) *and* `focusStarByIndex`
   (the merged Buffer-sync+Camera piece from #1) *and* `setHoverIndex` (Selection/HUD). This is inherent —
   interaction is the piece that *drives* every other piece in response to DOM events, so it necessarily
   depends on all of them. That's a fan-out, not a cycle (nothing downstream calls back into Interaction),
   so no merge is needed here — `useGalaxyInteraction` legitimately takes `scene.state`, the merged
   buffers+camera composable's return value, and a `setHoverIndex` callback (or the Selection/HUD piece's
   return value) as its dependencies.

3. **Render ↔ everything**: same fan-out shape as Interaction (reads from all, called by none) — no cycle.

**Net effect on the piece count from §1**: Camera and Buffer-sync merge into one composable
(`useGalaxyBuffers`, ~550 lines of the original 2230) per the plan's explicit fallback instruction. Final
recommended count is 5 composables + the root SFC, not 7.

## 5. Recommended final shape

```text
src/stars/composables/
  useGalaxyScene/
    useGalaxyScene.ts        # initScene, resize, dispose, dust/cosmicSky/materials/shader-source consts
    types.ts                 # GalaxyScrollState-equivalent box type
    index.ts
  useGalaxyBuffers/
    useGalaxyBuffers.ts       # applyBuffers, syncMotionAttributes, syncGasClouds/syncGasDustClouds,
                                # runGalaxyRebuild/rebuildGalaxy, fitCamera, focusStarByIndex/focusCenterStar/
                                # focusGalaxySelected/focusOwnerStar, starWorldPosition, snapshotPickView
    types.ts
    index.ts
  useGalaxyCamera/
    useGalaxyCamera.ts        # animateCameraTo/animateDolly/dollyByNotches, zoomIn/zoomOut/resetView,
                                # applyCameraAutoRotate, toggleAutoRotate, cancelCameraTransition
    index.ts
  useGalaxyInteraction/
    useGalaxyInteraction.ts   # all pointer/wheel/pinch/keyboard handlers + pickIndex/pickIndexWithView
    index.ts
  useGalaxyRenderLoop/
    useGalaxyRenderLoop.ts    # animate, visibility pause/resume, markRender/needsRender
    index.ts
components/
  StarsGalaxyView.vue         # props/emit, containerRef/galaxyRootRef, legendFilter + its 6 toggle
                                # functions (kept inline — ~40 lines, not worth its own composable per
                                # the "don't force a fixed number of pieces" principle), hoveredIndex/
                                # selectedIndex/hoverTip/hoverLabel/syncSelectedIndex/setHoverIndex
                                # (Selection/HUD — kept inline, same reasoning), the 5 watch()s,
                                # onMounted/onUnmounted wiring the 5 composables together, the template
                                # (unchanged from Phase 4a)
```

Each composable's factory function takes the composables it depends on as plain function arguments (not
`provide`/`inject` — there is no separate component tree here, just plain function composition within one
`<script setup>`), e.g.:

```ts
const scene = useGalaxyScene()
const camera = useGalaxyCamera(scene.state)
const buffers = useGalaxyBuffers(scene.state, camera, store)
const interaction = useGalaxyInteraction(scene.state, buffers, camera, {
  onHover: setHoverIndex,   // Selection/HUD stays in the root SFC
  onSelect: (item) => emit('select', item),
})
const renderLoop = useGalaxyRenderLoop(scene.state, camera, buffers)
```

**Template**: no restructuring needed. Every template binding
(`legendItems`/`starTierItems`/`legendFilter`/`hoverLabel`/`hoverTip`/`autoRotate`/`showLegend`/
`showFocusOwnerRepo`/`loadingScene`/`layoutComputing`/`store.galaxyAreaExpanded`/`store.galaxySelected`
and the dozen method calls) either stays a root-SFC-local ref/computed/function (legend-filter and
selection/HUD state, per §5) or becomes a destructured return value from a composable
(`autoRotate` → `camera.autoRotate`, `zoomIn`/`zoomOut`/`resetView`/`toggleAutoRotate` → `camera.zoomIn`
etc., `showFocusOwnerRepo` → `buffers.showFocusOwnerRepo`) — a handful of one-line renames in the
`<template>`, not a structural rewrite. `containerRef`/`galaxyRootRef` stay in the root SFC and get passed
into `scene.initScene(containerRef.value)` since template `ref`s must be declared in the SFC that owns the
template element.

## 6. Testability per piece

| Piece | Testable with `bun test`/`@vue/test-utils`? | Notes |
| --- | --- | --- |
| `useGalaxyScene` | **No** (excluded, like `galaxy/webgl.ts`) | Pure WebGL/Three.js side effects — scene graph construction, renderer creation. Add to `bunfig.stars.toml`'s `coveragePathIgnorePatterns` with the same justification as `galaxy/webgl.ts`. |
| `useGalaxyBuffers` | **Partially** | The orchestration logic (`canUsePrecomputedLayout`, `buildGalaxyBuffersForItems` branching, `runGalaxyRebuild`'s sync-vs-async-via-`setTimeout` branch) is testable by injecting a fake `state` box with mock Three.js objects (same pattern as Phase 2's `buildGalaxyBuffers.test.ts` already does for the pure function it wraps). The actual `THREE.BufferGeometry`/`Points` construction calls are not meaningfully assertable beyond "was called" — acceptable per the plan's WebGL exclusion policy; don't chase 90% here artificially. |
| `useGalaxyCamera` | **Partially** | `animateCameraTo`/`animateDolly` delegate to already-tested `galaxy/camera-transition` and `galaxy/zoom-controls` functions — test that this composable calls them with correct arguments (mock `cameraTransition`/`controls`/`camera`), not the math itself (already covered upstream). |
| `useGalaxyInteraction` | **Partially** | Gesture state machine logic (drag-threshold detection, pinch-vs-single-pointer branching, wheel-notch accumulation) is pure enough to test with synthetic `PointerEvent`/`WheelEvent` objects against a mock `state` box — this is the piece most worth testing since it has the most branching logic and zero WebGL rendering itself. |
| `useGalaxyRenderLoop` | **No** (excluded) | `requestAnimationFrame` + `renderer.render()` — same exclusion class as Scene. The `shouldRender` gating logic (lines computing whether to skip a frame) is arguably unit-testable in isolation, but extracting *that* one boolean expression into its own tested pure function is optional polish, not required for Phase 4b's exit criterion. |
| `StarsGalaxyView.vue` root | **No new tests required** | Thin wiring + template; the plan's exit criterion prioritizes "galaxy-math-adjacent logic and composable-backed components first" — this root is neither, and is exactly the kind of "simple orchestration" the plan says may be left untested if time-boxed. |

## Risks / surprises found while reading

- **The Camera/Buffer-sync coupling in §4 is tighter than the plan's authors likely anticipated** — the
  plan's Phase 4b task description lists "scene setup, camera/zoom controls, picking, HUD overlays" as if
  camera control were cleanly separable from buffer/star data, but `focusStarByIndex`'s dependency on
  `restPositions`/`motionFields` (buffer state) to compute a star's *current animated* world position means
  camera-focus logic cannot be split from buffer state without either the merge in §4 or a second shared
  box passed between two composables (equivalent complexity, more indirection). Recommend the merge.
- **`props.focusId` is read from three different places** (`applyBuffers`'s `syncSelectedIndex(props.focusId)`
  call, the dedicated `watch(() => props.focusId, ...)`, and `focusGalaxySelected`'s fallback to
  `props.focusId` when `store.galaxySelected` is unset) — worth double-checking during implementation that
  all three still resolve correctly once `props` crosses into whichever composable needs it (likely just
  pass `props` itself, or the specific reactive getters, into `useGalaxyBuffers`/`useGalaxyInteraction`).
- **`GALAXY_RUNTIME_LAYOUT_TAG` is imported only to appear in a `watch()` dependency array as a constant**
  (line ~2103) — it never changes at runtime, so it's a no-op dependency. Not a bug to fix now (zero
  behavior change target), but worth a one-line note if anyone re-reviews this file's watchers during the
  split — the effective invalidation is `store.galaxyLayout?.version`/`store.galaxyVirtualIndexMap.size`.
- **`dispose()` touches nearly every closure variable across all five proposed composables** (it's the
  mirror image of `initScene`). Each composable should own disposing its own slice (`useGalaxyScene.dispose`
  disposes renderer/materials/cosmicSky; `useGalaxyBuffers.dispose` disposes points/gas layers;
  `useGalaxyInteraction`/`useGalaxyRenderLoop` clear their own RAF/listener state), and the root SFC's
  `onUnmounted` calls all of them in the same order the current single `dispose()` does — this ordering
  matters (e.g. `resizeObserver?.disconnect()` before renderer disposal, event listener removal before
  `renderer.dispose()`) and should be preserved exactly, not "improved," per the zero-structural-drift-in-
  behavior goal even though this is explicitly the structural (4b) phase.
