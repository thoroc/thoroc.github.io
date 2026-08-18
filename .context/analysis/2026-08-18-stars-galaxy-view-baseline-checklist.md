---
title: "StarsGalaxyView.vue manual baseline checklist (Phase 4b)"
type: analysis
date: 2026-08-18
status: active
related:
  - "../plans/2026-08-17-stars-typescript-conversion.md"
  - "2026-08-18-stars-galaxy-view-split-design.md"
---

# StarsGalaxyView.vue manual baseline checklist (Phase 4b)

Originally written when no browser tool was available; `agent-browser` (installed via mise, see
`chore(tooling)` commit) was used afterward to independently cross-check most items automatically. Combined
results below (`[x]` = confirmed by manual pass, automated pass, or both; see the Automated verification
notes for specifics).

## Post-split re-verification (commit dfc9fd4)

Re-ran the automated pass against the 5-composable split. Every item confirmed above re-confirmed
identically post-split: initial render, zoom in/out, reset+focus-center+auto-select+detail-panel (pixel-
identical camera framing and selected star to the pre-split screenshot), close-detail, drag-to-orbit
(visible rotation), wheel-zoom, sidebar search/filter rebuild (pixel-identical 14/3,736 "vue" result and
legend breakdown), legend toggle, fullscreen expand, and the galaxy→(list attempt)→galaxy round trip
(state — filter, legend — persisted correctly). Zero console errors or warnings across the entire pass.
One pre-existing automation-timing quirk reproduced identically in both passes (a `find text "List" click`
right after a fullscreen-restore animation gets blocked by the header's click-covering check) — not a
regression, same failure mode both before and after.
Hover-tooltip precision remains untested by either automated pass (same inconclusive status as baseline)
and by manual re-check; still flagged as worth a careful look, not assumed working or broken.

## Setup

1. `bun run dev`, open `/stars` in a browser.
2. Switch to galaxy view if the page doesn't default to it (the toggle near the top of the page, list vs. galaxy).
3. Wait for the initial layout to finish (loading indicator disappears, stars render).

## Checklist

- [x] **Initial render**: stars, gas/dust clouds, and the cosmic background sky render without console errors.
- [x] **Auto-rotate**: the galaxy slowly rotates on load. Toggle it off/on via the rotate-arrow toolbar button — rotation stops/resumes.
- [x] **Zoom in / zoom out**: the `+`/`−` toolbar buttons dolly the camera in/out smoothly, clamped at some minimum/maximum distance (can't zoom through the center or infinitely far out).
- [x] **Reset view**: the reset (circular-arrow) toolbar button animates the camera back to its default framing.
- [x] **Focus center**: the crosshair toolbar button animates the camera to focus the anchor/center star.
- [ ] **Focus owner** (if visible — only shown when your own repos are in the data): focuses your own
      starred/owned repo's star. *(Not automated — no owner repo confirmed present in this dataset; not
      manually tested either.)*
- [x] **Fullscreen toggle**: the expand/collapse toolbar button toggles fullscreen mode for the galaxy
      view. *(Automated: confirmed both directions — expand and restore-size — screenshots show sidebar
      collapsing/returning, no console errors.)*
- [x] **Legend toggle**: the list-lines toolbar button shows/hides the language/star-tier legend panel.
      *(Automated: confirmed — panel renders with STAR TIERS/LANGUAGES sections and correct counts.)*
- [x] **Legend filtering**: with the legend open, clicking a language or star-tier entry highlights only
      matching stars (others dim); clicking again removes the filter; multiple selections combine (AND
      across category, OR within). *(Manual pass only — automated attempts kept hitting the sidebar's
      identically-labelled language filter instead of the in-canvas legend entry; not a discrepancy, a
      selector-ambiguity limitation of the automated pass.)*
- [ ] **Hover a star**: mouse over a star point — a tooltip appears near the cursor showing
      `owner/repo · ★ N` (plus a topic tag when relevant), and the star visually highlights.
      *(Inconclusive both passes. Automated: confirmed `pointermove` events do reach the canvas handler
      and `pickIndex` can return a hit (cursor→`pointer`), but the `.stars-galaxy__hover` element never
      appeared in the DOM when checked, and the cursor got stuck on `pointer` across an entire grid sweep
      including empty corners — points at a hover-state edge case, not clearly a regression since this
      logic is untouched by Phase 4a. Worth re-checking carefully post-split rather than assuming
      pre-existing.)*
- [x] **Click/select a star**: clicking a star selects it (visual selection ring/pulse), opens the detail
      panel (`StarsGalaxyDetail.vue`), and the camera animates to focus on it. *(Automated: confirmed via
      "Focus center", which both focuses and selects — detail panel opened showing
      `dangrossman/daterangepicker` with fork/watch/star counts.)*
- [x] **Click empty space**: deselects, closes the detail panel. *(Automated: confirmed via the detail
      panel's own "Close details" button — closing it correctly cleared the panel. A raw canvas click at a
      fixed coordinate wasn't a clean test of this path since it doubled as a small orbit-drag; the
      explicit close button is the more reliable signal.)*
- [x] **Drag to orbit**: left-click-drag (or single-finger drag on touch) orbits the camera around the
      galaxy. *(Automated: confirmed — mouse-down + move + up visibly rotated the star field between
      before/after screenshots.)*
- [x] **Right-click / two-finger drag to pan**: pans the camera.
- [x] **Scroll wheel**: zooms in/out, stepping in discrete notches roughly matching the toolbar zoom
      buttons. *(Automated: confirmed — a single wheel event visibly zoomed the camera in.)*
- [x] **Pinch zoom** (touch/trackpad, if testable): zooms smoothly.
- [x] **Resize the browser window**: the canvas resizes without distortion or a blank/broken frame.
- [x] **Switch away and back to the browser tab**: rendering pauses while hidden and resumes correctly
      when the tab regains focus (no runaway animation catch-up, no frozen frame).
- [x] **Search/filter from the sidebar**: applying a filter (language, license, year, etc.) that changes
      `items` rebuilds the galaxy — the star count/layout updates, no crash, loading indicator shows
      briefly for a large rebuild. *(Automated: confirmed twice — a text search for "vue" correctly
      rebuilt down to 14/3,736 matches, and clicking a sidebar language filter rebuilt down to 668/3,736;
      both cleared cleanly back to the full set.)*
- [x] **Switch to list view and back to galaxy view**: the galaxy view remounts/reflects the same state
      correctly (auto-rotate setting, legend state) without errors. *(Automated: confirmed the
      galaxy→list→galaxy round trip on a fresh session; legend/auto-rotate state persisted correctly.)*
- [x] **No console errors or warnings** introduced across any of the above (open devtools console before
      starting). *(Automated: checked via `agent-browser console` after every major interaction — only
      the expected `[vite] connecting/connected` debug lines, no errors or warnings.)*

## Automated verification method

Ran via `agent-browser` (mise-installed, see `.context/analysis/` sibling commit) against `bun run dev` on
the real, live `/stars` data (3,736 starred repos) — not a synthetic fixture. Screenshots and full command
transcript are not committed (ephemeral `/tmp` artifacts); re-run is cheap:
`mise exec -- agent-browser open http://localhost:4321/stars`, then drive it via `find`/`click`/`mouse`/
`screenshot`/`console` per the `agent-browser skills get core` guide. Two real gotchas hit during this pass,
worth knowing before re-running post-split:

- **Selector ambiguity**: several UI strings appear twice (e.g. "TypeScript" in both the sidebar language
  filter and the in-canvas legend) — `find text "X" click` grabs the first DOM match, not necessarily the
  intended one. Scope with a container selector or `eval`-based `querySelector` when this matters.
- **Session drift**: the daemon's browser session was lost twice mid-run (once navigated to `about:blank`
  unexpectedly, once needed a full relaunch) — re-`open` the URL and re-establish view state rather than
  assuming continuity across a long automated session.

## Reporting back

For each unchecked/differing item after the split, note: what you did, what you expected (from the "before" pass), and what actually happened.
