---
title: "Ways of Working"
type: instruction
status: active
date: 2026-07-01
---

# Ways of Working

## Golden rule — never commit to main

**ALWAYS** work on a branch. Direct commits to `main` are forbidden. Every change — no matter how small — must go through a branch, a PR, and merge into `main`.

## Worktree-first sessions

**Every agent session must call `EnterWorktree` before making any file change in this repo, and must merge back into `main` (see Branch workflow) before finishing.** This repo has no remote, so
multiple sessions — interactive and background, or several people/agents — share one local checkout. Without a worktree, a session that switches or commits on a branch changes `HEAD` for every other
session pointed at the same directory. This is not theoretical: two sessions' branch checkouts interleaved mid-task on 2026-08-10, and the second session's untracked files briefly appeared to vanish
as a result.

- Call `EnterWorktree` as the first action of any session that will `Write`/`Edit` a file or run a mutating `Bash` command (branch, commit, etc.) — read-only exploration first is fine.
- This repo sets `worktree.baseRef: "head"` in `.claude/settings.local.json`. That's required: `EnterWorktree`'s default (`"fresh"`) branches from `origin/<default-branch>`, which does not exist here.
  Do not remove that setting — without it, `EnterWorktree` cannot resolve a base ref in this repo.
- Untracked files do not carry over into a new worktree automatically. If a session already has uncommitted new files before calling `EnterWorktree`, copy them into the worktree directory after
  entering it (they live in a separate working tree, sharing only the `.git` object store).
- Run `mise trust` once per worktree directory before the first commit. `mise`'s trust is path-scoped, so a freshly created worktree path starts untrusted, and `hk`'s `mise`-shelled pre-commit jobs
  (e.g. `mermaid-validate`) fail until it's trusted.
- Finish inside the worktree per Branch workflow below, then `ExitWorktree action: "keep"`, squash-merge from the main checkout, and clean up (see After merge — squash-merged worktree branches need
  `-D`, not `-d`).
- **Caveat:** this is enforced by discipline, not a hard technical gate, for interactive/foreground sessions — there is no equivalent of `worktree.bgIsolation` (which already defaults to blocking
  background-session edits outside a worktree) for the foreground session. If this proves insufficient in practice, the next step would be a `PreToolUse` hook on `Edit|Write|Bash` that checks the
  working directory is under `.claude/worktrees/`, scoped carefully so read-only commands are never blocked.

## Branch workflow

> **Scope note - external repos vs this one.** This journal repository is local-only: it has no git remote (see the warning at the top of `AGENTS.md`). Every step below that touches a remote -
> `git pull`, `git fetch origin`, `git push`, and opening a PR/MR (steps 1, 4, 5, 6 and "After merge") - applies **only when working in an external PLG repository**. In this repo: branch from your
> local `main`, run `hk check -c`, and squash-merge the branch locally into `main`. Never push, fetch, or open a PR here.

1. **Start inside a worktree, from the latest `main`.** In this repo, call `EnterWorktree` (see Worktree-first sessions above) — it creates an isolated worktree already branched from local `main`,
   which covers this step. Do not manually run `git checkout -b` in the shared checkout. In an external repo with a remote, fetch the latest state before branching instead:

   ```bash
   git checkout main && git pull && git checkout -b <type>/<short-description>
   ```

   Never branch from a stale local `main` — a `git pull` right before `checkout -b` is mandatory.

2. Use conventional prefixes: `feat/`, `fix/`, `docs/`, `refactor/`, `chore/`.

3. Commit as you go — small, atomic commits with conventional messages:

   ```text
   feat(scorer): add D9 mutation coverage
   fix(hook): regenerate index on plan changes
   docs: update README install section
   ```

4. If `main` has diverged, rebase instead of merging:

   ```bash
   git fetch origin && git rebase origin/main
   ```

   This keeps history linear. Resolve conflicts if they arise.

5. Run checks before merging (external repos: before pushing):

   ```text
   hk check -c       # read-only gate: format, lint, types, tests, journal validation
   ```

   Use `hk check -c` (or `HK_FIX=0 hk check`) for a non-mutating run; a bare `hk check` defaults to fix mode and will rewrite files. `hk fix` applies fixes to the working tree on demand.

   `hk check -c` runs a `plan-staleness` job (see `hk.pkl`) that prints an advisory, non-blocking notice for any `.context/plans/` or `.context/follow-ups/` entry marked `active` for more than 60
   days. If you see one, don't just check the date: check whether the work it describes already landed under a different name (see "Keeping plans in sync with implementation" below) before deciding
   whether to update it.

   > Correction (2026-07-28): this used to say the check ran on pre-push. It did not exist there, or anywhere; this repo also has no remote, so a pre-push hook would never fire regardless. It is now a
   > real `hk check -c` job.

6. **External repos only** - push and open a PR:

   ```bash
   git push -u origin <branch-name>
   ```

   Use `gh pr create` or push and open via GitHub. In this local-only repo, skip this step entirely and squash-merge the branch into `main` locally instead.

## Merge strategy — always squash

**ALWAYS squash merge into `main`.** Every PR/MR lands as a single squashed commit, regardless of how many commits are on the branch. This means:

- Do not reshape or squash the branch locally to reduce commit count. Small, atomic commits on the branch are encouraged; they collapse into one commit on `main` at merge time.
- Set the merge to squash when opening or merging the PR/MR (GitLab: enable "Squash commits"; GitHub: use "Squash and merge").
- The squashed commit message should be a conventional message summarising the whole change.

## Keeping plans in sync with implementation

When you implement what a plan describes, update its frontmatter `status: active → done` in the same PR. The `context-index` hook will regenerate `.context/index.yaml` automatically.

This also applies when the connection isn't obvious. Before committing a change, check `.context/index.yaml` for active plans or follow-ups that overlap the files or problem you just touched, even if
you weren't working "from" that plan and arrived at the fix by a different route. If your change satisfies part or all of an active plan's scope, update that plan in the same commit: mark the relevant
part done, correct any design description that no longer matches what actually shipped, and note the commit that did it. Do not leave a plan describing work as still-to-do once the work is done, no
matter how it got done.

This was found missing in practice on 2026-07-28: a plan's Part B was independently solved by an unrelated commit that never touched or referenced the plan, and nothing caught the mismatch until a
manual review weeks later. The `plan-staleness` `hk check -c` job (see above) is a mechanical backstop for the same failure mode, an age-based notice, not a substitute for this discipline: it cannot
tell whether a plan's scope was quietly satisfied elsewhere, only that nobody has touched it in a while.

## After merge

**Deleting the merged branch is mandatory, not optional — never leave merged branches straggling.** As soon as a branch lands in `main`, delete it locally (GitHub auto-deletes remote branches after PR
merge):

```bash
git checkout main && git pull && git branch -d <branch-name>
```

`git branch -d` is a safe delete: it refuses any branch not fully merged, so it will never drop unmerged work — use this form in external repos, where merges are typically real merge commits.

**Squash-merged branches in this repo need `-D`, not `-d`.** Because the golden path here is squash-merge into `main` (see Merge strategy below), the branch's own commits are never ancestors of the
new squashed commit — `git branch -d` will refuse with "not fully merged" even though the content landed correctly. Once you've confirmed the squash commit is on `main` (e.g.
`git log --oneline -1 main` shows it), force-delete is expected and safe:

```bash
git worktree remove <worktree-path>   # if the branch was checked out in a worktree — required before deleting the branch
git branch -D <branch-name>
```

If merged branches have accumulated, prune them in one pass. `EnterWorktree` names branches `worktree-<name>`, not `worktree-agent-*` — match that pattern (adjust if your naming differs):

```bash
git branch --merged main | grep -vE '^\*|main$' | xargs -r git branch -d   # true merges
git branch | grep -E '^\s*worktree-' | sed 's/^\*\?\s*//' | xargs -r -n1 git branch -D   # squash-merged worktree branches — verify each is actually merged first
```
