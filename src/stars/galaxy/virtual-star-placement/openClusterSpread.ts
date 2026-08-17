import { MORPHOLOGY_LAYOUT } from '../constants'

export const openClusterSpread = (repoCount: number, sf: number): number => {
  const { CLUSTER_SPREAD_MIN, CLUSTER_SPREAD_MAX, CLUSTER_SPREAD_LOG } =
    MORPHOLOGY_LAYOUT
  const logN = Math.log1p(Math.max(repoCount, 1))
  return (
    Math.min(
      CLUSTER_SPREAD_MAX,
      CLUSTER_SPREAD_MIN + logN * CLUSTER_SPREAD_LOG,
    ) * sf
  )
}
