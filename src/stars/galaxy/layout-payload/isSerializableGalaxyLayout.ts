import { hasValidGalaxyLayout } from './hasValidGalaxyLayout'
import type { GalaxyLayout } from './types'

export const isSerializableGalaxyLayout = (
  layout: Partial<GalaxyLayout> | null | undefined,
): boolean => hasValidGalaxyLayout(layout)
