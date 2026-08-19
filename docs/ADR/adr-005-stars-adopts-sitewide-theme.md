---
title: "ADR-005: /stars adopts the sitewide page shell and retro design tokens"
status: accepted
date: 2026-08-19
context:
  - path: docs/ADR/adr-004-stars-theme-stays-separate.md
  - path: .context/plans/2026-08-19-supersede-adr-004-stars-landing-alignment.md
---

**Status:** Proposed
**Date:** 2026-08-19

## Context

ADR-004 deliberately kept `/stars` structurally separate from the sitewide
retro-70s design system introduced in ADR-001/ADR-002: its own bare
`<html>/<head>`, its own dark "galaxy" theme toggle
(`data-stars-theme`/`stars-color-theme`), and its own ~30-variable
GitHub-style color palette in `src/stars/styles/app.css`. That ADR
explicitly left "whether `/stars` should ever adopt `tokens.css`" open for
a future decision.

`/stars` reading as a bolted-on separate app — different fonts, different
favicon, no shared navigation, a second independent theme toggle — was
raised as something to fix. Investigating what "align /stars with the
landing page" would require surfaced a further gap: the landing page had no
runtime theme toggle at all (dark mode there was `prefers-color-scheme`
only), while `/stars` had a two-button light/dark toggle with no way to
return to "system" once changed. Aligning the two theme systems therefore
also meant deciding what the unified toggle's behavior should be, not just
which CSS variables to share.

## Decision

`/stars` is fully unified with the rest of the site:

- `/stars/index.astro` renders through a new `StarsLayout.astro`, which
  wraps the sitewide `BaseLayout.astro` (adding `/stars`-specific `<head>`
  content — GitHub avatar preconnect, `stars.json` preload — via a named
  `head` slot on `BaseLayout`). It no longer renders its own bare
  `<html>/<head>`, gains the shared `SiteHeader`/footer, the sitewide
  Fraunces/Space Grotesk fonts, and the sitewide favicon (dropping its
  previous distinct `/stars/favicon.svg`).
- The theme system is unified into one sitewide, three-state
  (light/dark/system) toggle, rendered in `SiteHeader.astro` on every page.
  The color-theme preference/resolution/persistence logic moved from
  `src/stars/theme/color-theme/` to `src/lib/theme/color-theme/`, with the
  storage key and `<html>` dataset attribute generalized
  (`stars-color-theme` → `color-theme`, `data-stars-theme` → `data-theme`).
  A one-time migration adopts a valid existing `stars-color-theme`
  preference under the new key. `useStarsTheme` (the Vue composable whose
  only consumer was `/stars`'s own two-button toggle) was deleted outright,
  not retained or simplified, once that toggle UI was replaced.
  `src/stars/styles/app.css`'s ~30 `--stars-c-*` variables are now defined
  in terms of `tokens.css`'s tokens (`--bg`, `--fg`, `--muted`, `--accent`,
  `--border`, `--card-bg`, plus a new `--danger` token added to
  `tokens.css` itself) rather than their own hardcoded GitHub-palette hex
  values — the ~2,400 lines of rules that consume `--stars-c-*` were left
  untouched, only the `:root` variable-definition sites changed.

Explicitly out of scope: the galaxy WebGL canvas's own rendering colors, and
restructuring `/stars`'s dense GitHub-style information architecture
(sidebar filters, star cards, nav search) into the retro-70s layout
language — only the color/font *tokens* those components pull from were
unified, not their structure or density.

## Consequences

- ADR-004's structural claim — "`/stars` renders its own bare
  `<html>/<head>`, never imports `BaseLayout`/`global.css`/`tokens.css`" —
  is no longer true. Anyone touching `tokens.css` now needs to consider
  `/stars` as a consumer, not an exempt surface.
- `/stars` no longer has a private theme mechanism to reason about
  separately: `data-theme` and one persisted preference key drive both the
  landing page and `/stars`. A future change to the toggle only needs to
  happen once, in `SiteHeader.astro` and `src/lib/theme/color-theme/`.
- `/stars`'s color identity changed (e.g. its link color moved from GitHub
  blue to the site's orange accent) as a deliberate consequence of sharing
  a 12-token palette instead of a 30-variable one — some of the
  compression this implies was accepted rather than preserving GitHub-style
  distinctions that `tokens.css` has no equivalent slot for.
- `/stars` still has its own internal UI-language toggle (`zh-CN`/`en`,
  ported from the upstream tool it was based on), unrelated to this
  decision's `en`/`fr` site-locale toggle — tracked separately as a
  follow-up (`.context/follow-ups/2026-08-19-stars-locale-zh-to-fr.md`),
  not resolved by this ADR.
