import type * as THREE from 'three'
import { trackballScratch } from './scratch'
import type { TrackballControls } from './types'

/** Trackball 式自由环视（无 polar 钳制，可越过极点继续拖拽） */
export const applyTrackballRotate = (
  controls: TrackballControls,
  camera: THREE.PerspectiveCamera,
  dx: number,
  dy: number,
  viewportHeight: number,
  rotateSpeed = 1,
): void => {
  const moveLen = Math.hypot(dx, dy)
  if (moveLen < 1e-6 || !controls || !camera) return

  const {
    orbitEye,
    orbitEyeDir,
    orbitUpDir,
    orbitSideways,
    orbitMoveDir,
    orbitAxis,
    orbitQuat,
  } = trackballScratch

  orbitEye.subVectors(camera.position, controls.target)
  const angle = moveLen * rotateSpeed * (2 / Math.max(viewportHeight, 1))

  orbitEyeDir.copy(orbitEye).normalize()
  orbitUpDir.copy(camera.up).normalize()
  orbitSideways.crossVectors(orbitUpDir, orbitEyeDir).normalize()

  orbitUpDir.setLength(dy)
  orbitSideways.setLength(dx)
  orbitMoveDir.copy(orbitUpDir).add(orbitSideways)

  orbitAxis.crossVectors(orbitMoveDir, orbitEye).normalize()
  if (orbitAxis.lengthSq() < 1e-10) return

  orbitQuat.setFromAxisAngle(orbitAxis, angle)
  orbitEye.applyQuaternion(orbitQuat)
  camera.up.applyQuaternion(orbitQuat)

  camera.position.copy(controls.target).add(orbitEye)
  camera.lookAt(controls.target)
  controls.update?.()
}
