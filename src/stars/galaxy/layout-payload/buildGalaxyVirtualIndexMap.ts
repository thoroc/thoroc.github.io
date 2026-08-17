import type { VirtualStarRef } from './types'

export const buildGalaxyVirtualIndexMap = (
  virtualStars: Pick<VirtualStarRef, 'virtualKey'>[],
): Map<string, number> => {
  const map = new Map<string, number>()
  for (let i = 0; i < virtualStars.length; i += 1) {
    const star = virtualStars[i] as Pick<VirtualStarRef, 'virtualKey'>
    map.set(star.virtualKey, i)
  }
  return map
}
