import * as THREE from 'three'
import { GALAXY_ZOOM } from '../constants'
import type { DollyOffsetAndDistance, OrbitControls } from './types'

/**
 * 在 [minDistance, maxDistance] 的 log 区间内按固定比例步进，避免越放大/越缩小越慢。
 * 供 resolveDollyCameraView 与 dollyCameraUniformRange 的 zoomToCursor 分支共用。
 */
export const computeDollyOffsetAndDistance = (
  controls: OrbitControls,
  camera: THREE.PerspectiveCamera,
  signedNotches: number,
): DollyOffsetAndDistance => {
  const offset = new THREE.Vector3().subVectors(
    camera.position,
    controls.target,
  )
  const distance = Math.max(offset.length(), 1e-8)
  const minD = controls.minDistance
  const maxD = controls.maxDistance
  const logMin = Math.log(minD)
  const logMax = Math.log(maxD)
  const logRange = Math.max(logMax - logMin, 1e-8)
  const logDist = Math.log(distance)
  const logDelta =
    signedNotches * GALAXY_ZOOM.RANGE_FRACTION_PER_NOTCH * logRange
  const newLogDist = Math.max(logMin, Math.min(logMax, logDist + logDelta))
  const newDistance = Math.exp(newLogDist)
  return { offset, distance, newDistance }
}
