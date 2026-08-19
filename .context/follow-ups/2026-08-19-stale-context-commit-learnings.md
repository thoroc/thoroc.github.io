---
title: "Follow-up: three learnings still say .context/ is gitignored and no ADRs exist"
type: follow-up
status: active
date: 2026-08-19
related:
  - ../learnings/2026-08-17-repo-reality.md
  - ../learnings/2026-08-17-adr-candidates.md
  - ../learnings/2026-08-17-process-conventions.md
---

# Follow-up: three learnings still say `.context/` is gitignored and no ADRs exist

## Context

Surfaced while implementing the plan at
`.context/plans/2026-08-19-supersede-adr-004-stars-landing-alignment.md`.
Read the standing learnings before touching `.context/`/ADR conventions
(per `AGENTS.md`'s "read the relevant entries" rule) and found three
2026-08-17 learnings that are now stale relative to the current
`CLAUDE.md`/`AGENTS.md` and to observed repo state:

- `.context/learnings/2026-08-17-repo-reality.md` states "`.context/` is
  fully gitignored — handover and learning files under it are local-only,
  never committed."
- `.context/learnings/2026-08-17-process-conventions.md` repeats the same
  claim for handover files specifically ("Local-only (`.context/` is
  gitignored)").
- `.context/learnings/2026-08-17-adr-candidates.md` states "No ADRs exist
  in this repo (`docs/ADR/` absent...)" and lists "`.context/` is
  local-only scratch" as decision candidate #4.

All three are contradicted by the current, more recent
`AGENTS.md`/`CLAUDE.md` ("`.context/**/*.md` files are committed — logs and
other non-md `.context/` files stay gitignored"), by the repo's actual
`.gitignore` (`.context/*` then explicit `!.context/**/*.md` and per-type
directory negations — confirmed via `git check-ignore -v` returning no
match for `.md` files under `.context/`), and by observed `git status`
output showing new `.context/*.md` files as untracked (`??`), not ignored.
Separately, `docs/ADR/` now holds four accepted ADRs (001–004, all dated
2026-08-19), so `adr-candidates.md`'s core premise ("no ADRs exist") and its
suggested action (capture the four listed decisions) are both already
resolved by other work.

## Outstanding Work

- Mark `.context/learnings/2026-08-17-adr-candidates.md` `status: done` (its
  suggested action — start using `adr-capture` — happened) or `superseded`,
  and correct or strike its stale "no ADRs exist" / ".context/ is
  local-only" claims.
- Correct the "`.context/` is gitignored / local-only" claim in
  `2026-08-17-repo-reality.md` and `2026-08-17-process-conventions.md` (or
  mark them superseded and fold a corrected note into a new/existing
  learning) so a future session doesn't skip committing `.context/*.md`
  files based on outdated guidance.

## Action

Set `status: done` in this file (do not delete it) once the three learnings
above are corrected or explicitly superseded.
