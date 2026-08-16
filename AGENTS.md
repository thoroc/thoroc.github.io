# AGENTS.md

Agent instructions for this repository.

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
  - `mise run lint` — hk/biome check (`hk check --all`)
  - `mise run fix` — apply formatter/linter fixes
  - `mise run typecheck` — `astro check`
  - `mise run test` — `bun test`
- Pre-commit hooks are installed via hk (`hk install`); see `hk.pkl`.
