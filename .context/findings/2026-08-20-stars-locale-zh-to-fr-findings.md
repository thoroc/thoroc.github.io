---
title: "Finding: /stars zh-CN → fr locale swap — scope, hazards, and the messages.ts structure question"
type: finding
status: active
date: 2026-08-20
related:
  - ../follow-ups/2026-08-19-stars-locale-zh-to-fr.md
---

# Finding: `/stars` zh-CN → fr locale swap — scope, hazards, and the `messages.ts` structure question

> This is not a mechanical string rename. Two real bugs sit under the zh-CN literals (locale-blind sort
> collation; a Chinese string doubling as a map/composite key), and one file (`createTranslator.ts`) makes
> `zh-CN` — not `en` — the de facto fallback locale, backwards from the stated goal.

## Summary

Confirmed the ~23-file scope from the follow-up (grep for `zh-CN`/`zh_CN`/`'zh'`/`langZh`/`langEn` across
`src/stars`, `.ts` + `.vue`, no `.astro` hits). Grouped into three areas, each read in full:

1. **i18n core + storage + state** — the locale-normalization/storage/store layer. Six files independently
   reimplement the same `value === 'en' ? 'en' : <other>` binary instead of calling the shared
   `normalizeUiLocale`. `createTranslator.ts` hardcodes `'zh-CN'` twice as the *universal fallback pack*,
   used both for unrecognized locales and missing keys — making `zh-CN` the real base locale today, not `en`.
   `formatGeneratedAt.ts` passes the locale string straight to `Intl` with a hardcoded `Asia/Shanghai`
   timezone — a genuine design decision for `fr`, not a string swap.
2. **Galaxy-renderer consumers** — `countBy.ts`, `buildLanguageLayout.ts`, `buildTopicRingKeySet.ts`,
   `buildLanguageLegend.ts` all contain an **unconditional** `localeCompare(..., 'zh-CN')` tie-break sort —
   a real bug (locale-blind sort dressed up as a locale value), not a feature to preserve. Three of the four
   also use the Chinese literal `'其他'` ("Other") as a **map/composite-string key**, not just display text —
   tests string-match on it directly, so renaming it is not a pure string swap. `formatRepoDate.ts` is a
   genuine three-way locale branch (`en` / else-hardcoded-`zh-CN` / needs a new `fr` arm) with its own
   `Intl.DateTimeFormat` locale-tag decision.
3. **The `messages.ts` structure question** (user's addendum, re-verified directly rather than taken on a
   subagent's word — see [Correction](#correction-on-the-mcpx-cli-comparison) below) — the reference
   implementation at `thoroc/mcpx-cli`'s `src/utils/i18n.ts` isn't a good fit to adopt wholesale, but not
   for the reason first reported. The current `MessagePack = Record<string, string>` type in
   `src/stars/i18n/types.ts` provides **no** compile-time key checking today — the "current typing is
   stronger" claim was wrong. The real reasons to skip full `i18next` adoption are dependency footprint,
   a locale-negotiation model mismatch (OS `LC_ALL`/`LANG` detection vs. this app's in-app query-param/
   stored-preference toggle), and a scale mismatch (15 locales vs. 2). Adding `keyof`-based exhaustive key
   typing to `MessagePack`/`Translator` is a separate, independently worthwhile improvement, decoupled from
   the library question.

## Detail

### 1. i18n core, storage, state

| File | Literal(s) | What it does | Swap impact |
| --- | --- | --- | --- |
| `src/stars/i18n/normalizeUiLocale.ts:2` | `'zh-CN'` | `value === 'en' ? 'en' : 'zh-CN'` | Change literal. Its test (`normalizeUiLocale.test.ts:11`) currently asserts `'fr'` normalizes to `'zh-CN'` — that assertion **inverts** once `fr` is the real target and must be rewritten, not just left passing. |
| `src/stars/i18n/resolveUiLocale.ts:3` | `'zh-CN'` (default `fallback` param) | Resolution order: `?lang=` query → `fallback` param → `normalizeUiLocale`. No storage read in this file itself — storage-based fallback is supplied by the caller. | Change default literal + 2 test literals (lines 10, 18). |
| `src/stars/i18n/messages.ts` (209 lines) | Two top-level keys: `'zh-CN'`, `en` | Flat `Record<string,string>`, ~104 keys each, `{param}`-style interpolation only, no pluralization/ICU. `messages.test.ts` only asserts key-set parity between packs (locale-name-agnostic, no change needed). | The 104 Chinese values need real French translations — this is the bulk of the work and blocks on a content-source decision (see Outstanding Work in the follow-up). |
| `src/stars/i18n/createTranslator.ts:11-12,14` | `'zh-CN'` (×2) | **Hardcoded as the universal fallback pack** — used when (a) the active locale is unrecognized and (b) a key is missing from the active locale's pack. This makes `zh-CN` the real base/fallback locale today, contradicting the stated goal of `en` as default. Locked in by `createTranslator.test.ts:20-23` (`'falls back to zh-CN for an unknown locale'`). | **Needs an explicit decision**, not a literal-for-literal rename: keep the fallback pack as whatever locale replaces `zh-CN` (making `fr` the silent fallback — same bug, different language), or fix the fallback to be `en` as part of this change. |
| `src/stars/i18n/formatGeneratedAt.ts:18-25` | `'zh-CN'`, `Asia/Shanghai` | Non-`en` branch: `date.toLocaleString('zh-CN', { ..., timeZone: 'Asia/Shanghai' })` — a real `Intl` locale **and timezone** pairing, not display text. | Needs an explicit choice of French locale tag (`'fr-FR'` vs `'fr'`) and a timezone decision (`Europe/Paris`? UTC? browser-local?) — a design decision. Test (`formatGeneratedAt.test.ts:13-14`) currently asserts a Chinese-formatted string as the non-`en` default; needs a French-format assertion. |
| `src/stars/storage/ui-prefs/readStoredUiLocale.ts` | allowlists `'en' \| 'zh-CN'` | Non-matching stored values return `''`. | Change allowlist. |
| `src/stars/storage/ui-prefs/writeStoredUiLocale.ts` (+`test.ts:16-19`) | coerces non-`'en'` to `'zh-CN'` before persisting | Same normalize-on-write pattern as `setUiLocale.ts` below. | Test currently asserts writing `'fr'` gets coerced to `'zh-CN'` today — inverts post-swap. |
| `src/stars/storage/ui-prefs/migrateLegacyPrefs.test.ts` | `'en'`, `'zh-CN'` as fixture values | Migrates a legacy `sessionStorage` blob's `uiLocale`/`viewMode`/`sidebarCollapsed` into new prefs only when unset. The function itself does **not** validate/normalize locale strings. | No migration-path logic needed for the rename itself (unlike a value-*shape* change) — only the test fixtures need updating. |
| `src/stars/composables/useStarsStore/state.ts:30` | `'zh-CN'` (`uiLocale` ref default) | Store's initial locale value. | Change default. |
| `src/stars/composables/useStarsStore/state.ts:61` | `'zh-CN'` (`localeConfig.configured`) | A **second**, separately-named locale box. Purpose/consumers not traced in this pass — confirm what reads `localeConfig.configured` before assuming it's just a duplicate of `uiLocale` before the swap. | **Needs its own check** — flagged as open, not yet resolved. |
| `src/stars/composables/useStarsStore/setUiLocale.ts:8` | `'zh-CN'` | Re-normalizes non-`'en'` to `'zh-CN'` (same pattern as storage); sets/clears `?lang=en` in the URL. Asymmetric — only `en` ever gets an explicit URL marker, never `?lang=zh-CN`. | Test (`setUiLocale.test.ts:16-21`) asserts the `'fr'→'zh-CN'` coercion — inverts post-swap. |
| `src/stars/composables/useStarsStore/resetStateForTests.ts:50,72` | `'zh-CN'` (×2) | Resets both `uiLocale.value` and `localeConfig.configured` back to `'zh-CN'`. | Change both literals in step with `state.ts`. |
| `src/stars/composables/useStarsStore/hasUiLocaleQuery.ts` | none | Only checks presence of `?lang=`, locale-value-agnostic. | No change needed. |
| `src/stars/App.vue:148-163` | `'zh-CN'`, `t('langZh')`/`t('langEn')` | The visible lang-toggle button pair. Smallest, most visible part of the change; not the bulk of the work. | Change literal + swap `langZh` message key/label for a French one (or repurpose the key). |

**Cross-cutting pattern**: the `value === 'en' ? 'en' : 'zh-CN'` binary is reimplemented independently in
at least six places (`normalizeUiLocale`, `resolveUiLocale`, `createTranslator`'s fallback lookup,
`writeStoredUiLocale`, `setUiLocale`, `state.ts`'s initial value / `resetStateForTests`) rather than all
calling the one shared `normalizeUiLocale`. A rename touches at least 9 production files and 7 test files.
This duplication is itself worth consolidating to a single normalizer call site as part of the swap, not
just replacing the literal nine times.

### 2. Galaxy-renderer consumers

| File | Literal(s) | What it actually does | Verdict |
| --- | --- | --- | --- |
| `src/stars/utils/stars-filter/countBy.ts:13` | `'zh-CN'` | Unconditional `localeCompare(a, b, 'zh-CN')` tie-break in a sort — **not gated on UI locale at all**, always collates by Chinese rules regardless of which language the UI is showing. | **Real bug**, not a preserved feature. Needs fixing, not just relabeling. |
| `src/stars/galaxy/repo-position/buildLanguageLayout.ts:12,17,23,36,38,41` | `'其他'`, `'zh-CN'` | Groups repos by *programming* language (unrelated to UI locale) for galaxy positioning. Line 17: same unconditional `'zh-CN'` collation tie-break bug as `countBy.ts`. Lines 12/23/36/38/41: the Chinese literal `'其他'` ("Other") is used as the **map key** for the no-language bucket — UI-facing text hardcoded as a data key, separate from (and currently duplicating) the `otherLang` key already in `messages.ts`. | **Genuinely needs care** — two independent issues, not a string swap. |
| `src/stars/galaxy/virtual-stars/buildTopicRingKeySet.ts:21,39,61(test)` | `'其他'`, `'zh-CN'` | Same shape: `'其他'` bucket key for topics (topics are free-text, not localized) + hardcoded `'zh-CN'` collation tie-break. The `'其他'` key also leaks into a **composite string key** (`topicRingKey`, e.g. tested as `'其他\0legacy'`) that other code and tests string-match on directly. | **Genuinely needs care** — renaming `'其他'` here is not a pure string swap; it changes a key other code depends on. |
| `src/stars/galaxy/star-visuals/buildLanguageLegend.ts:9,15` | `'其他'`, `'zh-CN'` | Same two-issue pattern as the above two files; produces `{name, count}` pairs for the galaxy legend (actual display labels come from elsewhere). | **Genuinely needs care** — same two issues. |
| `src/stars/utils/format-date/formatRepoDate.ts:3,8-19` | `'zh-CN'` (default param + hardcoded else-branch) | Genuine three-way locale branch: default parameter `locale: string = 'zh-CN'`, `if (locale === 'en') {...} else { date.toLocaleDateString('zh-CN', {...}) }`. Test (`formatRepoDate.test.ts:13-14`) asserts a Chinese-formatted date string (`'2026年1月15日'`) as the **default** behavior. | **Genuine locale-branching logic** — adding `fr` needs a real third branch, an `Intl.DateTimeFormat` locale-tag decision (`'fr-FR'` vs `'fr'`), format-options choice, and the default parameter + its test change together. |

**Cross-cutting pattern**: the identical `'其他'`-as-map-key plus hardcoded-`'zh-CN'`-collation duplication
appears independently in four files (`countBy.ts`, `buildLanguageLayout.ts`, `buildTopicRingKeySet.ts`,
`buildLanguageLegend.ts`). Recommend one shared fix — e.g. a locale-aware collator/constant threaded through
all four — rather than four independent point-fixes that could drift.

### 3. `messages.ts` structure question — the mcpx-cli comparison

The follow-up's addendum asked whether `thoroc/mcpx-cli`'s `src/utils/i18n.ts` is a better model than the
current 209-line inline-dictionary `messages.ts`.

**mcpx-cli's actual approach**: full `i18next` library, ~15 separate per-locale JSON files
(`../locales/en/common.json`, `../locales/nl/common.json`, etc.), locale auto-detected from the OS/CLI
process's `LC_ALL`/`LANG` environment variables (not a user-facing toggle). Typing is minimal — no derived
key types, effectively `Record<string, any>`, relying entirely on i18next's own generic `t()` inference.

#### Correction on the mcpx-cli comparison

An initial pass concluded "don't adopt — mcpx-cli's typing is weaker than what `/stars` already has." That
claim does not hold up under direct inspection and should not be relied on:

- `src/stars/i18n/types.ts` defines `MessagePack = Record<string, string>` — a plain string-keyed record
  with **no** compile-time key checking. `t('someTypoedKey')` compiles today and silently returns the raw
  key string via `createTranslator.ts`'s `pack[key] ?? ... ?? key` fallback chain. There is no
  `keyof typeof messages.en` narrowing anywhere in this file or `createTranslator.ts`.
- i18next's own ecosystem has an established pattern (module augmentation off a typed `resources`
  interface) for exhaustive, autocompleted key-checking — a capability `/stars`'s current setup does not
  have, not one it already exceeds.
- So "current typing is stronger" is false as stated. Neither approach currently provides real type safety
  on message keys.

**What still holds**, on reasons independent of typing:

- **Dependency footprint** — a full i18n library for a 2-locale dictionary is added surface with no
  functional gain at this scale.
- **Locale-negotiation mismatch** — mcpx-cli's detection model (OS environment variables for a CLI process)
  doesn't map onto `/stars`'s model (an in-app query-param + stored-preference toggle inside a browser).
  Adopting the library would not simplify or improve this app's actual locale-resolution logic.
- **Scale mismatch** — 15 locales is where per-locale JSON files plus tooling earns its keep; at 2 locales
  it adds indirection without a payoff.

**Recommendation**: do not adopt `i18next`/mcpx-cli's structure for this swap. Treat the `fr` translation
work as a content change to the existing `messages.ts` shape. Two genuinely separate, optional improvements
surfaced by this comparison — neither required to unblock the swap, both independent of the library
question:

1. Split `messages.ts` into `messages.en.ts` / `messages.fr.ts` (or similar) purely for translation-file
   editability — a low-risk, library-free refactor, decoupled from typing or i18next.
2. Add `keyof typeof messages.en`-based typing to `MessagePack`/`Translator['key']` for real compile-time
   key checking — a genuine gap in the current code, worth deciding on independently of this swap's scope.

## Recommended Action

1. **Do not attempt this as a mechanical find-and-replace.** File a `plan-create` draft plan scoped to:
   the content swap (`messages.ts` translations — needs a translation-content source decision first, see
   the follow-up), the `createTranslator.ts` fallback-pack decision (keep fallback = new non-`en` locale,
   or fix fallback to be `en`), the `formatGeneratedAt.ts`/`formatRepoDate.ts` `Intl` locale-tag + timezone
   decisions, and the four-file `'其他'`-key / `zh-CN`-collation bug fix (recommend as one shared change).
2. Confirm what reads `state.ts:61`'s `localeConfig.configured` before assuming it's a simple duplicate of
   `uiLocale` — not yet traced in this pass.
3. Decide, as an explicit open question in the plan (not silently in code), whether to consolidate the six
   independently-reimplemented `en`/other binary normalizations into calls to the shared `normalizeUiLocale`
   while touching all of them anyway.
4. Treat the `messages.en.ts`/`messages.fr.ts` file split and the `keyof`-based typing improvement as
   optional, separately-decidable scope — not blocking, not required, and not sourced from adopting
   `i18next`.
5. Run `plan-review` on the resulting draft plan per this repo's `planning-flow` before any implementation.
