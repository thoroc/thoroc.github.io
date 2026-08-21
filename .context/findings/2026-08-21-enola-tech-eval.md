---
title: "Finding: enola-labs/enola fit for thoroc.github.io"
type: finding
status: active
date: 2026-08-21
---

# Finding: enola-labs/enola fit for thoroc.github.io

> enola is not a good fit for this repo right now — its core value (declared-layer regression testing) overlaps with tooling already in place, and this repo has no layered architecture for it to protect.

## Summary

Evaluated [enola-labs/enola](https://github.com/enola-labs/enola) (Apache-2.0, Go, 173 stars, active) as a candidate addition to this project's quality-gate stack. Conclusion: skip for now.

## Detail

**What it is**: a single-binary Go CLI that indexes a repo into a dependency graph via Tree-sitter, pins that
graph before a change, and reports structural regressions against rules the user declares (layer order via
`enola-intent.yaml`, scope/spillover limits). Exits non-zero on violations for commit hooks/CI. Exposes the graph
to coding agents over MCP so they can check impact before and after edits. Supports TS/JS among many languages.

**Why it doesn't fit here**:

- **Overlap with existing tooling**: this repo already has `code-review-graph` MCP wired in for structural graph
  review and impact analysis (`get_impact_radius`, `detect_changes`, `query_graph`), plus `sigmap review-pr` for
  scope-drift/blast-radius checks in the creation pipeline (`.agents/instructions` + `mise.toml`). enola's headline
  feature — layer-violation and scope-spillover gating — duplicates ground these already cover.
- **No architecture for it to protect**: enola's value is highest where a codebase has declared layers (e.g. clean
  architecture, hexagonal) that must not be crossed. This repo is a domain-grouped Astro/TypeScript static site
  (`src/lib/<domain>/`) with no enforced layering contract — there's nothing analogous to an `enola-intent.yaml`
  layer list to write.
- **Added cost for marginal benefit**: onboarding it means another binary, another config file to maintain, and
  another hook, for a single-repo personal site with no cross-team or cross-repo boundary to enforce.

**Cheaper alternative if the underlying concern (accidental cross-domain imports, e.g. `stars/` reaching into
unrelated internals) ever bites**: a Biome/lint rule or an `aislop` custom architecture rule (`.aislop/rules.yaml`)
would catch it at far lower setup cost than a whole architecture-graph tool.

## Recommended Action

No action now. Revisit if either becomes true:

- This repo grows real layered/service boundaries worth protecting (e.g. a backend service is added).
- Cross-repo architectural intelligence becomes a real need (enola's cross-repo features would then be relevant in a way `code-review-graph`'s current single-repo scope isn't).
