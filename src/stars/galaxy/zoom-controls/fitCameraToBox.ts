import * as THREE from 'three'
import { cameraDistanceForBox } from './cameraDistanceForBox'
import type { FitToBoxOptions, OrbitControls } from './types'

export const fitCameraToBox = (
  controls: OrbitControls,
  camera: THREE.PerspectiveCamera,
  box: THREE.Box3,
  opts: FitToBoxOptions = {},
): void => {
  const padding = opts.padding ?? 1.18
  const viewDir =
    opts.viewDir ?? new THREE.Vector3(0.38, 0.52, 0.68).normalize()
  const center = box.getCenter(new THREE.Vector3())
  const distance = cameraDistanceForBox(camera, box, padding)

  controls.target.copy(center)
  camera.position.copy(center).add(viewDir.clone().multiplyScalar(distance))
  controls.update()
}
