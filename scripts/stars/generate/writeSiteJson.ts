import fs from 'node:fs'
import { DATA_DIR, OWNER, SITE_JSON_PATH, SITE_NAME } from './constants'
import type { WriteJsonDeps } from './types'

export const writeSiteJson = (
  generatedAt: string,
  deps: WriteJsonDeps = {},
): void => {
  const { mkdirSync = fs.mkdirSync, writeFileSync = fs.writeFileSync } = deps
  mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(
    SITE_JSON_PATH,
    JSON.stringify({ owner: OWNER, title: SITE_NAME, generatedAt }, null, 2),
    'utf8',
  )
}
