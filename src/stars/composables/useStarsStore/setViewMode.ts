import {
  readStoredGalaxyAreaExpanded,
  writeStoredViewMode,
} from '../../storage/ui-prefs'
import { isMobileViewport } from '../useMediaQuery'
import { ensureGalaxyLayout } from './ensureGalaxyLayout'
import { hasGalaxyExpandQuery } from './hasGalaxyExpandQuery'
import { persistSession } from './persistSession'
import { scrollListToTop } from './scrollListToTop'
import { galaxyAreaExpanded, galaxySelected, viewMode } from './state'
import { syncQuery } from './syncQuery'

export const setViewMode = (mode: string): void => {
  viewMode.value = mode === 'galaxy' ? 'galaxy' : 'list'
  if (viewMode.value === 'list') {
    galaxySelected.value = null
  } else {
    void ensureGalaxyLayout()
    if (typeof window !== 'undefined' && !hasGalaxyExpandQuery()) {
      galaxyAreaExpanded.value = isMobileViewport()
        ? false
        : readStoredGalaxyAreaExpanded()
    }
  }
  writeStoredViewMode(viewMode.value)
  persistSession()
  syncQuery()
  scrollListToTop()
}
