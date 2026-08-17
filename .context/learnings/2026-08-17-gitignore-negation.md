---
title: "gitignore negation: re-include the directory, not just the files"
type: learning
date: 2026-08-17
status: active
---

# gitignore negation: re-include the directory, not just the files

## Learning

To un-ignore files inside an ignored directory, you must re-include the directory itself first — file-level negations alone are dead weight.

## Evidence

2026-08-17: `.context/` was fully gitignored. The intent became to track `.context/**/*.md` (learnings, handovers, index) while keeping logs and other non-md files ignored. The repo `.gitignore` got:

```gitignore
.context/*
!.context/index.yaml
!.context/handover/
!.context/learnings/
!.context/**/*.md
```

`git check-ignore` still reported every `.context/` file as ignored — matching rule
`/Users/thomas.roche/.gitignore:212:.context/`, i.e. a **global** `~/.gitignore` rule excluding the directory. Because
`.context/` itself was never re-included, git treats everything beneath it as unreachable and the file negations never
bite.

Working form (mirrors the `.agents/` pattern used in the same file):

```gitignore
.context/*
!.context/
!.context/handover/
!.context/learnings/
!.context/index.yaml
!.context/**/*.md
```

Verified: md files no longer ignored (check-ignore exit 1), logs/gain.ndjson/usage.json still ignored (exit 0).

## Rules

- When un-ignoring files under an ignored dir, add `!<dir>/` for the directory itself, then `!<dir>/**/*.md` for the files.
- Suspect a global ignore: `git check-ignore -v <path>` prints the matching rule and its source file — if it points
  at `~/.gitignore` (or `core.excludesFile`), repo-level negations are being shadowed.
- Verify with `git check-ignore` before committing; a green status output is not proof the file is tracked.
