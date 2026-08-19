---
title: "ADR-004: /stars keeps its own theme system, separate from sitewide tokens"
status: proposed
date: 2026-08-19
context:
  - path: .context/plans/2026-08-19-retro-design-system.md
---

**Status:** Proposed
**Date:** 2026-08-19

## Context

`/stars` is a Vue 3 SPA (`src/pages/stars/index.astro` + `src/stars/**`)
mounted with `client:only="vue"`, ported from a separate `thoroc/stars`
repo. It has its own dark "galaxy" theme, its own theme-toggle composable
(`useStarsTheme`), and its own test suite. When the sitewide retro design
tokens (ADR-001) were introduced, the obvious question was whether `/stars`
should be restyled to match, or migrated onto the same token file.

## Decision

`/stars` is explicitly out of scope for the sitewide retro design system.
Its theme system stays as-is. This is structurally safe, not just a stated
intention: `src/pages/stars/index.astro` renders its own bare
`<html>/<head>` and never imports `BaseLayout.astro`, `global.css`, or
`tokens.css`; its theme toggle sets
`document.documentElement.dataset.starsTheme`, which serialises to a
`data-stars-theme` attribute — distinct from `tokens.css`'s `data-theme`
selector — so the two theme systems cannot collide even though both act on
the same `<html>` element.

Whether `/stars` should ever adopt `tokens.css`, or remain a deliberately
distinct "app-like" surface permanently, is left open — see the source
plan's Open Questions.

## Consequences

- The sitewide chrome work (ADR-001, ADR-002) can proceed without touching
  `/stars`'s markup, styles, or test suite at all.
- `/stars` keeps its own dark galaxy aesthetic indefinitely unless a future
  decision explicitly unifies it — this ADR does not resolve that question,
  it only records that unifying it was considered and deferred, so a future
  agent doesn't need to re-derive whether the separation was deliberate.
- Anyone touching `global.css` or `tokens.css` in the future does not need
  to check `/stars` for breakage on that account — the import boundary
  already prevents it structurally.
