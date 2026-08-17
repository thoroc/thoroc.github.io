---
title: "ADR candidates from the last sessions"
type: learning
date: 2026-08-17
status: active
---

# ADR candidates from the last sessions

## Learning

No ADRs exist in this repo (`docs/ADR/` absent; the `adr-capture` skill is available but unused). Four decisions from the 2026-08-16/17 sessions are strong candidates for formal capture:

1. **Lockfile discipline** — `mise.lock` must be regenerated and committed with every `mise.toml` change.
2. **`astro sync` before whole-repo gates** in CI (framework-generated types must exist before aislop/typecheck).
3. **aislop lives only in advisory `ai-hygiene`** — no standalone blocking gate; blocking enforcement stays in pre-commit hooks.
4. **`.context/` is local-only scratch** — committed truth lives elsewhere; `.gitignore` exception list is the source of truth for what's committed.

## Suggested action

Capture each as an ADR via the `adr-capture` skill (numbered `ADR-NNN` under `docs/ADR/`, with `context:` provenance
links to the relevant `.context/` files), or accept this learning file as the standing record.
