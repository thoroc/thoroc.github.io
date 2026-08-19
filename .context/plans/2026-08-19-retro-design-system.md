---
title: "Plan: Retro 70s design system and shared component library for the site chrome"
type: plan
status: draft
date: 2026-08-19
effort: "M"
value: "MEDIUM"
themes:
  - TOOLING
---

## Goal

Replace the current plain, light-only landing page and card grid with a
retro-1970s visual identity — a warm, high-contrast palette and a small
shared component library — so that every page this site builds going
forward draws from one design token source instead of ad-hoc CSS per page.
(`/stars` is explicitly excluded from this — see Scope — so it is not part
of what "every page" means for this plan.)

This plan covers the **sitewide Astro chrome only**: the landing page, the
project card grid, and the project detail pages. It deliberately does not
touch `/stars`' own theme system.

## Decisions

### Visual direction

**Decision:** Retro 70s aesthetic with very strong accent colours, confirmed
directly by the user (over a dark "match the galaxy view" option and a
neutral light-editorial option). The palette was then re-derived from a
reference image the user supplied — a classic 70s sunburst-stripe poster
(coral → orange → mustard → teal → navy stripes on warm peach-cream) —
rather than picked from scratch.

Palette (`src/styles/tokens.css`, already created):

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--bg` | `#f6e2c9` | `#1b2a33` | page background (warm peach-cream / deep navy) |
| `--fg` | `#1b3a4b` | `#f6e2c9` | body text (deep navy stripe / cream) |
| `--accent` | `#e2543a` | `#ef6b52` | primary — coral/red-orange stripe |
| `--accent-2` | `#e8862e` | `#f2984a` | secondary — orange stripe |
| `--accent-3` | `#e8ac3d` | `#f0c15a` | tertiary — mustard stripe |
| `--accent-4` | `#1c7f73` | `#2ea393` | quaternary — teal stripe |
| `--card-bg` | `#fdf3e7` | `#22333d` | card/surface background |
| `--muted` | `#5b727d` | `#cbb89a` | secondary/muted text |
| `--border` | `#e3c9a8` | `#3a4f59` | card and rule borders |
| `--bg-alt` | `#eed3ac` | `#22333d` | secondary background band |
| `--shadow-color` | `#1b3a4b` | `#000000` | offset-shadow colour for the retro button/card style |

(The first review pass of this plan omitted these four from the table, which
read as if `tokens.css` was missing them — it isn't; all eleven tokens above
were defined in the same file from the start. Listed in full here so the
Phase 1 cutover task below has something concrete to map every old
`global.css` variable onto.)

Dark mode follows the artifact-style pattern: base tokens on bare `:root`,
overridden under `@media (prefers-color-scheme: dark)` guarded by
`:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`
so an explicit toggle wins either direction. No toggle UI exists yet — see
Open Questions.

Typography: `--font-display: Fraunces` (variable serif, warm/retro,
album-cover feel) for headings; `--font-body: Space Grotesk` (geometric
sans) for body and UI text. Both loaded via Google Fonts `<link>` tags in
`BaseLayout.astro`, with system-font fallback stacks already in the token
values. **Weight/axis scope (closes a gap the technical and risk reviewers
both flagged — "font subsetting" was a risk mitigation with no concrete
spec):** request only `Fraunces:opsz,wght@9..144,600;9..144,900` (roman —
no italic axis needed, this plan uses no italic text) for display headings,
and `Space+Grotesk:wght@400;500;600;700` for body/UI, both with
`&display=swap` to avoid a flash-of-invisible-text CLS hit while the font
downloads.

### Implementation approach

**Decision:** Small shared component library under `src/components/ui/`
(`Button.astro`, `Badge.astro`, `SiteHeader.astro`), consuming the CSS
custom properties in `tokens.css`, rather than adopting Tailwind or
restyling each page's markup ad hoc. The user was open to suggestion and
leaned toward a component library; Tailwind was rejected as too large a
build-tooling change for the value delivered right now. Recorded durably in
`docs/ADR/adr-002-shared-astro-component-library.md`.

**Tailwind reconsidered, reaffirmed (new context: ~5 pages planned soon):**
the user is considering adding up to five more pages soon, each with a
shared topbar and shared form controls (button, textfield, dropdown,
select) plus page-specific content. ADR-002's conclusion stands unchanged
— more upcoming pages argues for widening the *same* component library,
not switching to Tailwind — so no new or superseding ADR was created.

**Building the form controls (`TextField`/`Select`/`Dropdown`) now was
considered and rejected, twice.** First pass: widen Phase 2 to include them
speculatively, ahead of the 5 pages. A re-review with 3 independent
reviewers unanimously pushed back — Technical flagged `Dropdown` as
under-specified to the point of being unbuildable (no interaction model, no
ARIA contract) and the effort estimate no longer fitting "M"; Strategic
called it a scope violation (`rule-of-three` fires on *observed* repetition
in existing code, not a verbal forecast of unscoped pages, and `Dropdown`
as a "future action/filter menu" was an invented use case — the user said
"dropdown, select," not two distinct widget types) and noted the plan's own
Risks section already half-admitted the component shapes could be wrong;
Risk flagged that their API is being guessed with no real consumer to
correct it. Put back to the user directly: cut all three. They stay out of
this plan; building them is deferred to a follow-up plan once the 5 pages
are actually scoped (routing, content model, layout, real form-control
requirements) — see Open Questions.

**Component scope, revised after plan review:** the strategic reviewer
noted that a "component library" consisting only of `Button`/`Badge` still
leaves the header/nav (the piece most likely to be copy-pasted onto a
future page or an imported subsection) as raw CSS in `global.css` — token
reuse without component reuse. Put to the user directly: widen Phase 2/3 to
include a `SiteHeader.astro` component (site title, nav links, lang switch
— currently `BaseLayout.astro`'s inline header markup) alongside
`Button`/`Badge`. Hero and footer remain plain markup in `BaseLayout.astro`
for this pass — they're single-instance (one hero, one footer, no
per-project repetition), so there's no current duplication for a component
to eliminate; revisit only if a second page needs its own hero/footer.

**Test tooling for the new components:** no automated component-test
infrastructure is introduced for `Button`/`Badge`/`SiteHeader`. They are
verified by the Phase 2/3 manual dev-server checks already in this plan.
This repo's ≥90% coverage rule (`typescript-standards.md`) applies to `.ts`
modules, not `.astro` templates, so this isn't a convention violation — it's
a deliberate scope call given three small presentational components. If the
`src/components/ui/` library grows further, add test tooling then rather
than now.

**Rollout strategy:** no canary/staged rollout or feature flag is used. This
is a static personal portfolio site with a single maintainer and no
concurrent editors; a bad Phase 3 change is a `git revert` away. The Risk
reviewer raised staged rollout as an option — declined as disproportionate
process overhead for this site's actual blast radius.

**Branching:** one feature branch (`feat/retro-design-system`) per this
repo's `ways-of-working.md` convention, with one commit per phase (3 phases
→ 3 commits), landed as a single PR rather than one PR per phase — the
prior TypeScript-conversion plan's "one PR per phase" was sized for an L
effort spanning ~250 files; this M-effort, ~8-file plan doesn't need that
much isolation.

**Google Fonts and data protection:** loading Fraunces/Space Grotesk from
Google's CDN sends visitor IPs to Google, same as any third-party font host.
This site is `thoroc`'s personal portfolio, not a Postcode Lottery Group
system — it processes no participant data and isn't in scope of PLG's
GDPR/Article 9 posture. Noted here only so a future reader of this context
file doesn't need to re-derive that.

### Scope: `/stars` is explicitly deferred

**Decision:** `/stars` (`src/pages/stars/index.astro` + `src/stars/**`) is a
separate Vue 3 SPA mounted with `client:only="vue"`, with its own dark
galaxy theme (`src/stars/composables/useStarsTheme`,
`src/stars/theme/color-theme`) and its own test suite. This plan does not
touch it. Whether/how to unify its theme with `tokens.css` is a follow-up
decision for the user to make separately — see Open Questions.

**Isolation is structural, not just intended** (verified during plan review,
in response to the risk reviewer asking whether `/stars` could inherit
chrome-wide changes by accident): `src/pages/stars/index.astro` renders its
own bare `<html>/<head>` and never imports `BaseLayout.astro` or
`global.css`/`tokens.css`. Its theme toggle sets
`document.documentElement.dataset.starsTheme`, which serialises to a
`data-stars-theme` attribute — a different attribute from `tokens.css`'s
`data-theme` selector, so the two theme systems cannot collide even though
both ultimately set a dataset property on the same `<html>` element. No
code change is needed to guarantee this; it was already true before this
plan and this plan doesn't alter it.

## Scope

### In scope

- `src/styles/tokens.css` — retro design tokens (done).
- `src/styles/global.css` — rewritten to consume the tokens and restyle
  hero, nav, footer, and existing card/tag/link classes.
- `src/layouts/BaseLayout.astro` — Google Fonts `<link>` tags in `<head>`,
  header markup replaced with `<SiteHeader>`.
- `src/components/ui/Button.astro`, `src/components/ui/Badge.astro`,
  `src/components/ui/SiteHeader.astro` — new shared components, imported
  directly by path (`import Button from '.../ui/Button.astro'`), matching
  this repo's existing convention for `.astro` components (`ProjectCard.astro`
  has never been barrel-exported either). **No `index.ts` barrel:** one was
  added, then removed — `aislop`'s TypeScript check cannot resolve a
  `.astro`-extension import re-exported through a plain `.ts` file (`TS2307:
  Cannot find module './Button.astro'`), even though `astro check` resolves
  the same import fine when it's inside another `.astro` file. This repo's
  barrel-module convention was written for `.ts` modules; it doesn't extend
  cleanly to `.astro` components, and no existing component in this repo
  was barrelled that way either.
- `src/components/ProjectCard.astro` — refactored to use `Button`/`Badge`.
- `src/pages/[lang]/projects/[slug].astro` — same tag/link markup refactored
  for consistency with the card.

### Out of scope

- `src/pages/stars/index.astro` and everything under `src/stars/` — kept as
  the separate dark galaxy theme it already is.
- Any Tailwind or build-tooling migration (reconsidered once more given the
  ~5 upcoming pages, reaffirmed — see Decisions).
- `TextField`/`Select`/`Dropdown` and any other form controls — considered
  for this plan, cut after unanimous re-review pushback; deferred to a
  follow-up plan once the 5 upcoming pages are actually scoped.
- A user-facing light/dark theme toggle for the main site chrome (currently
  follows OS preference only, same as before this plan).

## Phases

### Phase 1: Tokens and fonts

- [x] Create `src/styles/tokens.css` with the retro palette and font
      variables (light + dark).
- [x] Wire `@import` of `tokens.css` into `src/styles/global.css`, **and
      delete** the pre-existing flat `:root` block in `global.css`
      (`--bg`, `--fg`, `--muted`, `--accent`, `--accent-2`, `--accent-3`,
      `--border`, `--card-bg`, `--radius`, `--maxw`) so there is exactly one
      source of truth for every token — leaving both in place would let
      `global.css`'s later declaration silently win over the `@import`ed
      values, defeating this phase's exit criterion. `--radius`/`--maxw`
      have direct equivalents already in `tokens.css`; everything else maps
      1:1 onto the table in the Decisions section above.
- [x] Add Google Fonts `preconnect`/stylesheet `<link>` tags to
      `src/layouts/BaseLayout.astro`, scoped to exactly the weights/axes
      specified in the Decisions section (`Fraunces:opsz,wght@9..144,600;
      9..144,900` + `Space+Grotesk:wght@400;500;600;700`, both
      `&display=swap`) — not the full default family.

Exit criterion: the landing page renders in the new palette/fonts with no
component refactor yet (raw token swap only). `grep -rn
"6b6b80\|e0346e\|5a5cf0\|12a37a\|e7e5df" src/` (the old hard-coded hex
values) is a starting point to spot-check, not an automatic pass/fail — a
match inside a comment or a data URI isn't necessarily a real leftover
reference, so review any hits rather than treating a nonzero count as
failure.

### Phase 2: Component library

- [x] Add `src/components/ui/Button.astro` (variants: primary/ghost, hard
      offset-shadow retro style using `--shadow-color`), covering hover,
      focus-visible, and active states explicitly (not just default/hover)
      — the risk reviewer flagged that undefined interaction states get
      invented ad hoc by whoever writes the next page.
- [x] Add `src/components/ui/Badge.astro` (solid-fill tag chip).
- [x] Add `src/components/ui/SiteHeader.astro` (site title, nav links, lang
      switch — the markup currently inline in `BaseLayout.astro`'s
      `<header class="site-header">`), per the widened component-scope
      decision above.
- [x] ~~Add `src/components/ui/index.ts` barrel module~~ — added, then
      removed: `aislop` blocks a `.ts` file re-exporting `.astro`-extension
      modules (`TS2307`), and this repo has no precedent for barrelling
      `.astro` components anyway. See Scope for the full reasoning.

Exit criterion: all three components render correctly in isolation with
sample props/slots, checked via the dev server in both light and dark OS
preference (no new test framework introduced — see the "Test tooling"
decision above).

### Phase 3: Apply to site chrome

- [ ] Refactor `src/components/ProjectCard.astro` to use `Button` for
      source/demo/read-more links and `Badge` for tags.
- [ ] Apply the same refactor to
      `src/pages/[lang]/projects/[slug].astro`'s header links/tags.
- [ ] Update `.site-title`'s gradient text-clip and `.card--featured`'s
      gradient border-box trick in `global.css` to use the new
      `--accent`/`--accent-2` values (both mechanisms already exist and
      reference accent tokens by name, so they pick up the new colours
      automatically once Phase 1's cutover lands — this task is to
      eyeball them and confirm the retro palette actually looks right in
      a gradient, not just as flat colour).
- [ ] Swap `BaseLayout.astro`'s inline header markup for `<SiteHeader>`.
- [ ] Contrast check: compute the actual contrast ratio for every
      text-on-background pairing this plan introduces or changes
      (`--fg`/`--muted` on `--bg`/`--card-bg`, each accent used as link or
      badge text) and confirm ≥4.5:1 for normal text / ≥3:1 for large text
      and non-text UI (WCAG AA). Record the ratios in this plan's
      Verification section once measured; adjust only the specific failing
      token pairing if one fails, not the whole palette.
- [ ] Visual check of `/en/`, `/fr/`, and a project detail page in a
      browser (light and dark OS preference), capturing before/after
      screenshots per the `documentation--proof-of-work` convention.
      Specifically check that `SiteHeader`'s nav/lang-switch text doesn't
      overflow or wrap awkwardly on `/fr/`, where labels run longer than
      `/en/`.

Exit criterion: landing page, project cards, project detail pages, and the
site header all render through the new tokens and components; no leftover
references to the old flat palette values in `global.css`; contrast ratios
recorded and passing.

## Risks

- **Contrast/accessibility:** strong retro accents (burnt orange on cream,
  mustard on cream) risk failing WCAG AA text contrast (4.5:1 normal text,
  3:1 large text/non-text UI) if used for body text rather than
  accents/badges. Mitigation: keep body text on `--fg`/`--muted` against
  `--bg`/`--card-bg`; accents stay confined to links, badges, and borders,
  not paragraph text — verified concretely by Phase 3's contrast-check task
  and recorded ratios, not left as an unchecked assumption.
- **Font loading cost / layout shift:** Fraunces is a large variable font
  family, and a font swap after initial paint causes visible layout shift.
  Mitigation: the weight/axis-scoped Google Fonts request in Phase 1
  (display weights only for `Fraunces`, 400–700 for `Space Grotesk`) plus
  `&display=swap`.
- **Scope creep into `/stars`:** the strongest temptation once the palette
  looks good on the landing page will be to "just" carry it into the galaxy
  view. Explicitly resist this per the Scope section above — that's a
  separate decision.
- **Building form controls ahead of any consumer, considered and declined:**
  an earlier pass of this plan widened Phase 2 to include `TextField`/
  `Select`/`Dropdown` speculatively, ahead of the 5 upcoming pages. A
  re-review confirmed this was the wrong call for this plan (see Decisions
  and Open Questions) — recorded here so the reasoning isn't lost, not as a
  live risk.

## Verification

- `mise run lint` and `mise run typecheck` pass (Astro components are
  linted/type-checked alongside the rest of the site).
- `mise run test` still passes — this plan touches no `.ts` logic under
  `src/stars/`, so the existing stars test suite should be unaffected.
- `aislop scan` (or the per-edit hook) stays clean on every touched file —
  this is a pre-commit gate in this repo, listed explicitly here since the
  earlier draft only named lint/typecheck/test.
- Contrast ratios recorded for each text-on-background pairing (see Phase
  3's contrast-check task) — fill in once measured:
  - `--fg` on `--bg`: *TBD*
  - `--fg` on `--card-bg`: *TBD*
  - `--muted` on `--bg`/`--card-bg`: *TBD*
  - each accent used as link/badge text on `--bg`/`--card-bg`: *TBD*
- `grep -rn "class=\"card-link\"\|class=\"card-tag\"" src/pages src/components` returns nothing once Phase 3 lands — confirms no template still
  references the pre-component classes that Phase 3 replaces.
- Manual browser check (per `run` skill / dev server) of `/en/`, `/fr/`,
  one project detail page, confirming: retro palette applied, fonts
  loaded, header/cards/badges/buttons render, and `/stars` is visually
  unchanged — with before/after screenshots captured per
  `documentation--proof-of-work`.

## Open Questions

- A separate plan is needed to scope the ~5 upcoming pages (routing under
  `[lang]/`, content model, layout conventions, and their actual
  form-control requirements) before `TextField`/`Select`/`Dropdown`-style
  components get built against them — not part of this plan.
- Should the main site chrome get an explicit light/dark toggle (matching
  the pattern `/stars` already has), or keep following OS preference only?
  Not decided — out of scope for this plan unless the user asks for it.
- Should `/stars`' own dark theme eventually consume `tokens.css` too (e.g.
  swap its galaxy accent colours for `--accent`/`--accent-2`/`--accent-3`),
  or should it stay a deliberately distinct "app-like" surface permanently?
  Deferred — needs a separate decision from the user, not assumed here.
- The repo's `theme-vocabulary.md` controlled list (`COLLECTION` / `DIGEST`
  / `DELIVERY` / `INFRA` / `GOVERNANCE` / `TOOLING`) has no UI/design theme;
  `TOOLING` was used here as the closest fit (site build/dev-facing
  styling work) rather than inventing a new theme ad hoc, per the
  split-on-evidence rule. Worth flagging if design/UI work becomes a
  recurring plan category.
