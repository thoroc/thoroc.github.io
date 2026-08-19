---
title: "ADR-003: No automated test tooling for presentational Astro UI components"
status: accepted
date: 2026-08-19
context:
  - path: .context/plans/2026-08-19-retro-design-system.md
---

**Status:** Proposed
**Date:** 2026-08-19

## Context

This repo's TypeScript standards (`typescript-standards.md`) require
colocated tests at ≥90% coverage for `.ts` modules. Introducing the first
components under `src/components/ui/` (`Button.astro`, `Badge.astro`,
`SiteHeader.astro` — see ADR-002) raised the question of whether that same
bar applies to `.astro` files, since none exists in the repo yet and a
plan-review pass flagged the absence of any stated test strategy for them
as a gap.

## Decision

Do not introduce component-test tooling for `Button.astro`, `Badge.astro`,
or `SiteHeader.astro`. The ≥90% coverage rule in `typescript-standards.md`
applies to `.ts` modules; it was never written with `.astro` templates in
mind, and three small presentational components don't justify standing up
a new test harness. They are verified by manual dev-server checks (render
with sample props/slots across variants) as part of implementation.

## Consequences

- No new test framework, config, or CI step was introduced for this pass.
- Regressions in these three components will only be caught by manual
  review or visual inspection, not by an automated suite — acceptable for
  a personal site with a single maintainer, but worth revisiting if the
  component library grows past a handful of components or gains real
  interactive logic (not just markup/variants).
- This ADR exists so the gap is a documented, deliberate choice rather than
  a silent omission a future reviewer has to re-discover and re-debate.
