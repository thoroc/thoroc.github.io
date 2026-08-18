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

No browser/screenshot tool is available in this environment, so this checklist substitutes for the plan's
screenshot baseline. Run it against `bun run dev` → `/stars` (galaxy view) **before** the composable split
starts, and again **after**, comparing behaviour item-by-item. Report back anything that differs.

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
- [ ] **Focus owner** (if visible — only shown when your own repos are in the data): focuses your own starred/owned repo's star.
- [x] **Fullscreen toggle**: the expand/collapse toolbar button toggles fullscreen mode for the galaxy view.
- [x] **Legend toggle**: the list-lines toolbar button shows/hides the language/star-tier legend panel.
- [x] **Legend filtering**: with the legend open, clicking a language or star-tier entry highlights only
      matching stars (others dim); clicking again removes the filter; multiple selections combine (AND
      across category, OR within).
- [ ] **Hover a star**: mouse over a star point — a tooltip appears near the cursor showing `owner/repo · ★ N` (plus a topic tag when relevant), and the star visually highlights.
- [x] **Click/select a star**: clicking a star selects it (visual selection ring/pulse), opens the detail panel (`StarsGalaxyDetail.vue`), and the camera animates to focus on it.
- [ ] **Click empty space**: deselects, closes the detail panel.
- [ ] **Drag to orbit**: left-click-drag (or single-finger drag on touch) orbits the camera around the galaxy.
- [x] **Right-click / two-finger drag to pan**: pans the camera.
- [ ] **Scroll wheel**: zooms in/out, stepping in discrete notches roughly matching the toolbar zoom buttons.
- [x] **Pinch zoom** (touch/trackpad, if testable): zooms smoothly.
- [x] **Resize the browser window**: the canvas resizes without distortion or a blank/broken frame.
- [x] **Switch away and back to the browser tab**: rendering pauses while hidden and resumes correctly when the tab regains focus (no runaway animation catch-up, no frozen frame).
- [ ] **Search/filter from the sidebar**: applying a filter (language, license, year, etc.) that changes
      `items` rebuilds the galaxy — the star count/layout updates, no crash, loading indicator shows
      briefly for a large rebuild.
- [x] **Switch to list view and back to galaxy view**: the galaxy view remounts/reflects the same state correctly (auto-rotate setting, legend state) without errors.
- [x] **No console errors or warnings** introduced across any of the above (open devtools console before starting).

## Reporting back

For each unchecked/differing item after the split, note: what you did, what you expected (from the "before" pass), and what actually happened.
