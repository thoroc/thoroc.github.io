---
title: "Regenerate mise.lock when mise.toml tools change"
type: learning
date: 2026-08-17
status: active
---

# Regenerate `mise.lock` whenever `mise.toml` tools change

## Learning

Any add/change of a tool in `mise.toml` requires regenerating the committed `mise.lock` (via `mise lock` or `mise install`) and committing it together with the `mise.toml` change.

## Evidence

CI uses `mise-action` with `mise install --locked`. A minimal-format lockfile (bare `[[tools.X]]`, no per-platform
`url`/`checksum`) fails installation on platforms it never ran on — notably `linux-x64` — cascading into `hk: not found`
on the postinstall hook. This hit twice in 24h:

- Session "Git hooks and CI/CD task pipeline sync" — regenerated lockfile committed as `51e30fd` (mise 2026.8.6, added 40 per-platform entries across 7 platforms).
- Session "Sharing config across Claude and OpenCode" — `mise.toml` added `markdownlint-cli2` but the lockfile was never regenerated; fixed by `mise install` regen, committed as `d5589ac`.

## Rule

- Run `mise lock` after editing `mise.toml`.
- Commit the regenerated `mise.lock` in the same commit as the `mise.toml` change.
- Applies even when the tool is only used by local tooling, since CI runs locked-mode installs for all pinned tools.
