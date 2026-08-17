import { galaxyRenderStats } from './state'

export const setGalaxyRenderStats = (
  stats:
    | {
        layoutVersion?: unknown
        pointCount?: unknown
        precomputed?: unknown
      }
    | null
    | undefined,
): void => {
  galaxyRenderStats.value = {
    layoutVersion: Number(stats?.layoutVersion) || 0,
    pointCount: Number(stats?.pointCount) || 0,
    precomputed: Boolean(stats?.precomputed),
  }
}
