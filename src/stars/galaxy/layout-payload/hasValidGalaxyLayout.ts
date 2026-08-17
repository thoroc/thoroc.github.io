import { GALAXY_LAYOUT_VERSION } from './constants'
import { positionsFiniteRatio } from './positionsFiniteRatio'
import type { GalaxyLayout } from './types'

export const hasValidGalaxyLayout = (
  layout: Partial<GalaxyLayout> | null | undefined,
): boolean => {
  if (layout?.version !== GALAXY_LAYOUT_VERSION) return false
  if (!Array.isArray(layout.positions) || layout.positions.length < 3)
    return false
  if (layout.positions.length % 3 !== 0) return false
  return positionsFiniteRatio(layout.positions) >= 0.95
}
