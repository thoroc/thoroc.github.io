---
title: "Plan: Supersede ADR-004 — align /stars with the landing page"
type: plan
status: done
date: 2026-08-19
effort: "L"
value: "MEDIUM"
themes:
  - TOOLING
related:
  - ../findings/2026-08-19-stars-landing-alignment-current-state.md
  - ../plans/2026-08-19-retro-design-system.md
---

## Goal

Fully unify `/stars` with the rest of the site so it reads as the same
product, not a bolted-on separate app: same page shell (`BaseLayout` via a
dedicated `StarsLayout.astro`), `SiteHeader`, footer, fonts, favicon), same
retro-70s tokens driving its color palette, and one sitewide light/dark/system
theme toggle instead of two independent theme systems. This supersedes
ADR-004 (`docs/ADR/adr-004-stars-theme-stays-separate.md`), which
deliberately kept `/stars` structurally separate and left "should it ever
adopt `tokens.css`" as an open question — this plan answers that question
with "yes, fully."

The galaxy WebGL canvas's own rendering colors (`src/stars/galaxy/colors.ts`)
are out of scope — the ask is to align the page/app chrome, not to reskin a
3D starfield.

**Shipping unit:** all 5 phases below land as commits on **one** branch/PR,
squash-merged together per this repo's standard merge strategy
(`ways-of-working.md`). They are never merged to `main` independently. This
is load-bearing, not a convenience: Phase 1 renames the theme attribute at
the JS/module level and Phase 4 is what renames the matching CSS selector in
`app.css` — if those ever shipped as separate merges, `/stars`'s dark toggle
would silently stop working for the gap between them. `hk check -c` still
runs after each phase locally (see Phases) to catch regressions early, but
nothing merges to `main` until all 5 phases are done.

## Decisions

Resolved with the user before drafting this plan (see
`.context/findings/2026-08-19-stars-landing-alignment-current-state.md` for
the investigation that surfaced the open questions):

1. **Unification depth: full.** Both the page shell (layout, header, footer,
   fonts, meta/favicon) and the theme system (palette + toggle) move onto the
   sitewide mechanism. Not a visual-only reskin, not a chrome-only wrap.
2. **Theme toggle: sitewide, three-state, `system` default.** The landing
   page currently has *no* runtime toggle (dark mode there is
   `prefers-color-scheme` only); `/stars` has a two-button (light/dark)
   toggle with persisted preference, defaulting to `system` on first load but
   with no UI affordance to return to it once changed. The unified toggle:
   - Ships as light/dark/**system** (three states, `system` is the default
     and reachable from the UI — a real behavior change from `/stars`'s
     current two-button toggle).
   - Lives in `SiteHeader.astro` so it renders on every page (landing +
     `/stars`), driven by one persisted preference key and one
     `data-theme` attribute on `<html>` (replacing `/stars`'s
     `data-stars-theme` and `stars-color-theme` localStorage key).
   - Reuses the existing three-state preference model
     (`src/stars/theme/color-theme/*`) rather than inventing a new one — that
     module already implements `'light' | 'dark' | 'system'` →
     `'light' | 'dark'` resolution correctly; it just needs to move out of
     `src/stars/` and drop the `stars`-specific naming.

The following were resolved during `plan-review` (3-reviewer audit: Technical
- Strategic on Claude Sonnet 5, Risk on Claude Haiku 4.5). Each either had one
evidence-backed correct answer (editorial) or was a genuine tradeoff put to
the user (decision):

1. **`useStarsTheme` is deleted, not retained or simplified.** Editorial —
   confirmed by checking actual usage: `useStarsTheme` has exactly one
   consumer, `App.vue`'s two-button light/dark toggle, which Decision 2
   already replaces with the sitewide `SiteHeader` toggle. Once that UI is
   removed, the composable has zero remaining callers. Delete
   `src/stars/composables/useStarsTheme/` (including its test) and the two
   toggle buttons + their container markup in `App.vue` in Phase 3, rather
   than leaving a read-only wrapper nothing calls.
2. **`/stars` drops its distinct favicon.** Editorial — the Goal states
   `/stars` should read as the same product; keeping `/stars/favicon.svg` as
   an override contradicted that. `/stars` adopts the sitewide
   `/favicon.svg`.
3. **`BaseLayout` extension: a dedicated `StarsLayout.astro` wrapper, not new
   props on `BaseLayout`.** Editorial — `/stars` is `BaseLayout`'s only
   consumer needing extra `<head>` content (preload/preconnect hints);
   adding one-off optional props to a shared layout for a single caller is
   the kind of premature generality this repo's own conventions warn
   against. `StarsLayout.astro` wraps `BaseLayout` and renders the
   `/stars`-specific `<head>` additions via a slot instead.
   `StarsLayout.astro` hardcodes `lang="en"` when calling `BaseLayout` — no
   French `/stars` route exists or is planned (see the language-scope note
   below), so there's no locale to select.
4. **`--danger` becomes a real sitewide token in `tokens.css`.** Decision —
   put to the user directly, since it's a genuine tradeoff (blast radius vs.
   reusability): `--stars-c-danger-1` has no equivalent in `tokens.css`,
   which has no error/danger color at all today. The user chose to add
   `--danger` (light + dark variants) to `tokens.css` itself rather than a
   `/stars`-local hardcoded fallback, accepting the wider blast radius in
   exchange for a reusable sitewide error color.
5. **ADR-003 is not revisited.** Editorial — ADR-003 flags "gains real
   interactive logic" as a reason to reconsider test tooling for `.astro`
   components. The toggle's actual logic (persistence, resolution) stays
   unit-tested via colocated `.ts` tests per `typescript-standards.md`,
   consistent with how the rest of the shared theme module is already
   tested; only the `SiteHeader.astro` markup/wiring is manually verified,
   which is the same bar ADR-003 already sets for `Button.astro`,
   `Badge.astro`, and `SiteHeader.astro` itself. No new test framework is
   warranted for one three-state button group.

**Language scope note** (raised and confirmed with the user separately from
plan-review): English and French are the only two site locales, English is
already the default (`src/pages/index.astro` sends any non-`fr` browser
language to `/en/`), and no other locale (including any prior mention of
Mandarin/Chinese) is in scope for this or any related work — it is parked
indefinitely. This is why `StarsLayout.astro` can safely hardcode `lang="en"`
rather than needing a locale parameter.

## Scope

**In scope:**

- Promote the color-theme preference/resolution/persistence logic out of
  `src/stars/theme/color-theme/` into a shared location (e.g.
  `src/lib/theme/color-theme/`), generalizing `STARS_COLOR_THEME_KEY` and the
  `data-stars-theme` attribute name to sitewide equivalents
  (`data-theme`, a non-`stars`-prefixed storage key).
- One-time `localStorage` migration: on first read under the new key, if it
  is absent and the old `stars-color-theme` key holds a valid preference,
  adopt and persist it under the new key, then leave the old key alone
  (no need to delete it — it's simply never read again).
- Add a three-state (light/dark/system) toggle UI to `SiteHeader.astro`,
  rendered on every page, with translated labels (`en`/`fr`) and
  `aria-pressed`/keyboard-operable button semantics (native `<button>`
  elements in a `role="group"` container, matching the accessible pattern
  `/stars`'s current toggle already uses).
- Add the FOUC-guard inline script (that reads the persisted preference and
  sets `data-theme` before paint) to `BaseLayout.astro`, replacing the
  equivalent inline script currently only in `src/pages/stars/index.astro`.
  This stays a small, self-contained `is:inline` snippet that re-implements
  the read+resolve logic directly (matching `/stars`'s existing FOUC-guard
  pattern) rather than importing the shared TS module — Astro bundles/hoists
  regular `<script>` tags as deferred modules, which would reintroduce the
  flash this script exists to prevent. The toggle's own click-handling
  script in `SiteHeader.astro` (not a FOUC guard, doesn't need to block
  paint) can import the shared module normally.
- Create `StarsLayout.astro` wrapping `BaseLayout` (see Decision 5), and
  re-point `src/pages/stars/index.astro` at it, removing the hand-rolled
  `<html>/<head>`, the ad hoc `.stars-back-link` (superseded by
  `SiteHeader`'s existing home link/nav), and the now-redundant inline
  theme-init script. `/stars`-specific `<head>` additions (the `stars.json`
  preload hint, GitHub avatar preconnect/dns-prefetch) move into
  `StarsLayout.astro`'s own markup/slot.
- Re-derive `src/stars/styles/app.css`'s ~30 `--stars-c-*` variables from
  `tokens.css`'s tokens (plus the new `--danger` token, Decision 6) at the
  `:root` / `:root[data-theme="dark"]` definition sites only (an
  alias/mapping layer), rather than rewriting the hundreds of consuming
  rules throughout the file. Proposed mapping (final mapping is an
  implementation-time judgment call per variable, not a contract this plan
  fixes):
  - `--stars-c-bg` → `--bg-alt`, `--stars-c-surface`/`--stars-c-bg-soft` →
    `--card-bg`, `--stars-c-bg-alt` → `--bg`
  - `--stars-c-text-1` → `--fg`, `--stars-c-text-2`/`--stars-c-text-3` →
    `--muted`
  - `--stars-c-divider` → `--border`
  - `--stars-c-brand-1`/`--stars-c-brand-2` → `--accent`/`--accent-strong`
    (this changes `/stars`'s link color from GitHub blue to the site's
    orange accent — a deliberate, expected part of unifying brand identity;
    don't special-case it back to blue during the Phase 4 sweep just because
    it looks different)
  - `--stars-c-danger-1` → `var(--danger)` (new token, Decision 6)
  - `--stars-font` → `--font-body` (keep `--font-display` for the
    `/stars` page's own heading, if any)
- Mark `docs/ADR/adr-004-stars-theme-stays-separate.md` `status: superseded`
  and write a new ADR (next number in `docs/ADR/index.yaml` sequence)
  recording this decision, per the `adr-capture` skill's conventions.
- Delete `useStarsTheme` and its test (Decision 3); move and adapt the five
  `color-theme/*.test.ts` files to match the new shared location, naming,
  and attribute.

**Out of scope:**

- The galaxy WebGL canvas's own color palette (`src/stars/galaxy/colors.ts`
  and friends) — a 3D scene, not themed UI chrome.
- Restyling `/stars`'s dense, GitHub-like information architecture (sidebar
  filters, star cards, nav search) into the retro-70s *layout* language —
  this plan unifies the color/font *tokens* those components pull from, not
  their structure or density.
- Any change to the `[lang]/index.astro` landing page's own content or
  layout beyond adding the theme toggle to `SiteHeader`.
- Any locale other than `en`/`fr` (see Language scope note above).
- Introducing component-test tooling for `.astro` files — ADR-003 stands
  unrevised (Decision 7).
- Multi-tab live sync of the theme preference (e.g. via a `storage` event
  listener) — accepted as a known limitation, not a task; see Risks.

## Phases

Run `hk check -c` after each phase, not only at the end — catching a
regression from Phase 2 while starting Phase 3 is far cheaper than finding
it during Phase 5's final gate. Nothing merges to `main` until all 5 phases
are done (see Shipping unit, above).

### Phase 1 — Shared theme module (foundation)

1. Before moving anything, grep `src/stars/theme/color-theme/` and
   `src/stars/composables/useStarsTheme/` for any reference to
   `stars`-specific concerns (`app.css` class names, `/stars` routes, the
   galaxy modules) to confirm the module is genuinely stars-agnostic pure
   logic. If it isn't, strip the coupling before moving it, not after.
2. Move `src/stars/theme/color-theme/*` to a shared location (e.g.
   `src/lib/theme/color-theme/`), keeping the existing pure-function split
   (`readColorThemePreference`, `resolveColorTheme`, `applyColorTheme`,
   `persistColorThemePreference`, `initColorTheme`) but renaming the storage
   key and the `dataset` attribute it writes (`data-theme`, not
   `data-stars-theme`).
3. Add the one-time legacy-key migration (see Scope) to
   `readColorThemePreference` or `initColorTheme`, whichever owns the first
   read.
4. Move and adapt the five `color-theme/*.test.ts` files to the new
   location/names, including a test for the migration path; keep ≥90%
   coverage per `typescript-standards.md`.

**Exit criterion:** shared theme module compiles, is tested (including the
migration path), and the old `src/stars/theme/color-theme/` location no
longer exists.

### Phase 2 — Sitewide toggle UI

1. Add a three-state (light/dark/system) toggle control to
   `SiteHeader.astro`: native `<button>` elements in a `role="group"`
   container, `aria-pressed` reflecting the active state, translated labels
   added to the `en`/`fr` i18n dictionaries, wired to the Phase 1 module via
   a small inline `<script type="module">` that imports it directly (no new
   framework dependency — `astro.config.mjs` only integrates
   `@astrojs/vue`, and Vue is not otherwise used outside `/stars`).
2. Add the FOUC-guard init script to `BaseLayout.astro`'s `<head>` as a
   small self-contained `is:inline` snippet (see Scope — it does not import
   the shared module).
3. Manually verify on the landing page (`/en/`, `/fr/`): toggle cycles
   light → dark → system, persists across reload, respects OS preference
   when on `system`, labels are correctly translated, and the control is
   keyboard-operable.

**Exit criterion:** the landing page has a working three-state toggle;
`/stars` is not yet touched.

### Phase 3 — `/stars` page shell migration

1. Create `StarsLayout.astro` (see Decision 5), wrapping `BaseLayout` with
   `lang="en"` and rendering the `/stars`-specific `<head>` additions
   (favicon is now the sitewide one — no override; `stars.json` preload;
   avatar preconnect/dns-prefetch).
2. Re-point `src/pages/stars/index.astro` at `StarsLayout`, removing the
   hand-rolled `<html>/<head>`, the `stars-back-link`, and the now-redundant
   inline theme-init script.
3. Delete `useStarsTheme` (composable + test) and the two toggle buttons +
   their container markup in `App.vue` (Decision 3).
4. Manually verify `/stars` renders through the shared shell: header/footer
   present, fonts load (Fraunces/Space Grotesk, inherited automatically from
   `BaseLayout` — no separate task needed), and the `SiteHeader` toggle
   controls `/stars`'s theme too (confirm this explicitly — `/stars`'s
   remaining Vue components only consume the theme via CSS custom
   properties post-Decision-3, so there's no Vue-side reactivity left to
   race against the toggle's script, but verify in the browser rather than
   assuming it from the architecture alone).

**Exit criterion:** `/stars` has no bare `<html>` of its own (the ADR-004
structural claim is no longer true); `useStarsTheme` no longer exists.

### Phase 4 — Palette unification in `app.css` and `tokens.css`

1. Add `--danger` (light + dark variants) to `tokens.css`'s `:root`,
   `@media (prefers-color-scheme: dark)`, and `:root[data-theme="dark"]`
   blocks (Decision 6).
2. Replace the `:root` / `:root[data-stars-theme="dark"]` variable
   *definitions* in `src/stars/styles/app.css` with the token-derived
   mapping from Scope above, changing the selector to
   `:root[data-theme="dark"]` (or removing it if `@media
   (prefers-color-scheme: dark)` + the shared toggle already covers it —
   match whatever pattern `tokens.css` uses).
3. Grep `app.css`'s consuming rules for literal hex/`rgb(`/`rgba(` color
   values that should be using a `--stars-c-*` variable instead — a
   mechanical backstop for anything the manual sweep below might miss,
   given there's no automated visual regression coverage (ADR-003).
4. Visual sweep of `/stars` in both light and dark: nav, sidebar filters,
   star cards, search, detail panel. Confirm no WCAG AA contrast regression
   on primary text/background pairs in either theme (a manual spot-check —
   there's no automated tool wired up for this) — the retro palette has
   fewer distinct tones than the GitHub-style palette it replaces, so some
   visual compression is expected and acceptable, but a failed contrast
   check is not.
5. Leave the ~2,400 lines of rules that *consume* `--stars-c-*` untouched.

**Exit criterion:** no `app.css` rule changes beyond the `:root`
variable-definition blocks; no WCAG AA contrast regressions found on primary
text/background pairs in either theme across the swept surfaces.

### Phase 5 — ADR and cleanup

1. Mark `docs/ADR/adr-004-stars-theme-stays-separate.md` `status:
   superseded`, run `adr-capture` to write the new ADR and update
   `docs/ADR/index.yaml`.
2. Update this plan's `status: done` (per `ways-of-working.md`'s "keeping
   plans in sync with implementation") and the source finding's `status` if
   applicable.
3. Run `hk check -c` (format, lint, types, tests) and fix anything it
   flags.

**Exit criterion (Definition of Done for the whole plan):**

- `hk check -c` passes clean (zero lint/format/type/test failures).
- `docs/ADR/index.yaml` shows ADR-004 as `superseded` and the new ADR as
  `accepted`.
- `/stars` renders through `StarsLayout`/`BaseLayout` with no bare `<html>`
  of its own; `useStarsTheme` no longer exists in the codebase.
- One `data-theme` attribute and one persisted preference key drive both the
  landing page and `/stars`; `data-stars-theme` and `stars-color-theme` no
  longer appear anywhere in `src/`.
- The three-state toggle in `SiteHeader.astro` works (cycles, persists,
  respects OS preference) on both the landing page and `/stars`, in both
  `en` and `fr`.
- All 5 phases landed as one squash-merged PR (see Shipping unit).

## Risks

- **Contrast/readability regression.** Collapsing ~30 semantically distinct
  GitHub-style variables onto ~12 retro tokens (plus the new `--danger`) is
  a real compression, not a 1:1 swap. The `/stars` UI (dense sidebar, star
  cards, syntax-colored language dots) risks becoming harder to scan.
  Mitigated by the grep backstop and the explicit WCAG-AA-aware visual sweep
  in Phase 4, but the sweep itself is still a judgment call, not a
  mechanical check — flag anything that looks wrong rather than shipping it.
- **`localStorage` migration edge cases.** If `localStorage` is unavailable
  (private browsing, sandboxed iframe), both the old and new reads fail
  silently (existing `try/catch` behavior) and the preference falls back to
  `system` — acceptable, but worth knowing the migration silently no-ops in
  that case rather than erroring.
- **No multi-tab live sync.** Changing the theme in one tab doesn't update
  an already-open tab on another page until reload — accepted as a known
  limitation (see Scope, Out of scope), not worth a `storage` event listener
  for a personal site's realistic usage pattern.
- **`app.css` is 2,498 lines with no automated visual regression coverage**
  (ADR-003: no test tooling for presentational surfaces). Any part of Phase
  4 that turns out to need more than a `:root`-only variable remap (i.e. a
  rule that hardcodes a color instead of consuming a `--stars-c-*` variable)
  is caught by the Phase 4 grep backstop or the manual sweep, not by a test
  failure — if both miss something, it ships.

## Verification

- `hk check -c` (biome lint/format, `astro check` typecheck, `bun test`)
  passes with zero failures — run after each phase, required clean at the
  end (see Phases).
- Manual dev-server pass (per ADR-003's existing precedent for `.astro`
  components): landing page (`/en/`, `/fr/`) and `/stars` in light, dark,
  and system-follows-OS modes; toggle persists across reload; toggle labels
  correctly translated in both locales; `/stars` renders through the shared
  header/footer with no layout breakage.
- `docs/ADR/index.yaml` and `.context/index.yaml` regenerated
  (`context-index` skill) and reflect the new/updated entries.
- See Phase 5's Definition of Done checklist for the authoritative
  "is this plan actually finished" list.

## Open Questions

None — all four questions raised while drafting this plan were resolved
during `plan-review` (three either had an evidence-backed correct answer, one
was a genuine tradeoff resolved directly with the user). See the Decisions
section above for each resolution and its rationale.
