---
title: "Follow-up: replace /stars's internal zh-CN UI locale with fr"
type: follow-up
status: active
date: 2026-08-19
related:
  - ../plans/2026-08-19-supersede-adr-004-stars-landing-alignment.md
---

# Follow-up: replace `/stars`'s internal zh-CN UI locale with fr

## Context

Surfaced while implementing
`.context/plans/2026-08-19-supersede-adr-004-stars-landing-alignment.md`
(reading `App.vue` to remove its theme-toggle buttons — Decision 3 of that
plan). `/stars` (ported from the upstream `OXOYO/stars` tool) has its own
internal UI-language toggle, entirely separate from the site's `en`/`fr`
locale switcher: a `zh-CN`/`en` pair used to translate `/stars`'s own
labels, dates, and galaxy legend — not the sitewide i18n system in
`src/i18n/`.

The user confirmed this is the "Mandarin" issue raised earlier in the same
session and wants it replaced: `zh-CN` → `fr`, with `en` as the default
(matching the sitewide default). Any other locale stays parked, per the
user's standing direction that English and French are the site's only two
languages.

This is explicitly **out of scope** for the ADR-004/`/stars`-landing-page
theme-and-shell unification plan and must not be folded into that branch —
it's a comparably-sized, independent unit of work.

## Scope discovered (not yet a plan — needs its own findings pass)

Grepping `src/stars` for `zh-CN`/`zh_CN`/`'zh'` turned up roughly 15 files
across several concerns, not just UI labels:

- **Core locale resolution**: `src/stars/i18n/normalizeUiLocale.ts` (returns
  `'zh-CN'` for anything not exactly `'en'` — no `fr` case exists) and
  `src/stars/i18n/resolveUiLocale.ts` (defaults its `fallback` parameter to
  `'zh-CN'`, not `'en'` — meaning `/stars` currently defaults to Chinese
  unless a `?lang=en` query param or stored preference says otherwise).
- **Message dictionary**: `src/stars/i18n/messages.ts` is 215 lines —
  presumably English + Chinese strings for every `/stars` UI label. Needs
  either full French translations for every string, or an explicit decision
  on what happens to strings without one.
- **Storage/persistence**: `src/stars/storage/ui-prefs/readStoredUiLocale.ts`,
  `writeStoredUiLocale.ts`, and `migrateLegacyPrefs.test.ts` — likely need a
  migration path analogous to the color-theme localStorage migration in the
  sibling plan.
- **State/store**: `src/stars/composables/useStarsStore/state.ts`,
  `setUiLocale.ts`, `hasUiLocaleQuery.ts`, `resetStateForTests.ts`.
- **Consumers that branch on locale for non-label reasons** (higher risk
  than a straight string swap): `src/stars/galaxy/repo-position/
  buildLanguageLayout.ts`, `src/stars/galaxy/virtual-stars/
  buildTopicRingKeySet.ts`, `src/stars/galaxy/star-visuals/
  buildLanguageLegend.ts`, `src/stars/utils/format-date/
  formatRepoDate.ts`, `src/stars/utils/stars-filter/countBy.ts`.
- `App.vue`'s language-toggle markup itself (`stars-app__lang` button
  group, `langZh`/`langEn` labels) — the smallest, most visible part of the
  change, but not the bulk of the work.

## Outstanding Work

- Run this repo's `planning-flow` for the swap: a findings pass (confirm
  the full file list above and read what each locale-branch actually does,
  especially the three galaxy-renderer consumers, before assuming a
  mechanical rename), a draft plan, and a `plan-review` pass, given the
  size and the translation-content dependency.
- Decide who supplies the French translation content for the 215-line
  message dictionary (machine-translated as a starting draft vs. the user
  supplying real copy) before implementation starts — this blocks Phase-1
  sizing the same way `--danger`'s sitewide-token question did in the
  sibling plan.
- Confirm whether `en` becoming the hardcoded default in
  `resolveUiLocale`/`normalizeUiLocale` has any interaction with the
  sibling plan's `StarsLayout.astro` (which hardcodes `lang="en"` for the
  *site-chrome* locale, a different, already-English-only concern) — they
  are independent today but worth a sanity check once this work starts.

## Addendum: reconsider how localized strings are loaded

The user flagged, while this follow-up was being filed, that
`src/stars/i18n/messages.ts`'s approach (215 lines of inline
string-literal dictionaries) may not be the right long-term shape, and
pointed at a reference implementation worth comparing against:
<https://github.com/thoroc/mcpx-cli/blob/main/src/utils/i18n.ts>. Evaluate
that utility's approach (loading mechanism, file format, typing) as part of
this follow-up's findings pass — it may replace `messages.ts`'s structure
rather than just adding an `fr` entry to it, which would change the shape
of the swap described above.

## Action

Set `status: done` in this file (do not delete it) once this locale swap
has its own plan and lands.
