import type * as THREE from 'three'
import { resolveFocusCameraView } from './resolveFocusCameraView'
import type { FocusCameraOptions, OrbitControls } from './types'

/** 定位到单颗星：优先按 aSize 反推视距，使星点在屏上足够大 */
export const focusCameraOnStarPoint = (
  controls: OrbitControls,
  camera: THREE.PerspectiveCamera,
  worldPoint: THREE.Vector3,
  opts: FocusCameraOptions = {},
): void => {
  const view = resolveFocusCameraView(controls, camera, worldPoint, opts)
  controls.target.copy(view.target)
  camera.position.copy(view.position)
  controls.update()
}
