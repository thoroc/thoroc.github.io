---
title: "aislop / formatter alignment and workflow dedup"
type: learning
date: 2026-08-17
status: active
---

# aislop / formatter alignment and workflow dedup

## Learning

Keep `biome.json` `formatter.lineWidth` explicit, and run aislop in a single advisory workflow rather than duplicating a blocking gate.

## Evidence

- aislop reads `biome.json`'s `formatter.lineWidth` defaulting to 120; the repo was set to 80, causing format/aislop disagreement. Setting `lineWidth: 80` explicitly gives aislop 100/100.
- `aislop.yml` and `ai-hygiene.yml` both ran the identical aislop scan on the same triggers (duplication, double
  install+sync+typecheck per commit). Resolved by deleting the standalone `aislop.yml` (`53f4577`); aislop now runs only
  inside the advisory `ai-hygiene` (changed files on PR, whole repo on main). Blocking enforcement stays in pre-commit
  hooks (`hk.pkl`).
- An earlier attempt to make `ai-hygiene` depend on the gate via a bounded `gh run list` poll was built and then rejected as too complex.

## Rules

- `biome.json` `formatter.lineWidth` must be set explicitly (repo value: `80`).
- aislop lives in exactly one workflow: the advisory `ai-hygiene` report. No standalone blocking `aislop.yml`.
- Blocking AI-slop enforcement is pre-commit-only (`hk.pkl`).
