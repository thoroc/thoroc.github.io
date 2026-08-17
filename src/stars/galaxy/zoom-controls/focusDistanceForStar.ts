import { GALAXY_ZOOM } from '../constants'

/** 按目标屏幕像素反推飞入视距（与 StarsGalaxyView 星点顶点公式一致） */
export const focusDistanceForStar = (
  aSize: number,
  bright = 0.5,
  pixelRatio = 1,
): number => {
  const targetPx = GALAXY_ZOOM.FOCUS_TARGET_POINT_PX ?? 34
  const minD = GALAXY_ZOOM.FOCUS_STAR_MIN_DISTANCE ?? 0.09
  const maxD = GALAXY_ZOOM.FOCUS_STAR_MAX_DISTANCE ?? 3.4
  const brightMul = 0.36 + Math.max(0, Math.min(1, bright)) * 0.2
  const denom = Math.max(aSize * brightMul * pixelRatio, 0.028)
  const distScale = targetPx / denom
  const viewZ =
    GALAXY_ZOOM.POINT_DIST_SCALE_DIV /
    Math.max(distScale, GALAXY_ZOOM.POINT_DIST_SCALE_MIN ?? 1.15)
  return Math.max(minD, Math.min(maxD, viewZ))
}
