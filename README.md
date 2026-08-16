# thoroc.github.io

Personal homepage and projects showcase. Bilingual (English / Français), built with [Astro](https://astro.build) and [Bun](https://bun.sh), deployed to GitHub Pages.

## Stack

- Astro 7 (static output)
- TypeScript, strict
- Bun (package manager + runtime)
- Plain CSS (no framework, no component library)

## Content model

There are **two files** to touch per project:

1. **`src/data/projects.yaml`** — the curated list (the whitelist). Each entry:
   - `slug` — used for the URL: `/{lang}/projects/{slug}/`
   - `name`, `featured`, `year`, `github`, `demo`, `tags`
   - `tagline.en` / `tagline.fr`
2. **`src/content/projects/{lang}/{slug}.md`** — the deep-dive write-up per language.
   Frontmatter: `lang`, `title`. Body is Markdown (`## Why it exists`, `## What it taught me`, …).

A deep-dive page is only generated if the content file exists for that language. Add a project by adding one YAML entry plus two Markdown files (one per language).

## UI strings

Site-wide text lives in `src/i18n/ui.ts` (the `ui` dictionary, `en` + `fr` keys).

## Scripts

- `bun run dev` — local dev server
- `bun run build` — build to `dist/`
- `bun run preview` — preview the build
- `bun run typecheck` — `astro check`

## Deployment

Push to `main` and a GitHub Action (`deploy.yml`) builds and deploys to GitHub Pages.
Repo settings must use **GitHub Actions** as the Pages source (not "deploy from a branch").
