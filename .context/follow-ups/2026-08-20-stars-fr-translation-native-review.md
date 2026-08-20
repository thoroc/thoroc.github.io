---
title: "Follow-up: native-speaker review of /stars's machine-translated French UI strings"
type: follow-up
status: active
date: 2026-08-20
related:
  - ../plans/2026-08-20-stars-locale-zh-to-fr.md
---

# Follow-up: native-speaker review of `/stars`'s machine-translated French UI strings

## Context

Surfaced during `plan-review` of `.context/plans/2026-08-20-stars-locale-zh-to-fr.md` (Decision 10). To
unblock that plan's merge, the ~104-key French pack in `src/stars/i18n/messages.ts` ships as a
machine-translated draft sourced from the existing English strings, rather than blocking on a
native-speaker review before merge. That review is real work, deliberately deferred rather than dropped.

## Outstanding Work

- Have a French speaker read every string in `messages.ts`'s `fr` pack against its `en` counterpart,
  covering wording, tone, and correctness — including the interpolated (`{param}`) strings, the galaxy
  legend/tooltip labels, and the lang-toggle button labels in `App.vue`.
- Fix any strings flagged, as their own small PR (not folded into unrelated work).

## Action

Set `status: done` in this file (do not delete it) once the native-speaker review has happened and any
resulting fixes have landed.
