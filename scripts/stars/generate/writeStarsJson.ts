import fs from 'node:fs'
import { compactStarItem } from './compactStarItem'
import { computeStats } from './computeStats'
import {
  DATA_DIR,
  DEFAULT_SORT,
  DEFAULT_UI_LOCALE,
  OWNER,
  SITE_NAME,
  STARS_JSON_PATH,
} from './constants'
import { normalizeStarItem } from './normalizeStarItem'
import type { RawGithubRepo, WriteJsonDeps } from './types'

export const writeStarsJson = (
  stars: RawGithubRepo[],
  generatedAt: string,
  deps: WriteJsonDeps = {},
): void => {
  const { mkdirSync = fs.mkdirSync, writeFileSync = fs.writeFileSync } = deps
  const normalized = stars.map(normalizeStarItem)
  const items = normalized.map(compactStarItem)
  const payload = {
    generatedAt,
    owner: OWNER,
    total: items.length,
    stats: computeStats(normalized),
    ui: {
      siteName: SITE_NAME,
      defaultSort: DEFAULT_SORT,
      defaultUiLocale: DEFAULT_UI_LOCALE,
      virtualRowHeight: 140,
      searchDebounceMs: 300,
      showLanguage: true,
      showStarsCount: true,
      showLicense: true,
    },
    items,
  }
  mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(STARS_JSON_PATH, JSON.stringify(payload), 'utf8')
}
