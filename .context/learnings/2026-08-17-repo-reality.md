---
title: "Repo reality: remote, .context scope, tool preference"
type: learning
date: 2026-08-17
status: active
---

# Repo reality: remote, `.context` scope, tool preference

## Learning

Several assumptions in this repo's guidance are stale, and the local-only vs committed boundary matters:

- `origin` = thoroc/thoroc.github.io **exists** and PRs are squash-merged. The "no remote / never push" warning in `ways-of-working.md` is stale — branches are pushed and PRs opened.
- `.context/` is fully gitignored — handover and learning files under it are **local-only**, never committed. Anything that must reach a fresh checkout lives in a committed path.
- Agent tooling preference that hardened: **TypeScript (bun) > shell > python3** (hooks and surface scripts are dependency-free bun TS, not `.sh` + python3/jq).

## Rules

- Treat `.context/` as local scratch; never rely on it for CI or fresh-checkout truth.
- Push branches + open PRs; do not "never push" — merge locally into `main` only for changes that stay local.
- Prefer bun TypeScript over shell/python3 when writing agent tooling in this repo.
