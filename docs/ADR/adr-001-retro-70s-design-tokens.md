---
title: "ADR-001: Retro 70s design tokens as the site's visual identity"
status: accepted
date: 2026-08-19
context:
  - path: .context/plans/2026-08-19-retro-design-system.md
---

**Status:** Proposed
**Date:** 2026-08-19

## Context

The site's landing page and project card grid used a plain, light-only
palette with no shared token source — colours were declared once in
`src/styles/global.css`'s `:root` block and never revisited. The site owner
found this unappealing and asked for a unified visual style that every
current and future page (including subsections ported in from other
projects) could draw from, rather than continuing to style each page
ad hoc.

## Decision

Adopt a retro 1970s visual identity, defined as CSS custom properties in
`src/styles/tokens.css`, as the site's single design-token source:

- Palette derived directly from a reference image the site owner
  supplied — a sunburst-stripe poster (coral → orange → mustard → teal →
  navy stripes on warm peach-cream) — rather than an invented palette:
  `--bg`/`--fg`/`--accent`/`--accent-2`/`--accent-3`/`--accent-4`/
  `--card-bg`/`--muted`/`--border`/`--bg-alt`/`--shadow-color`, each with a
  light and dark value.
- Typography: `Fraunces` (variable serif) for display/headings, `Space
  Grotesk` (geometric sans) for body/UI text, loaded via Google Fonts with
  the request scoped to the weights/axes actually used
  (`Fraunces:opsz,wght@9..144,600;9..144,900`, `Space+Grotesk:wght@400;500;
  600;700`, both `&display=swap`).
- Dark mode follows the pattern: base tokens on bare `:root`, overridden
  under `@media (prefers-color-scheme: dark)` guarded by
  `:root:not([data-theme="light"])`, and again under
  `:root[data-theme="dark"]` so an explicit toggle (if one is added later)
  wins either direction.

This governs the sitewide Astro chrome (landing page, project cards,
project detail pages). It explicitly does not extend to `/stars`, a
separately themed Vue subsection — see ADR-004.

## Consequences

- Every future page built on `BaseLayout.astro` inherits one coherent
  palette and type system instead of hand-picked colours per page.
- Strong, saturated accent colours (coral/orange/mustard/teal) carry a real
  contrast risk if ever used for body text rather than accents/badges/links
  — WCAG AA thresholds (4.5:1 normal text, 3:1 large text/non-text UI) must
  be checked whenever a new token pairing is introduced, not assumed safe
  by eye.
- A visual-identity change this size is easy to under-scope quietly (some
  page or component keeps referencing the old flat hex values). Any future
  change to `tokens.css` should be paired with a check that no component
  still hard-codes the retired values.
