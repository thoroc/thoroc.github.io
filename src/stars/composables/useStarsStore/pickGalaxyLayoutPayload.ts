import { hasValidGalaxyLayout } from '../../galaxy/layout-payload'
import type { GalaxyLayout } from './types'

export const pickGalaxyLayoutPayload = (
  remote: Partial<GalaxyLayout> | null | undefined,
): GalaxyLayout | null => {
  return hasValidGalaxyLayout(remote) ? (remote as GalaxyLayout) : null
}
