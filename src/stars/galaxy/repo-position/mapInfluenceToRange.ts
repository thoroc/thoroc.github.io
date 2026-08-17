import type { InfluenceRange } from './types'

export const mapInfluenceToRange = (
  influence: number,
  range: InfluenceRange,
): number => {
  const t = Math.max(0, Math.min(1, influence)) ** range.GAMMA
  return range.MIN + t * (range.MAX - range.MIN)
}
