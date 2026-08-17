import type { GalaxyLayout } from '../../../src/stars/galaxy/layout-payload'
import type { NormalizedStarItem } from './types'

export const computeGalaxyLayoutForItems = async (
  items: NormalizedStarItem[],
): Promise<GalaxyLayout | null> => {
  if (!items.length) return null
  const { computeGalaxyLayout } = await import('../compute-galaxy-layout')
  return computeGalaxyLayout(items)
}
