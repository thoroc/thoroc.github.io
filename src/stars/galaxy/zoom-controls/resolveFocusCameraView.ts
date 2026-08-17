import * as THREE from 'three'
import { GALAXY_ZOOM } from '../constants'
import { cameraDistanceForBox } from './cameraDistanceForBox'
import { focusDistanceForStar } from './focusDistanceForStar'
import type { CameraView, FocusCameraOptions, OrbitControls } from './types'

/** 计算飞入单星后的相机位姿（不写入场景） */
export const resolveFocusCameraView = (
  controls: OrbitControls,
  camera: THREE.PerspectiveCamera,
  worldPoint: THREE.Vector3,
  opts: FocusCameraOptions = {},
): CameraView => {
  let distance: number
  if (opts.aSize != null && Number.isFinite(opts.aSize)) {
    distance = focusDistanceForStar(
      opts.aSize,
      opts.bright ?? 0.5,
      opts.pixelRatio ?? 1,
    )
  } else {
    const span = opts.span ?? GALAXY_ZOOM.FOCUS_STAR_SPAN
    const padding = opts.padding ?? GALAXY_ZOOM.FOCUS_STAR_PADDING
    const maxDist = opts.maxDistance ?? GALAXY_ZOOM.FOCUS_STAR_MAX_DISTANCE
    const box = new THREE.Box3().setFromCenterAndSize(
      worldPoint,
      new THREE.Vector3(span, span, span),
    )
    distance = cameraDistanceForBox(camera, box, padding)
    distance = Math.min(maxDist, distance)
  }

  const minDist = GALAXY_ZOOM.FOCUS_STAR_MIN_DISTANCE ?? 0.09
  distance = Math.max(minDist, distance)

  const offset = new THREE.Vector3().subVectors(
    camera.position,
    controls.target,
  )
  const viewDir =
    offset.lengthSq() > 1e-10 ? offset.normalize() : new THREE.Vector3()
  if (viewDir.lengthSq() < 1e-10) {
    viewDir.set(0, 0, 1)
  }

  const target = worldPoint.clone()
  const position = worldPoint.clone().add(viewDir.multiplyScalar(distance))
  return { position, target }
}
