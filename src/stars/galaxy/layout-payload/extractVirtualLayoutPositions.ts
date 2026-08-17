import { hasValidGalaxyLayout } from './hasValidGalaxyLayout'
import type { GalaxyLayout, VirtualStarRef } from './types'

export interface ExtractedVirtualLayout {
  positions: Float32Array
  anchorIndex: number
}

export const extractVirtualLayoutPositions = (
  virtualStars: VirtualStarRef[] | null | undefined,
  layout: Partial<GalaxyLayout> | null | undefined,
  virtualIndexMap: Map<string, number> | null | undefined,
): ExtractedVirtualLayout | null => {
  if (!hasValidGalaxyLayout(layout) || !virtualIndexMap?.size) return null

  const list = virtualStars || []
  const n = list.length
  if (!n) {
    return { positions: new Float32Array(0), anchorIndex: -1 }
  }

  const positions = layout?.positions as number[]
  const out = new Float32Array(n * 3)
  let anchorIndex = -1

  for (let i = 0; i < n; i += 1) {
    const star = list[i] as VirtualStarRef
    const globalIdx = virtualIndexMap.get(star.virtualKey)
    if (globalIdx == null) return null

    const g = globalIdx * 3
    if (g + 2 >= positions.length) return null

    const x = positions[g] as number
    const y = positions[g + 1] as number
    const z = positions[g + 2] as number
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z))
      return null

    out[i * 3] = x
    out[i * 3 + 1] = y
    out[i * 3 + 2] = z

    if (
      layout?.anchorId &&
      star.repoId === layout.anchorId &&
      anchorIndex < 0
    ) {
      anchorIndex = i
    }
  }

  return { positions: out, anchorIndex }
}
