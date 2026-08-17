---
title: "Process conventions that landed"
type: learning
date: 2026-08-17
status: active
---

# Process conventions that landed

## Learning

Process rules that were established and validated across the 2026-08-16/17 sessions:

- **Handover files:** `.context/handover/<date>-<slug>.md` written at session end (rule added to `.agents/RULES.md`, validated by rules-management). Local-only (`.context/` is gitignored).
- **Branch workflow:** branch from `main` → atomic conventional commits → rebase on `main` if diverged → `hk check -c` green → squash-merge PR → delete local branch with `-D` after merge.
- **Plumber config quirk:** `.plumber.yaml` deliberately sets `branchMustBeProtected: enabled: false` — `main` is
  ruleset-protected and plumber v0.4.x reads only classic branch protection (would be a false-positive).
- **Workflow set on main:** `ci.yml`, `deploy.yml`, `plumber.yml`, `ai-hygiene.yml` (no standalone aislop).

## Rules

- Write a handover file at session end.
- Follow branch → atomic commits → rebase → `hk check -c` → squash-merge.
- Don't re-enable `branchMustBeProtected` while plumber v0.4.x is pinned.
