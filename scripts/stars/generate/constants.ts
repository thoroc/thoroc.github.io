import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const DATA_DIR = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'public',
  'stars',
  'data',
)
export const STARS_JSON_PATH = path.join(DATA_DIR, 'stars.json')
export const GALAXY_JSON_PATH = path.join(DATA_DIR, 'galaxy.json')
export const SITE_JSON_PATH = path.join(DATA_DIR, 'site.json')

export const OWNER = process.env.OWNER || 'thoroc'
export const TOKEN = process.env.GITHUB_TOKEN
export const MAX_ITEMS = Number(process.env.MAX_ITEMS) || 0
export const SITE_NAME = 'Stars'
export const DEFAULT_UI_LOCALE = 'en'
export const DEFAULT_SORT = 'recently_starred'

export const STAR_MEDIA_TYPE = 'application/vnd.github.v3.star+json'
