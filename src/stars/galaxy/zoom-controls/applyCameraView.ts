import type * as THREE from 'three'
import type { CameraView, OrbitControls } from './types'

export const applyCameraView = (
  controls: OrbitControls,
  camera: THREE.PerspectiveCamera,
  view: CameraView,
): void => {
  controls.target.copy(view.target)
  camera.position.copy(view.position)
  controls.update()
}
