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

- `.agents/instructions/code-review-graph.md`
- `.agents/instructions/context-mode.md`
- `.agents/instructions/mcp-servers.md`
- `.agents/instructions/qmd.md`
- `.agents/instructions/rtk.md`
- `.agents/instructions/typescript-standards.md`
- `.agents/instructions/rule-of-three.md`

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
- Git hooks (pre-commit: lint/format; pre-push: typecheck/tests) are installed via hk (`hk install`); see `hk.pkl`.
- CI runs `hk check --all` (same linters as the pre-commit hook) plus `mise run typecheck` and `mise run test` (same as the pre-push hook).
