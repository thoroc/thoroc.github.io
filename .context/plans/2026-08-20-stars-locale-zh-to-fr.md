---
title: "Plan: Replace /stars's internal zh-CN UI locale with fr"
type: plan
status: active
date: 2026-08-20
effort: "L"
value: "MEDIUM"
themes:
  - TOOLING
related:
  - ../findings/2026-08-20-stars-locale-zh-to-fr-findings.md
  - ../follow-ups/2026-08-19-stars-locale-zh-to-fr.md
  - ../follow-ups/2026-08-20-stars-fr-translation-native-review.md
---

## Goal

Replace `/stars`'s internal `zh-CN`/`en` UI-language toggle with `fr`/`en`, with `en` as the default —
matching the sitewide `en`/`fr` locale *values* — without silently carrying forward the two bugs the
findings pass surfaced along the way. "Matching" means value-parity only (the same two locale codes): the
`/stars` toggle's placement, wording, and UX remain intentionally independent of the sitewide `en`/`fr`
switcher, per the originating follow-up's framing of these as two separate systems. This is entirely
separate from the sitewide `src/i18n/` locale system and from the ADR-004/landing-alignment branch; neither
is touched by this plan.

Grounded in `.context/findings/2026-08-20-stars-locale-zh-to-fr-findings.md` (the findings pass) and
`.context/follow-ups/2026-08-19-stars-locale-zh-to-fr.md` (the originating follow-up, to be set
`status: done` once this plan lands).

## Scope

**In scope**: every file in the ~23-file grep set (`src/stars/i18n/*`, `src/stars/storage/ui-prefs/*`,
`src/stars/composables/useStarsStore/*` locale-related files, the four galaxy-renderer consumers with the
collation/key-conflation bugs, `formatRepoDate.ts`, `App.vue`'s lang-toggle markup) plus their test files.

**Out of scope**:
- Adopting `i18next` or a per-locale-JSON *library* structure for `messages.ts` (see Decision 3 below).
- The sitewide `en`/`fr` locale system in `src/i18n/` — unrelated, already correct, not touched.
- The ADR-004/`/stars`-landing-alignment plan and branch — a separate, already-shipped unit of work.
- The galaxy WebGL canvas's rendering colors — unrelated to UI locale.
- The document-level `lang` attribute on `/stars`'s host page (`StarsLayout.astro` currently hardcodes
  `lang="en"`) — a distinct, already-flagged, English-only site-chrome concern belonging to the ADR-004
  plan, not this one.

## Decisions

Resolved before drafting this plan:

1. **Target swap: `zh-CN` → `fr`, `en` as default.** Confirmed by the user in the originating follow-up —
   this is the "Mandarin" issue raised earlier in the session. English and French remain the site's only
   two languages; no other locale is added.
2. **Independent unit of work.** This plan ships on its own branch/PR, never folded into the ADR-004
   landing-alignment branch.
3. **Do not adopt `i18next`/mcpx-cli's per-locale-JSON *library* structure** (editorial, from the findings
   pass's corrected mcpx-cli comparison). The dependency footprint, the OS-env-var-vs-in-app-toggle
   locale-negotiation mismatch, and the 15-vs-2-locale scale mismatch all argue against it; the earlier
   "current typing is stronger" justification was checked directly against `types.ts` and found false
   (`MessagePack = Record<string, string>` has no compile-time key checking either way), so it plays no
   part in this decision. This decision is about the *library and file-format* question only — it does not
   pre-answer Decision 12 below, which is a narrower, unrelated question: whether to split the existing
   plain object literal across two files for editability, with no library involved either way.
4. **The unconditional `zh-CN` collation calls are bugs, not a feature to preserve.** `countBy.ts`,
   `buildLanguageLayout.ts`, `buildTopicRingKeySet.ts`, and `buildLanguageLegend.ts` all sort with
   `localeCompare(..., 'zh-CN')` regardless of the active UI locale. Fixed as one shared change (Phase 4),
   not replicated in French and not left as four independent point-fixes.
5. **Phases 2, 3, and 4 run as parallel waves, not a strict sequence.** They touch disjoint file sets
   (translator/messages/`App.vue`; `Intl` date formatting; galaxy-renderer collation/keys) and each depends
   only on Phase 1 having landed, not on each other's output. Phase 5 depends on all three. Sequencing them
   strictly (1→2→3→4→5) would leave available parallelism on the table for no correctness reason.
6. **`hk check -c` runs after each phase, not only at the end**, matching this repo's convention on other
   multi-phase plans (e.g. `2026-08-19-supersede-adr-004-stars-landing-alignment.md`). Branch naming follows
   `ways-of-working.md` (`fix/`-prefixed, since this is a bug/behavior fix, not a new feature).
7. **Stored/legacy `'zh-CN'` preference resets silently to `en`** — resolved during `plan-review`
   (3-reviewer audit: Technical + Strategic on Claude Sonnet 5, Risk on Claude Haiku 4.5), put to the user
   as a genuine tradeoff. A returning user with `'zh-CN'` already persisted (localStorage or a bookmarked
   `?lang=zh-CN` URL) is treated as an unrecognized value and falls through to the new default — not
   migrated to `fr`. Simplest, safest, and consistent with how the allowlist already treats any
   unrecognized value today. Referenced in Phase 1, task 2.
8. **Phase 4's shared collator is locale-neutral and fixed**, not UI-locale-aware — also resolved during
   `plan-review`. Tie-break sort order in the four galaxy-renderer files does not change when the user
   toggles `en`/`fr` — predictability over sort-order-follows-language. Referenced in Phase 4, task 1.
9. **`createTranslator.ts`'s fallback pack falls back to `en`**, fixing the bug rather than replicating it
   in French. An unrecognized locale or a missing key now resolves to English text, not silently to French.
   Referenced in Phase 2, task 1.
10. **Translation content ships as a machine-translated French draft now**; a native-speaker review pass is
    tracked as a separate follow-up rather than blocking this plan's merge. See
    `.context/follow-ups/2026-08-20-stars-fr-translation-native-review.md`. Referenced in Phase 2, task 2.
11. **French `Intl` locale tag: `'fr-FR'`, timezone: the viewer's browser-local timezone** (not a hardcoded
    `Europe/Paris`, and not the `zh-CN`/`Asia/Shanghai` pattern carried over literal-for-literal) — avoids
    showing Paris-local times to a reader in a different timezone. Applied consistently to both
    `formatGeneratedAt.ts` and `formatRepoDate.ts`. Referenced in Phase 3, task 1.
12. **The `messages.en.ts`/`messages.fr.ts` file split and `keyof`-based typing improvement ship in this
    plan's Phase 5**, not deferred to a separate follow-up. Referenced in Phase 5, task 4.
13. **`state.ts:61`'s `localeConfig.configured` is not a duplicate of `uiLocale`'s default — it resolves
    Open Question 1.** Traced during Phase 1, task 1: it's the per-deployment configured default locale,
    read from `stars.json`'s `ui.defaultUiLocale` field (`loadData.ts`), itself sourced from
    `scripts/stars/generate/constants.ts`'s `DEFAULT_UI_LOCALE` (already `'en'`) and consumed as the
    `fallback` argument to `resolveUiLocale` in `applyQuery.ts` when no query param or stored preference is
    present. Distinct purpose, but the fix is the same as `uiLocale`'s: its own hardcoded pre-load initial
    value changes from `'zh-CN'` to `'en'` alongside `uiLocale`'s, per Decision 1 — no scope growth.

## Phases

### Phase 1 — Core locale resolution

0. Confirm no in-flight branch (e.g. the ADR-004/landing-alignment or retro-design-system work) has pending,
   unmerged edits to the files this phase and Phase 2-4 touch (`App.vue`, `state.ts`, `formatRepoDate.ts` in
   particular) — check before opening this plan's branch, not after hitting a merge conflict.
1. Trace every consumer of `state.ts:61`'s `localeConfig.configured` box before touching it — confirm
   whether it's a plain duplicate of `uiLocale`'s default or carries distinct meaning. **Done — see
   Decision 13**: it's the per-deployment configured default, distinct from `uiLocale`, but its own
   hardcoded initial literal changes the same way.
2. Swap the literal fallback from `'zh-CN'` to `'fr'`, and the default-locale literal from wherever it
   currently reads `'zh-CN'` to `'en'` (per Decision 1), across: `normalizeUiLocale.ts`,
   `resolveUiLocale.ts`, `readStoredUiLocale.ts`, `writeStoredUiLocale.ts`, `setUiLocale.ts`, `state.ts`,
   `resetStateForTests.ts`. Include an explicit test case for a stored/legacy `'zh-CN'` value being read
   back post-swap and resetting to `en` (Decision 7). **Implementation-time finding**: `syncQuery.ts` and
   `setUiLocale.ts` both write an explicit `?lang=` URL marker for whichever locale is *not* the default —
   previously `en` (since `zh-CN` was default), now `fr` (since `en` is default per Decision 1). This is a
   direct, necessary consequence of Decision 1, not new scope: both files' marker condition flips from
   `=== 'en'` to `=== 'fr'`, with matching test updates in `syncQuery.test.ts` and `setUiLocale.test.ts`.
3. Consolidate the independently-reimplemented `value === 'en' ? 'en' : <other>` binary checks to call the
   shared `normalizeUiLocale` instead of reimplementing inline. **Implementation-time correction**: only
   `writeStoredUiLocale.ts` and `setUiLocale.ts` actually duplicate this shape — `resolveUiLocale.ts`
   already calls `normalizeUiLocale` (the findings pass was wrong on this one file), `readStoredUiLocale.ts`
   has a different allowlist contract (returns `''` for unset, not "the other locale" — not safe to
   collapse into `normalizeUiLocale`), `state.ts`/`resetStateForTests.ts` hold plain default literals with
   nothing to call, and `createTranslator.ts`'s fallback-*pack* lookup is a distinct concept governed by
   Decision 9 in Phase 2, not this task. Land as a separate commit from task 2's literal swap, so a
   regression can be attributed to the content change or the refactor, not both at once.
4. Update the corresponding test files' literals and assertions — several currently assert the pre-swap
   direction (e.g. `'fr'` normalizing to `'zh-CN'`) and will invert, not just need a renamed literal.

**Exit criterion**: `bun test --config=bunfig.stars.toml src/stars/i18n src/stars/storage/ui-prefs src/stars/composables/useStarsStore`
passes with zero `zh-CN` literals remaining in the touched files (confirm by re-grep, not by test pass
alone).

### Phase 2 — Translator fallback and message content

1. Implement `createTranslator.ts`'s fallback-pack behavior per Decision 9 (falls back to `en`).
2. Write the ~104-key French pack in `messages.ts` **from the existing English strings**, not from the
   outgoing Chinese pack — translating the Chinese source risks semantic drift from the English wording
   already used elsewhere in the app, since `en` is the canonical source of truth going forward. Ship as a
   machine-translated draft per Decision 10 — do not block this task on a native-speaker review.
3. Update `App.vue`'s lang-toggle markup (`langZh`/`langEn` message keys and button labels) to reflect the
   `fr`/`en` pair, with a component-level test covering the toggle's re-render and label output (not only a
   manual dev-server check), matching this repo's TypeScript-standards coverage convention.
   **Implementation-time finding**: `App.vue`'s `homeHref` computed had a third instance of the same
   en-vs-default `?lang=` marker bug found in Phase 1 (task 2) — fixed and tested alongside the toggle
   markup, same fix as `syncQuery.ts`/`setUiLocale.ts`.

**Done.** `messages.test.ts`'s key-parity assertion passes for the `en`/`fr` pair; `createTranslator.test.ts`
covers the missing-key-falls-back-to-`en` case (Decision 9). Manual toggle check pending Phase 5's
verification pass.

### Phase 3 — Intl-dependent date formatting

1. Apply Decision 11's resolved locale tag and timezone (`'fr-FR'`, viewer's browser-local timezone) to
   **both** files below — they must not drift independently (e.g. one landing on `'fr-FR'` and the other on
   plain `'fr'`).
2. Add the French branch to `formatGeneratedAt.ts` (replacing or repointing its current non-`en`
   `zh-CN`/`Asia/Shanghai` branch) and update its test's non-`en`-default assertion.
3. Add the French branch to `formatRepoDate.ts`. Per Decision 1 (`en`/`fr` are the only two locales going
   forward), this is a clean two-way branch — no residual `zh-CN`-shaped case remains or needs deciding.
   Its default parameter changes to `'en'` (not `'fr'`), matching Phase 1's pattern: an omitted-locale
   default is the app's real default (`en`), while the non-`en` branch itself is what became `'fr'`. All
   three real call sites (`StarCard.vue`) already pass an explicit locale, so this default is a safety
   fallback, not load-bearing behavior.

**Done.** Both files' tests assert French-formatted output for the `fr` locale case (verified against this
repo's actual ICU output, not guessed); neither file's default parameter or fallback branch still reads
`'zh-CN'`. `formatGeneratedAt.ts`'s French branch drops the hardcoded `Asia/Shanghai` timezone entirely
(per Decision 11, browser-local) rather than substituting a hardcoded `Europe/Paris`.

### Phase 4 — Galaxy-renderer collation and key-conflation fixes

0. Grep the **entire repo** (not just `src/stars`) for `其他`, including test fixtures and any snapshot
   files, *before* making any edit in this phase — the findings pass only confirmed consumers within the
   four named files and `buildTopicRingKeySet.test.ts`; this task exists to catch anything outside that set
   before it breaks, not to discover it afterward.
1. Replace the unconditional `localeCompare(..., 'zh-CN')` tie-break in `countBy.ts`,
   `buildLanguageLayout.ts`, `buildTopicRingKeySet.ts`, and `buildLanguageLegend.ts` with one shared,
   locale-neutral collator per Decision 8 (fixed sort order, does not follow the `en`/`fr` toggle) — a
   single fix threaded through all four call sites, not four independent edits. Land as its own commit,
   separate from task 2's key rename, so either can be reverted independently if one proves wrong.
2. Replace the `'其他'` map/composite-string-key literal in `buildLanguageLayout.ts`,
   `buildTopicRingKeySet.ts`, and `buildLanguageLegend.ts` with a locale-neutral internal key, decoupling
   the data key from the `otherLang` display label already in `messages.ts`. Land as its own commit (see
   task 1).
3. Update every test that string-matches the old key directly, including `buildTopicRingKeySet.test.ts`'s
   composite-key assertion (currently `'其他\0legacy'`), plus any fixture/snapshot file task 0 surfaced.
4. Re-grep the entire repo for `其他` again after the edit lands, confirming task 0's pre-edit sweep and the
   edit itself together leave zero hits.
5. **Done.** Manually verified in the running dev server (`bun install` first — a fresh worktree has no
   `node_modules`; a hand-crafted `public/stars/data/stars.json` fixture with six repos across five tied
   languages plus one no-language repo, since local dev has no real generated data). Confirmed via live DOM
   (not a screenshot — see below): the sidebar language list renders `Other, C++, Go, Python, Rust, Vue`
   under `en` and `Autre, C++, Go, Python, Rust, Vue` under `fr` — **identical underlying order**, only the
   "other" bucket's display label changes, exactly matching Decision 8. No console errors during the
   toggle. French UI content (Phase 2) also confirmed rendering correctly live (`Échec du chargement de
   stars.json`, `Filtres`, `Mis à jour … Données issues de l'API GitHub`).
   **Caveat**: the galaxy WebGL canvas's own *visual* rendering could not be screenshotted — headless
   Chromium renders the `/stars` page's layout as a collapsed near-zero-height container below the header,
   reproducible even with zero data loaded (i.e. before any of this plan's code runs) and on the unmodified
   landing page's sibling route working fine, so it is a pre-existing/environment rendering quirk, not a
   regression from this plan's changes. The sidebar-list check above exercises the identical
   `countBy`/`stableCollator` code path the galaxy renderer calls, so the collation fix itself is verified;
   only the WebGL canvas's pixel-level appearance is unconfirmed.

**Exit criterion**: sort output for tied entries no longer depends on `'zh-CN'` collation rules under any
UI locale; no test, fixture, or production file references `'其他'` as a key (display text sourced from
`messages.ts` is unaffected); task 5's manual dev-server check has been performed and recorded (above), not
merely implied by green tests.

### Phase 5 — Verification

1. Run the full `/stars` suite (`bun test --config=bunfig.stars.toml src/stars`) and root `hk check -c`;
   confirm zero failures (per this project's testing convention — do not sum "passed" counts across
   suites).
2. Re-grep the repo for stray `zh-CN`/`zh_CN`/`'zh'`/`其他` literals to confirm nothing was missed.
3. Check `README.md` and `docs/*.md` for any `/stars`-feature references to the `zh-CN`/Chinese toggle and
   update them if found, per this project's standing session-end documentation convention.
4. Implement the `messages.en.ts`/`messages.fr.ts` file split and `keyof typeof messages.en`-based typing
   on `MessagePack`/`Translator` per Decision 12 (ships in this phase, not deferred), with tests covering
   the new typed key surface.

**Exit criterion**: `hk check -c` passes clean; the originating follow-up
(`.context/follow-ups/2026-08-19-stars-locale-zh-to-fr.md`) is set `status: done`.

## Risks

- **Collation fix changes visible sort order.** Fixing the unconditional `zh-CN` tie-break (Phase 4) can
  shift which tied entries appear first in galaxy groupings that were previously stable under the bug —
  needs a visual/behavioral check in the running dev server, not just a passing unit test.
- **`'其他'` key rename has untraced consumers.** The findings pass confirmed the key is composite-string-
  matched by at least one test; a consumer outside the four files already identified would silently break
  bucket grouping if missed. Phase 4 tasks 0 and 4 grep the whole repo both before and after the edit — a
  post-edit-only grep finds the break after it's already shipped, which is why both passes are required.
- **Fallback-pack fix (Decision 9) changes missing-key behavior.** Any code currently relying on the
  present zh-CN-as-universal-fallback behavior for a missing key will see English instead — worth an
  explicit check in Phase 2 (covered by the exit criterion's new missing-key test case), not just a literal
  rename.
- **Translation quality.** The initial French content is machine-translated (Decision 10) — a user-facing
  surface with wording/tone risk until the native-speaker review tracked in
  `.context/follow-ups/2026-08-20-stars-fr-translation-native-review.md` lands.
- ~~`localeConfig.configured` scope creep.~~ Resolved (Decision 13): its only consumers are `loadData.ts`
  and `applyQuery.ts`, both already in Phase 1's file list; no hidden scope surfaced.

## Open Questions

None outstanding. The sole item (`state.ts:61`'s `localeConfig.configured`) was resolved during Phase 1,
task 1's trace — see Decision 13.

## Verification

- `bun test --config=bunfig.stars.toml src/stars` — zero `FAILED`/`test result: FAILED` across every suite
  (per this project's testing convention: never confirm success by summing "passed" counts), run after each
  phase (Decision 6), not only at the end.
- `hk check -c` (format, lint, types, tests) passes clean before merge.
- Manual check in the running dev server: toggle to French, confirm every UI surface the dictionary covers
  renders French text, galaxy legend/tooltip labels included; confirm dates render with `fr-FR` formatting
  in the viewer's own browser-local timezone (Decision 11), not a hardcoded Paris time.
- Confirm a stored/legacy `'zh-CN'` preference resets to `en` on load, not to `fr` (Decision 7).
- Confirm galaxy-view tie-break sort order is identical under `en` and `fr` (Decision 8) — the collation
  fix must not introduce a locale-dependent sort.
- Re-grep the **entire repo** (not just `src/stars`) for `zh-CN`/`zh_CN`/`'zh'`/`其他` post-implementation —
  zero hits outside anything explicitly and deliberately retained (should be none).
- `.context/follow-ups/2026-08-20-stars-fr-translation-native-review.md` exists and is filed before this
  plan's branch merges (Decision 10).
