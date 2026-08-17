import { GALAXY_ZOOM } from '../constants'
import { motionWorldPosition } from '../motion'
import { pickScratch } from './scratch'
import type { PickContext } from './types'

/** 单颗星到光标的屏幕像素距离平方；不在拾取半径内或在相机后方/裁剪外时返回 null */
export const projectStarScreenDistSq = (
  i: number,
  ctx: PickContext,
): number | null => {
  const {
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
  } = ctx
  const { world, mv, proj } = pickScratch

  const rx = restPositions[i * 3] as number
  const ry = restPositions[i * 3 + 1] as number
  const rz = restPositions[i * 3 + 2] as number
  if (motionFields) {
    const [mx, my, mz] = motionWorldPosition(
      rx,
      ry,
      rz,
      motionFields,
      i,
      motionTimeSec,
    )
    world.set(mx, my, mz)
  } else {
    world.set(rx, ry, rz)
  }
  world.applyMatrix4(matrix)

  mv.copy(world).applyMatrix4(camera.matrixWorldInverse)
  if (-mv.z < 0.15) return null

  proj.copy(world).project(camera)
  if (proj.z > 1) return null

  const sx = (proj.x * 0.5 + 0.5) * w
  const sy = (-proj.y * 0.5 + 0.5) * h

  const aSize = sizes ? (sizes[i] as number) : 1
  const bright = brights ? (brights[i] as number) : 0.5
  const distScale = Math.max(
    GALAXY_ZOOM.POINT_DIST_SCALE_MIN,
    Math.min(
      GALAXY_ZOOM.POINT_DIST_SCALE_MAX,
      GALAXY_ZOOM.POINT_DIST_SCALE_DIV /
        Math.max(-mv.z, GALAXY_ZOOM.POINT_VIEW_Z_MIN),
    ),
  )
  const pixelSize = aSize * (0.58 + bright * 0.28) * pixelRatio * distScale
  const pickR = Math.max(
    GALAXY_ZOOM.PICK_RADIUS_MIN ?? 6,
    Math.min(
      GALAXY_ZOOM.PICK_RADIUS_MAX ?? 28,
      pixelSize * (GALAXY_ZOOM.PICK_RADIUS_SCALE ?? 0.52),
    ),
  )

  const dx = sx - clickX
  const dy = sy - clickY
  const distSq = dx * dx + dy * dy
  if (distSq > pickR * pickR) return null

  return distSq
}
