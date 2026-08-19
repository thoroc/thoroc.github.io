---
title: "Worktree dev-server gotchas: nested worktree path + pkill pattern mismatch"
type: learning
status: active
date: 2026-08-19
related:
  - ../plans/2026-08-19-supersede-adr-004-stars-landing-alignment.md
---

# Worktree dev-server gotchas: nested worktree path + pkill pattern mismatch

## Learning

Two compounding gotchas cost significant time verifying `/stars` in a
browser during the ADR-004 alignment work, both specific to this repo's
`EnterWorktree` convention (worktrees live under `.claude/worktrees/<name>/`,
nested *inside* the main checkout).

1. **A freshly created worktree has no `node_modules`.**
   `EnterWorktree`/`git worktree add` only checks out tracked files;
   `node_modules` is gitignored and not shared or copied. `bun run dev` (or
   any script) still "works" at first glance because Node/Bun's
   ancestor-directory module resolution walks *up* from the worktree
   looking for `node_modules` — and since the worktree is nested inside the
   main checkout, it finds the **main checkout's** `node_modules` and
   silently runs against it. Astro's dev server then bakes the main
   checkout's absolute path into `component-url`/`renderer-url` for
   client-hydrated islands (e.g. `client:only="vue"`), and Vite's dev
   server — correctly scoped to the worktree root — returns `403` when the
   browser tries to fetch that main-checkout path, breaking hydration with
   a confusing "Failed to fetch dynamically imported module" error that
   looks like an application bug, not an environment one.
2. **`pkill -f "astro dev"` does not match the actual process.** The
   running process's argv is `.../node_modules/astro/bin/astro.mjs dev
   --json` — `pkill -f` matches against the full command line as a single
   string, and `"astro dev"` is not a contiguous substring of `astro.mjs
   dev --json` (there's `.mjs` in between `astro` and `dev`). The pattern
   silently matches nothing, `pkill` exits without complaint, and the stale
   server (bound to the wrong `node_modules`, per gotcha 1) keeps running
   and keeps answering `curl`/browser requests on the same port through
   every subsequent "restart" attempt.

## Evidence

Hit this while manually verifying `StarsLayout.astro` in a browser (Phase 3
of `.context/plans/2026-08-19-supersede-adr-004-stars-landing-alignment.md`).
Three consecutive "clean restarts" (each preceded by `pkill -f "astro
dev"`) all still failed identically, because none of them ever killed the
original process from before `bun install` had populated the worktree's
`node_modules`. Root cause was found via `lsof -i :4321 -sTCP:LISTEN` →
`ps -p <pid> -o command` → the command showed `node_modules/astro/bin/
astro.mjs` resolving to the **main checkout** path, not the worktree path,
despite `cwd` correctly showing the worktree.

## Rules

- **Run `bun install` in a fresh worktree before starting any dev server or
  running any script that shells out to a `node_modules/.bin/*` tool** — do
  not assume a worktree inherits or shares the parent checkout's installed
  packages.
- If a package manager's own security-scanning wrapper (e.g. an
  `npq`/`npq-hero` shell alias intercepting `bun`) blocks a non-interactive
  `install` from actually installing anything (exits 0, prints scan
  findings, `node_modules` stays empty), and the exact same dependency set
  is already installed and running in the parent checkout (i.e. nothing
  new is being introduced), it's reasonable to invoke the real underlying
  binary directly for that one operation rather than fight the wrapper
  non-interactively — but do not do this for genuinely new/unvetted
  dependencies.
- **Kill dev-server processes by PID, not by a guessed `pkill -f`
  pattern.** Confirm the actual running command first (`lsof -i :<port>
  -sTCP:LISTEN` → `ps -p <pid> -o command`) rather than assuming a pattern
  like `"astro dev"` matches — build tool CLIs commonly invoke
  `<tool>.mjs <subcommand>`, not a bare `<tool> <subcommand>` string.
- After any restart intended to pick up a fresh `node_modules` or code
  change, verify the *new* PID's resolved script path (`ps -p <pid> -o
  command`) actually points inside the worktree before trusting further
  browser checks against it — a same-port "successful" restart can still
  be the old stale process if the kill silently no-opped.
