import { isMobileViewport } from '../useMediaQuery'
import { setGalaxyAreaExpanded } from './setGalaxyAreaExpanded'
import { galaxyAreaExpanded } from './state'

export const toggleGalaxyAreaExpanded = (): void => {
  if (isMobileViewport()) return
  setGalaxyAreaExpanded(!galaxyAreaExpanded.value)
}
