import { writeStoredGalaxyAreaExpanded } from '../../storage/ui-prefs'
import { isMobileViewport } from '../useMediaQuery'
import { galaxyAreaExpanded } from './state'
import { syncQuery } from './syncQuery'

export const setGalaxyAreaExpanded = (expanded: unknown): void => {
  const next = isMobileViewport() ? false : Boolean(expanded)
  galaxyAreaExpanded.value = next
  writeStoredGalaxyAreaExpanded(next)
  syncQuery()
}
