import { projectStarScreenDistSq } from './projectStarScreenDistSq'
import type { PickContext, PickOptions } from './types'

/** 屏幕空间拾取星点：按光标与投影点的像素距离，避免射线阈值误选前后重叠的邻居 */
export const pickStarIndexScreen = (opts: PickOptions): number | null => {
  const {
    camera,
    points,
    restPositions,
    starCount,
    clientX,
    clientY,
    canvasRect,
    sizes = null,
    brights = null,
    pixelRatio = 1,
    motionFields = null,
    motionTimeSec = 0,
  } = opts

  if (!camera || !points || !restPositions || starCount <= 0) return null

  points.updateMatrixWorld(true)
  const matrix = points.matrixWorld
  const clickX = clientX - canvasRect.left
  const clickY = clientY - canvasRect.top
  const w = canvasRect.width
  const h = canvasRect.height
  if (w <= 0 || h <= 0) return null

  const ctx: PickContext = {
    camera,
    matrix,
    restPositions,
    motionFields,
    motionTimeSec,
    w,
    h,
    clickX,
    clickY,
    sizes,
    brights,
    pixelRatio,
  }

  let bestIdx: number | null = null
  let bestDistSq = Number.POSITIVE_INFINITY

  for (let i = 0; i < starCount; i += 1) {
    const distSq = projectStarScreenDistSq(i, ctx)
    if (distSq === null) continue
    if (distSq < bestDistSq) {
      bestDistSq = distSq
      bestIdx = i
    }
  }

  return bestIdx
}
