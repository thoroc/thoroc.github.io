import * as THREE from 'three'
import { GALAXY_ZOOM } from '../constants'
import { cameraDistanceForBox } from './cameraDistanceForBox'
import type { FitToPointsOptions, OrbitControls } from './types'

/** 根据星点范围适配相机（考虑盘面倾角，避免侧视成一条线） */
export const fitCameraToGalaxyPoints = (
  controls: OrbitControls,
  camera: THREE.PerspectiveCamera,
  positions: Float32Array,
  count: number,
  opts: FitToPointsOptions = {},
): void => {
  const padding = opts.padding ?? 1.28
  const tiltX = opts.tiltX ?? 0
  const viewDir =
    opts.viewDir ?? new THREE.Vector3(0.38, 0.52, 0.68).normalize()
  const center = new THREE.Vector3()
  const box = new THREE.Box3()
  const point = new THREE.Vector3()
  const tiltMatrix = new THREE.Matrix4().makeRotationX(tiltX)

  if (count > 0) {
    for (let i = 0; i < count; i += 1) {
      point.set(
        positions[i * 3] as number,
        positions[i * 3 + 1] as number,
        positions[i * 3 + 2] as number,
      )
      point.applyMatrix4(tiltMatrix)
      box.expandByPoint(point)
    }
    box.getCenter(center)
  } else {
    center.set(0, 0, 0)
    box.setFromCenterAndSize(center, new THREE.Vector3(40, 12, 40))
  }

  const distance = cameraDistanceForBox(camera, box, padding)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z, 1)

  controls.minDistance = Math.max(GALAXY_ZOOM.MIN_DISTANCE, maxDim * 0.005)
  controls.maxDistance = Math.max(
    GALAXY_ZOOM.MAX_DISTANCE,
    distance * 3.4,
    maxDim * 6.5,
  )

  controls.target.copy(center)
  camera.position.copy(center).add(viewDir.clone().multiplyScalar(distance))

  const far = Math.max(distance * 3.2, maxDim * 12, 2500)
  const near = Math.min(0.05, maxDim * 0.0004, distance * 0.0008)
  camera.far = Math.max(camera.far, far)
  camera.near = Math.min(camera.near, near)
  camera.updateProjectionMatrix()

  controls.update()
}
