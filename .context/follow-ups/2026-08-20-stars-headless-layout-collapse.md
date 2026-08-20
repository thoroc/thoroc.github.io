---
title: "Follow-up: /stars renders with a collapsed near-zero-height layout in headless Chromium"
type: follow-up
status: active
date: 2026-08-20
related:
  - ../plans/2026-08-20-stars-locale-zh-to-fr.md
---

# Follow-up: `/stars` renders with a collapsed near-zero-height layout in headless Chromium

## Context

Surfaced during Phase 4 manual verification of `.context/plans/2026-08-20-stars-locale-zh-to-fr.md` (the
zh-CN→fr locale swap), while trying to screenshot the galaxy view to confirm the collation fix visually.

Screenshotting `/stars` in headless Chromium (via `agent-browser`) shows the page header and a thin,
collapsed strip of the filters sidebar, then a large empty area — the main content region renders at
near-zero height. This is **not** a DOM/data problem: `agent-browser read` (a DOM text extraction, not a
screenshot) confirms the correct content is present at every level (filters, stats, language list, French
translations) — only the *visual* layout collapses.

Reproduced with:
- Real data (a hand-crafted `stars.json` fixture).
- No data at all (the natural `HTTP 404` empty/error state) — same broken layout.
- Across two different browser viewport sizes (1400×900 and 1400×2000).

Ruled out:
- Not caused by this session's code changes — none of the zh-CN→fr swap's edits touch CSS, layout, or
  `app.css`; the same collapse reproduces with zero repos loaded, before any of that code runs.
- Not a site-wide dev-server issue — the landing page (`/`) at the same dev server renders correctly in the
  same screenshot tool, same viewport, same session.
- `app.css` itself returns `200` when fetched directly.

## Outstanding Work

- Reproduce with a plain `curl`/browser (not headless-only) to confirm whether this is specific to headless
  Chromium rendering or a genuine CSS bug that also shows in a normal browser.
- If genuine: bisect which CSS rule/selector in `src/stars/styles/app.css` (or a shared token file it
  depends on) fails to compute a non-zero height for the app's main content container.
- If headless-only: note it as a known `agent-browser`/headless-Chromium limitation for this page, so future
  sessions don't re-spend time chasing it as a code regression.

## Action

Set `status: done` in this file (do not delete it) once the root cause is identified either way.
