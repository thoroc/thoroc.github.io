import { migrateLegacyPrefs } from './migrateLegacyPrefs'
import { readRawPrefs } from './readRawPrefs'
import type { StarsUiPrefs } from './types'

export const readUiPrefs = (): StarsUiPrefs => {
  return migrateLegacyPrefs(readRawPrefs())
}
