import type { VirtualStar } from './types'

export const buildRepoIdToVirtualIndices = (
  virtualStars: VirtualStar[],
): Map<string, number[]> => {
  const map = new Map<string, number[]>()
  for (let i = 0; i < virtualStars.length; i += 1) {
    const id = (virtualStars[i] as VirtualStar).repoId
    if (!map.has(id)) map.set(id, [])
    ;(map.get(id) as number[]).push(i)
  }
  return map
}
