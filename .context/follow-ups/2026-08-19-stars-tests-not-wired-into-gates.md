---
title: "Follow-up: /stars's DOM test suite (bunfig.stars.toml) isn't run by any gate"
type: follow-up
status: active
date: 2026-08-19
related:
  - ../plans/2026-08-19-supersede-adr-004-stars-landing-alignment.md
---

# Follow-up: `/stars`'s DOM test suite (`bunfig.stars.toml`) isn't run by any gate

## Context

Surfaced while implementing
`.context/plans/2026-08-19-supersede-adr-004-stars-landing-alignment.md`
(Phase 1). Needed to verify the shared theme module and `/stars` changes
against `/stars`'s existing 743-test, 90%-coverage-gated suite, which
requires `bun test --config=bunfig.stars.toml src/stars` (per the comment
at the top of `bunfig.stars.toml`) — a real DOM (happy-dom) plus a Vue SFC
loader preload, distinct from the root test setup.

Checked where this actually runs:

- `package.json`'s `"test"` script and `mise.toml`'s `tasks.test` both run
  only `bun test ./.agents/scripts ./.agents/hooks` — `src/stars` is not in
  the path list.
- `hk.pkl` has no reference to `bunfig.stars.toml` or `src/stars` test
  invocation.
- No `.github/workflows/*.yml` references `bunfig.stars.toml` either.

So the entire `/stars` test suite (built up across the 5-phase
`2026-08-17-stars-typescript-conversion` plan, `status: done`) runs on
nobody's command except a developer who happens to know the scoped
invocation and types it by hand. Neither `mise run test`, `hk check -c`,
nor CI catches a regression in `/stars`.

Separately, the new shared module this plan adds
(`src/lib/theme/color-theme/`) lives *outside* `src/stars/` but its tests
currently only pass under `bunfig.stars.toml`'s DOM/preload config (they
need `localStorage`/`document`, absent from the default `bunfig.toml`-less
root config) — so `bunfig.stars.toml` is no longer accurately named or
scoped now that non-stars code depends on it too.

## Outstanding Work

- Wire `bun test --config=bunfig.stars.toml src/stars src/lib/theme` (or
  the generalized equivalent) into `mise.toml`'s `tasks.test` and/or
  `hk.pkl`'s pre-push job, so `hk check -c` and CI actually exercise this
  suite. Decide whether to keep it a separate invocation (root tests +
  stars tests) or unify into one `bunfig.toml` at the repo root now that a
  non-stars module depends on the same DOM/coverage config.
- Consider renaming `bunfig.stars.toml` (and revisiting its
  stars-specific `coveragePathIgnorePatterns` comments) if it's promoted to
  a general DOM-test config rather than a `/stars`-only one.
- Re-run this suite's coverage numbers once wired in, to confirm the
  90%-threshold gate genuinely holds sitewide rather than only when someone
  remembers to run it manually.

## Action

Set `status: done` in this file (do not delete it) once `/stars` tests run
under an enforced gate (pre-push and/or CI).
