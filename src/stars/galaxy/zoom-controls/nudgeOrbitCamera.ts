import type * as THREE from 'three'
import { GALAXY_ZOOM } from '../constants'
import { applyTrackballRotate } from './applyTrackballRotate'
import type { TrackballControls } from './types'

/** 键盘/按钮微调 orbit（绕 target 旋转） */
export const nudgeOrbitCamera = (
  controls: TrackballControls,
  camera: THREE.PerspectiveCamera,
  dAzimuth = 0,
  dPolar = 0,
): void => {
  if (!dAzimuth && !dPolar) return
  const height = 640
  const speed = GALAXY_ZOOM.ORBIT_ROTATE_SPEED ?? 2.4
  const dx = dAzimuth ? ((-dAzimuth / (2 * Math.PI)) * height) / speed : 0
  const dy = dPolar ? ((-dPolar / (2 * Math.PI)) * height) / speed : 0
  applyTrackballRotate(controls, camera, dx, dy, height, speed)
}
