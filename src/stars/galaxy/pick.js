import * as THREE from 'three'
import { GALAXY_ZOOM } from './constants'
import { motionWorldPosition } from './motion'

const _world = new THREE.Vector3()
const _mv = new THREE.Vector3()
const _proj = new THREE.Vector3()

/**
 * 单颗星到光标的屏幕像素距离平方；不在拾取半径内或在相机后方/裁剪外时返回 null
 * @param {number} i
 * @param {object} ctx
 */
function projectStarScreenDistSq(i, ctx) {
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

  const rx = restPositions[i * 3]
  const ry = restPositions[i * 3 + 1]
  const rz = restPositions[i * 3 + 2]
  if (motionFields) {
    const [mx, my, mz] = motionWorldPosition(
      rx,
      ry,
      rz,
      motionFields,
      i,
      motionTimeSec,
    )
    _world.set(mx, my, mz)
  } else {
    _world.set(rx, ry, rz)
  }
  _world.applyMatrix4(matrix)

  _mv.copy(_world).applyMatrix4(camera.matrixWorldInverse)
  if (-_mv.z < 0.15) return null

  _proj.copy(_world).project(camera)
  if (_proj.z > 1) return null

  const sx = (_proj.x * 0.5 + 0.5) * w
  const sy = (-_proj.y * 0.5 + 0.5) * h

  const aSize = sizes ? sizes[i] : 1
  const bright = brights ? brights[i] : 0.5
  const distScale = Math.max(
    GALAXY_ZOOM.POINT_DIST_SCALE_MIN,
    Math.min(
      GALAXY_ZOOM.POINT_DIST_SCALE_MAX,
      GALAXY_ZOOM.POINT_DIST_SCALE_DIV /
        Math.max(-_mv.z, GALAXY_ZOOM.POINT_VIEW_Z_MIN),
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

/**
 * 屏幕空间拾取星点：按光标与投影点的像素距离，避免射线阈值误选前后重叠的邻居
 * @param {{
 *   camera: THREE.PerspectiveCamera,
 *   points: THREE.Points,
 *   restPositions: Float32Array,
 *   starCount: number,
 *   clientX: number,
 *   clientY: number,
 *   canvasRect: DOMRect,
 *   sizes?: Float32Array | null,
 *   brights?: Float32Array | null,
 *   pixelRatio?: number,
 *   motionFields?: import('./motion').ReturnType<typeof import('./motion').buildMotionFields> | null,
 *   motionTimeSec?: number,
 * }} opts
 * @returns {number | null}
 */
export function pickStarIndexScreen(opts) {
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

  const ctx = {
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

  let bestIdx = null
  let bestDistSq = Infinity

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
