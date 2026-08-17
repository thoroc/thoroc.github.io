import { GALAXY_LAYOUT_VERSION } from './constants'
import { roundPos } from './roundPos'
import type { GalaxyLayout } from './types'

export const serializeVirtualGalaxyLayout = (
  items: Array<{ id?: string }> | null | undefined,
  virtualStars: unknown[] | null | undefined,
  positions: Float32Array,
  anchorRepoIndex: number,
): GalaxyLayout => {
  const list = items || []
  const n = virtualStars?.length ?? 0
  if (!n) {
    return { version: GALAXY_LAYOUT_VERSION, anchorId: null, positions: [] }
  }

  const flat: (number | null)[] = Array.from({ length: n * 3 })
  for (let i = 0; i < n; i += 1) {
    flat[i * 3] = roundPos(positions[i * 3])
    flat[i * 3 + 1] = roundPos(positions[i * 3 + 1])
    flat[i * 3 + 2] = roundPos(positions[i * 3 + 2])
  }

  let anchorId: string | null = null
  if (anchorRepoIndex >= 0 && list[anchorRepoIndex]?.id) {
    anchorId = list[anchorRepoIndex].id as string
  }

  return {
    version: GALAXY_LAYOUT_VERSION,
    anchorId,
    positions: flat as number[],
  }
}
