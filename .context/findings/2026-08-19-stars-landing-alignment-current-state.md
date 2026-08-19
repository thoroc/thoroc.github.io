---
title: "Finding: current state of /stars vs landing page, ahead of superseding ADR-004"
type: finding
status: active
date: 2026-08-19
related:
  - ../plans/2026-08-19-retro-design-system.md
---

# Finding: current state of /stars vs landing page, ahead of superseding ADR-004

> /stars is a structurally separate Vue SPA with its own page shell, fonts, and
> a GitHub-style ~30-variable theme system; the landing page runs a retro-70s
> shared component library on 12 tokens via `BaseLayout.astro`. Full unification
> means merging the page shell and re-deriving the GitHub-style variables from
> the retro tokens, not a find-and-replace.

## Summary

The user wants to supersede ADR-004 ("`/stars` keeps its own theme system,
separate from sitewide tokens") and fully unify `/stars` with the landing
page: same `BaseLayout`, same `tokens.css`/`global.css`, same `SiteHeader`
and footer, same fonts, and the sitewide `data-theme` toggle in place of the
stars-only one. The galaxy canvas itself may stay visually distinct (it's a
3D scene, not a themed UI surface).

## Detail

**Landing page** (`src/pages/[lang]/index.astro`):
- Renders through `src/layouts/BaseLayout.astro`, which owns the `<html>`
  shell, loads `../styles/global.css`, sets `<title>` via i18n, links
  Google Fonts (Fraunces + Space Grotesk), renders `SiteHeader.astro`, a
  `<main><slot /></main>`, and a `.site-footer`.
- Theming: `src/styles/tokens.css` defines ~12 CSS custom properties on
  `:root` (`--bg`, `--bg-alt`, `--fg`, `--muted`, `--accent`,
  `--accent-strong`, `--accent-2/3/4`, `--border`, `--card-bg`,
  `--shadow-color`, `--radius*`, `--font-display`, `--font-body`), redefined
  under `@media (prefers-color-scheme: dark)` and `:root[data-theme="dark"]`.
  No JS-driven persisted preference read in this file (see ADR-001 for the
  toggle mechanism elsewhere).

**`/stars` page** (`src/pages/stars/index.astro`):
- Hand-rolled `<!doctype html><html>` — does **not** import `BaseLayout`,
  `global.css`, or `tokens.css` (this is the exact structural fact ADR-004
  relies on to claim the two theme systems "cannot collide").
  Own favicon, own preconnect/preload hints, an inline `<script is:inline>`
  that reads `localStorage['stars-color-theme']` and sets
  `document.documentElement.dataset.starsTheme` before paint (FOUC guard).
  Mounts `<StarsApp client:only="vue" />` and a single hardcoded
  `.stars-back-link` back to `/`.
- Theme system lives in `src/stars/theme/color-theme/` (`applyColorTheme`,
  `readColorThemePreference`, `resolveColorTheme`,
  `persistColorThemePreference`, `constants.ts` with
  `STARS_COLOR_THEME_KEY = 'stars-color-theme'`) plus the
  `useStarsTheme` composable (`src/stars/composables/useStarsTheme/`) that
  wires it to Vue reactivity and a `prefers-color-scheme` media listener.
  `applyColorTheme` sets `document.documentElement.dataset.starsTheme`,
  serialising to `data-stars-theme` — a distinct attribute from
  `tokens.css`'s `data-theme`.
- Visual system: `src/stars/styles/app.css` is **2,498 lines** and defines
  its own ~30-variable GitHub-style palette on `:root` and
  `:root[data-stars-theme="dark"]`: `--stars-c-bg`, `--stars-c-surface`,
  `--stars-c-bg-soft`, `--stars-c-bg-alt`, `--stars-c-text-1/2/3`,
  `--stars-c-divider`, `--stars-c-brand-1/2`, `--stars-c-brand-soft`,
  `--stars-c-muted-surface`, `--stars-c-accent`, `--stars-c-star-bg`,
  `--stars-c-star-border`, `--stars-c-danger-1`, `--stars-header-bg`,
  `--stars-scrollbar-thumb*`, plus layout vars (`--stars-nav-height`,
  `--stars-sidebar-width`, `--stars-chrome-offset`), radii, shadows, and its
  own `--stars-font` stack (not Fraunces/Space Grotesk). Hundreds of rules
  throughout the file consume these `--stars-*` variables directly (nav,
  sidebar, cards, filters); the galaxy WebGL canvas colors are driven
  separately by `src/stars/galaxy/colors.ts` (not audited in this pass).

**Test coverage**: `useStarsTheme.test.ts` and five `color-theme/*.test.ts`
files exist and assert against `localStorage['stars-color-theme']` and
`dataset.starsTheme` — any change to the persistence key or the dataset
attribute touches these tests directly.

**ADR-004** (`docs/ADR/adr-004-stars-theme-stays-separate.md`, status
`accepted`) frames the separation as structurally enforced by the missing
`BaseLayout`/`global.css`/`tokens.css` imports, and explicitly leaves
"whether `/stars` should ever adopt `tokens.css`" as an open question for a
future decision — this is that future decision.

## Recommended Action

Treat "full unification" as two layers, both required, but separable in
implementation and risk:

1. **Page shell**: `/stars/index.astro` moves onto `BaseLayout` (or a
   `/stars`-specific variant of it), gaining `SiteHeader`/footer, favicon,
   fonts, and `global.css`/`tokens.css`. Removes the hand-rolled
   `<html>/<head>` and the ad hoc `.stars-back-link`.
2. **Theme system**: retire `stars-color-theme` /
   `data-stars-theme` / `useStarsTheme` in favour of the sitewide
   `data-theme` mechanism (whatever ADR-001 established as the toggle of
   record), and re-derive every `--stars-c-*` variable in `app.css` from
   `tokens.css`'s ~12 tokens (a semantic mapping — e.g.
   `--stars-c-bg` → `--bg-alt`, `--stars-c-surface` → `--card-bg`,
   `--stars-c-text-1` → `--fg`, `--stars-c-text-2/3` → `--muted`,
   `--stars-c-divider` → `--border`, `--stars-c-brand-1/2` →
   `--accent`/`--accent-strong`, `--stars-font` → `--font-body`/
   `--font-display`) rather than rewriting all ~2,500 lines of consuming
   rules. This keeps the diff bounded to the `:root` variable-definition
   blocks plus the removed theme-toggle plumbing, instead of touching every
   rule that already consumes `--stars-c-*`.

**Critical asymmetry**: the landing page has **no runtime theme toggle at
all**. `SiteHeader.astro` (`src/components/ui/SiteHeader.astro`) renders only
a site title, nav links, and a language switch — no theme button, no
persisted-preference script anywhere in `src/` outside `src/stars/`.
`tokens.css`'s `:root[data-theme="dark"]` selector is dead code today:
nothing sets `data-theme` on `<html>`; dark mode on the landing page is
`prefers-color-scheme` only. `/stars`, by contrast, ships a real light/dark
toggle with persisted user preference. "Align the theme systems" therefore
is not a like-for-like swap — it has to decide whether `/stars` loses its
user-facing toggle (regression), or the toggle becomes sitewide (scope
growth beyond the stated ask), or the toggle stays `/stars`-only but wired
to the shared `data-theme` attribute name so it also flips `tokens.css`'s
dormant dark-mode block wherever `/stars`'s BaseLayout-derived shell needs
it. This is the single highest-leverage open question for plan-review.

Open questions for the plan/review step:
- **Theme toggle scope** (see asymmetry above): keep the toggle
  `/stars`-only (driving the shared `data-theme` attribute), add it
  sitewide, or drop it to `prefers-color-scheme`-only like the rest of the
  site?
- Does whatever toggle mechanism is chosen support being driven from a Vue
  SPA mounted with `client:only`, or does it assume Astro-rendered pages
  only?
- Should the `--stars-c-*` variable *names* be kept (as an alias layer) or
  renamed to the sitewide tokens directly? Keeping the alias layer is lower
  risk but leaves two naming systems around.
- What happens to `useStarsTheme.test.ts` and the five `color-theme/*.test.ts`
  files — deleted (if the composable is deleted) or rewritten against
  whatever the new toggle mechanism is?
- Should `docs/ADR/adr-004-*.md` be marked `status: superseded` in place, or
  left as-is with only the index/new ADR cross-referencing it? (Existing
  ADR-writing convention in this repo should be checked via `adr-capture`.)
