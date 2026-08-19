---
title: "ADR-002: Shared Astro component library over Tailwind or per-page CSS"
status: proposed
date: 2026-08-19
context:
  - path: .context/plans/2026-08-19-retro-design-system.md
---

**Status:** Proposed
**Date:** 2026-08-19

## Context

Applying the new design tokens (ADR-001) to the site chrome required
deciding how shared UI pieces — buttons, tag badges, the site header — get
reused across pages. Two alternatives were considered: adopting Tailwind
CSS as a utility-class layer, or continuing to restyle each page's markup
ad hoc against the new tokens with no shared components at all.

A plan-review pass (3 independent reviewers) also flagged that a
"component library" consisting only of a button and a badge still left the
header/nav as copy-pasted markup — the piece most likely to be needed again
by a future page or an imported subsection.

## Decision

Build a small shared component library under `src/components/ui/`,
consuming the CSS custom properties from `tokens.css` directly, rather than
adopting Tailwind:

- `Button.astro` (primary/ghost variants, explicit hover/focus-visible/
  active states, hard offset-shadow retro style)
- `Badge.astro` (solid-fill tag chip)
- `SiteHeader.astro` (site title, nav links, lang switch — replacing the
  markup previously inline in `BaseLayout.astro`)

Tailwind was rejected as a disproportionate build-tooling change for the
value delivered by this pass. Hero and footer markup stay inline in
`BaseLayout.astro` for now — each is single-instance with no current
duplication for a component to eliminate; componentising them is deferred
until a second page actually needs its own hero/footer.

## Consequences

- Future pages that need a button, tag, or header reuse an existing
  component instead of re-deriving the same CSS from tokens each time —
  this is the mechanism that makes ADR-001's tokens actually load-bearing
  sitewide, not just a colour swap.
- No Tailwind build step, config, or class-migration cost was taken on.
- The library is intentionally small; if it grows, revisit whether it
  needs a barrel export, a documented usage convention, or component-level
  tests (see ADR-003) — none of that exists yet because three components
  didn't justify it.
- Hero/footer staying uncomponentised is a known gap, not an oversight: if
  a second page needs its own hero or footer, that's the trigger to
  componentise them, not a speculative build now.
