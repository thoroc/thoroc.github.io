# AGENTS.md

Agent instructions for this repository.

## Shared agent configuration

This repo is developed with both Claude Code and opencode. Instructions and skills are shared between the two:

- **Instructions**: `AGENTS.md` is the single source of truth. `CLAUDE.md` is a symlink to it, so Claude Code loads the same rules (opencode reads `AGENTS.md` natively).
- **Skills**: live under `.agents/skills/<name>/SKILL.md`. `.claude/skills` is a symlink to `.agents/skills`, so Claude Code discovers them at `.claude/skills/` while opencode reads `.agents/skills/` natively — same `name` + `description` frontmatter format for both.
- **`.claude/` is a real directory** for Claude-specific config (`settings.json`, `hooks/`, `commands/`, `agents/`). Only the `skills` subdir is symlinked to the shared store, so Claude-only files never leak into the shared `.agents/` namespace.
- **Caveats**:
  - opencode resolves the same skills directory through both the `.agents/skills/` and `.claude/skills/` paths, so skill names must stay globally unique to avoid duplicate registration.
  - Agent definitions are **not** shared: opencode only loads agents from `.opencode/agents/`, while Claude Code reads `.claude/agents/`. Keep per-tool agent files in their own directories.

## Instructions

- `.agents/instructions/aislop.md`
- `.agents/instructions/code-review-graph.md`
- `.agents/instructions/context-mode.md`
- `.agents/instructions/follow-up-triage.md`
- `.agents/instructions/planning-flow.md`
- `.agents/instructions/qmd.md`
- `.agents/instructions/rtk.md`
- `.agents/instructions/rule-of-three.md`
- `.agents/instructions/skill-authoring.md`
- `.agents/instructions/theme-vocabulary.md`
- `.agents/instructions/typescript-standards.md`
- `.agents/instructions/value-rubric.md`

## Ways of working

Before making any change, read `.agents/instructions/ways-of-working.md` for the branch workflow, commit conventions, and plan-status sync rules. The short version:

1. **Create a branch from `main` first** — use `feat/`, `fix/`, `chore/` prefixes.
2. Commit atomically with conventional messages.
3. Rebase on `main` if it diverges, then merge the branch **locally** into `main` (no remote — see the warning at the top).
4. Run `hk check -c` (read-only: format, lint, types, tests, journal validation) before merging locally into `main` (never push — there is no remote).
5. **Update plan frontmatter** (`active → done`) when you implement what a plan describes.

## TypeScript Standards — Quick Checklist

**Before writing any TypeScript, hold these rules. Violations are caught by the Stop hook.**

| Rule | Requirement                                                                                                                   |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1    | Arrow functions only — `const foo = () => {}`, never `function foo() {}`                                                      |
| 2    | One function per file — exported or not; helpers go in their own file                                                         |
| 3    | Barrel `index.ts` in every directory, re-exporting all siblings                                                               |
| 4    | Tests collocated (`foo.test.ts` beside `foo.ts`), coverage ≥ 90%                                                              |
| 5    | Domain-grouped modules — never flat (`api/`, `output/`, etc.)                                                                 |
| 6    | Cliffy for all CLI parsing — no raw `process.argv`                                                                            |
| 7    | Dependency injection via function parameters — no direct `process.env` / `console.log`                                        |
| 10   | TDD — write the test file before the implementation file                                                                      |
| 11   | Extension-free imports — `from "./foo"` not `from "./foo.ts"`                                                                 |
| 12   | `dotenvx.config({ quiet: true })` as first statement in `main()`                                                              |
| 14   | Command/action split — `command.ts` declares options, `action.ts` implements logic                                            |
| 15   | Zod for shared/config types; derive `z.infer` type; CLI configs must expose `config init`, `config schema`, `config validate` |

Full rules with examples: `.agents/instructions/typescript-standards.md`

## Conventions

Follow these conventions in all new and edited code.

### Arrow functions

Use arrow functions over `function` declarations for all local functions, callbacks, and module-level helpers.

```ts
const getTagline = (p: Project) => p.tagline[lang];
```

### Barrel modules

Expose shared logic through barrel modules (`index.ts`) that re-export from the domain modules.

```ts
// src/lib/projects/index.ts
export { projects, projectTagline } from './projects';
export type { Project } from './projects';
```

Importers should depend on the barrel, not on sibling module internals.

### Tests collocation

Place a test file next to the source it tests, named `<module>.test.ts`:

```
src/i18n/
  ui.ts
  ui.test.ts
```

### One function per module

Keep each module to a single exported concern. If a module needs a second function, extract it into its own module and re-export through the barrel.

### Group modules per domain

Organise modules by domain folder rather than by type. Put all code belonging to a domain in one directory:

```
src/lib/
  projects/
    projects.ts
    projectTagline.ts
  i18n/...
```

## Tooling

- Package manager / runtime: Bun. Use `bun` commands; never add `package-lock.json` or `yarn.lock`.
- Tool versions are pinned in `mise.toml` (managed by mise). Install with `mise install`.
- Lint, format, typecheck and tests run locally and in CI:
  - `mise run lint` — `biome check` + `actionlint`
  - `mise run fix` — apply biome formatter/linter fixes
  - `mise run typecheck` — `astro check`
  - `mise run test` — `bun test`
- Git hooks (pre-commit: lint/format/aislop; pre-push: typecheck/tests/ctxharness) are installed via hk (`hk install`); see `hk.pkl`.
- CI runs `hk check --all` (same linters as the pre-commit hook) plus `mise run typecheck` and `mise run test` (same as the pre-push hook).

### Quality gates

Three agent-workflow tools are pinned in `mise.toml` (npm backend) and wired into hooks and `hk`:

- **aislop** (`mise run aislop` / `aislop scan`) — deterministic AI-slop detector, scores 0-100, gate at `ci.failBelow: 85`. Config: `.aislop/config.yml` + `.aislop/rules.yml` (committed; runtime state under `.aislop/` is gitignored). Runs on staged files in pre-commit (`aislop ci --staged`). A per-edit hook is installed for Claude Code via `.claude/settings.json`, guided by `.agents/instructions/aislop.md` — treat findings as blocking. Fix with `aislop fix --safe` or hand off with `aislop fix --claude`.
- **ctxharness** (`mise run ctx` / `ctxharness run --no-trend`) — drift detection for `AGENTS.md`/`CLAUDE.md`: file paths, npm scripts, and L2 quality (vagueness, instruction balance, token budget). Config: `.ctxharness.yml`. Runs in pre-push. Capture new claims with `ctxharness populate --apply`.
- **sigmap** (`mise run sigmap` / `sigmap gen-context`) — deterministic codebase signature map for grounded agent context. Config: `gen-context.config.json` + `.contextignore`. Copilot output is disabled (`outputs: []`); runtime tracking writes to `.context/` (gitignored). Do **not** use the `claude`/`codex` adapters — they would overwrite `CLAUDE.md`/`AGENTS.md`.

<!-- sigmap-creation-workflow:start -->
## Creation workflow (SigMap)

When creating or changing code, run the grounded-creation pipeline so each step is verified against the live index:

1. **`sigmap scaffold "<name>"`** — propose a convention-matched file/structure (refuses if conventions are inconsistent).
2. **`sigmap verify-plan <plan.md>`** — check the plan against the live index (files/symbols exist, blast radius, scope).
3. **`sigmap verify-ai-output <answer.md>`** — flag fake files/symbols/imports in the generated output (offline).
4. **`sigmap review-pr`** — audit the diff for scope drift, god-node edits, missing tests, and security files.

Or run all four in one pass with **`sigmap create "<task>"`** (`1/4`…`4/4` numbering, single pass/fail).

<sub>Generated by `sigmap --init` · refresh by re-running it.</sub>
<!-- sigmap-creation-workflow:end -->
