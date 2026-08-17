import * as THREE from 'three'
import { GALAXY_ZOOM } from '../constants'
import type { FitInsideObserverOptions, OrbitControls } from './types'

/** 宇宙内观测：相机置于球心附近，环顾四周（类似地表仰望星空） */
export const fitCameraInsideObserver = (
  controls: OrbitControls,
  camera: THREE.PerspectiveCamera,
  positions: Float32Array,
  count: number,
  opts: FitInsideObserverOptions = {},
): void => {
  const padding = opts.padding ?? 1.06
  let maxR = 1
  let cx = 0
  let cy = 0
  let cz = 0
  for (let i = 0; i < count; i += 1) {
    cx += positions[i * 3] as number
    cy += positions[i * 3 + 1] as number
    cz += positions[i * 3 + 2] as number
  }
  if (count > 0) {
    const inv = 1 / count
    cx *= inv
    cy *= inv
    cz *= inv
    for (let i = 0; i < count; i += 1) {
      const dx = (positions[i * 3] as number) - cx
      const dy = (positions[i * 3 + 1] as number) - cy
      const dz = (positions[i * 3 + 2] as number) - cz
      maxR = Math.max(maxR, Math.sqrt(dx * dx + dy * dy + dz * dz))
    }
  }
  maxR = Math.max(maxR * padding, 52)

  controls.minDistance = Math.max(
    GALAXY_ZOOM.MIN_DISTANCE,
    maxR * (GALAXY_ZOOM.OBSERVER_MIN_DISTANCE_FRAC ?? 0.0045),
  )
  controls.maxDistance = maxR * GALAXY_ZOOM.OBSERVER_MAX_DISTANCE_MULT

  const defaultMult =
    opts.defaultDistanceMult ??
    GALAXY_ZOOM.OBSERVER_DEFAULT_DISTANCE_MULT ??
    0.28
  const defaultDist = Math.max(
    controls.minDistance * 2.2,
    Math.min(maxR * defaultMult, controls.maxDistance * 0.82),
  )

  const viewDirRaw = opts.viewDir ??
    GALAXY_ZOOM.OBSERVER_VIEW_DIR ?? [0.34, 0.46, 0.82]
  const viewDir = Array.isArray(viewDirRaw)
    ? new THREE.Vector3(viewDirRaw[0], viewDirRaw[1], viewDirRaw[2]).normalize()
    : viewDirRaw.clone().normalize()

  controls.target.set(cx, cy, cz)
  camera.position.copy(controls.target).add(viewDir.multiplyScalar(defaultDist))
  camera.lookAt(controls.target)

  const far = Math.max(maxR * 3.6, 2800)
  const near = Math.min(0.012, maxR * 0.00012, controls.minDistance * 0.08)
  camera.far = Math.max(camera.far, far)
  camera.near = Math.min(camera.near, near)
  camera.updateProjectionMatrix()
  controls.update()
}
