import { hasValidGalaxyLayout } from '../../galaxy/layout-payload'
import { loadGalaxyLayout } from './loadGalaxyLayout'
import { galaxyLayoutPayload, galaxyLayoutState } from './state'
import type { GalaxyLayout } from './types'

export const ensureGalaxyLayout = (): Promise<GalaxyLayout | null> => {
  const cached = galaxyLayoutPayload.value
  if (cached && hasValidGalaxyLayout(cached)) {
    return Promise.resolve(cached)
  }
  if (!galaxyLayoutState.promise) {
    galaxyLayoutState.promise = loadGalaxyLayout().finally(() => {
      galaxyLayoutState.promise = null
    })
  }
  return galaxyLayoutState.promise
}
