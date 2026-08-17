---
title: "happy-dom Storage mock false positive in merged Phase 2 tests"
type: follow-up
date: 2026-08-17
status: active
related:
  - "../plans/2026-08-17-stars-typescript-conversion.md"
---

# happy-dom Storage mock false positive in merged Phase 2 tests

## Issue

Bun + happy-dom's `sessionStorage`/`localStorage` are Proxy-backed. Plain property reassignment
(`localStorage.setItem = fn`) is silently a no-op — the `set` trap treats the assignment as "store a key",
not "override a method", so the built-in `setItem` keeps running underneath. A test that reassigns
`setItem`/`getItem` to force a throw or a specific return value never actually exercises that path; the
assertion passes for the wrong reason (the real implementation ran, or the "throws" branch just wasn't hit).

**Fix:** `Object.defineProperty(storage, 'method', { value: fn, configurable: true })`, which goes through
the `defineProperty` trap instead and genuinely overrides the method. Restore with a second
`Object.defineProperty` call afterward, not plain reassignment.

## Root-caused during

Phase 3 (composables) conversion, while debugging why `readCachedPageTitle.test.ts`'s "throws" test showed
persistent <100% coverage despite looking correct. Confirmed via property-descriptor inspection and a
minimal repro (`console.log`-instrumented catch block showed "DID NOT THROW" under plain assignment,
"THREW" under `defineProperty`).

## Affected (merged, out of this fix's scope)

- `src/stars/storage/ui-prefs/writeUiPrefs.test.ts:20-25` — `localStorage.setItem = () => { throw ... }`
- `src/stars/theme/color-theme/persistColorThemePreference.test.ts:16-21` — same pattern

Both are `it('does not throw when localStorage.setItem fails', ...)` tests; the throw never actually reaches
`localStorage.setItem`, so the "quota exceeded" branch these tests claim to cover is unverified.

## Already fixed (Phase 3, new files)

- `src/stars/composables/useStarsStore/readCachedPageTitle.test.ts`
- `src/stars/composables/useStarsStore/cachePageTitle.test.ts`
- `src/stars/composables/useStarsStore/clearAllFilters.test.ts`

## Action

Audit `writeUiPrefs.test.ts` and `persistColorThemePreference.test.ts`, and re-grep the rest of the repo for
`\.\(getItem\|setItem\|removeItem\|clear\) =` on `localStorage`/`sessionStorage` before considering this done.
Rewrite each hit to use `Object.defineProperty`, confirm the "throws" branch actually shows as covered
afterward (not just "test still passes"), and land as its own small fix — not folded into an unrelated PR.
