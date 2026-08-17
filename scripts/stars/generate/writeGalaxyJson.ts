import fs from 'node:fs'
import type { GalaxyLayout } from '../../../src/stars/galaxy/layout-payload'
import { DATA_DIR, GALAXY_JSON_PATH } from './constants'
import type { WriteJsonDeps } from './types'

export const writeGalaxyJson = (
  galaxy: GalaxyLayout | null,
  deps: WriteJsonDeps = {},
): void => {
  if (!galaxy) return
  const { mkdirSync = fs.mkdirSync, writeFileSync = fs.writeFileSync } = deps
  mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(GALAXY_JSON_PATH, JSON.stringify(galaxy), 'utf8')
}
