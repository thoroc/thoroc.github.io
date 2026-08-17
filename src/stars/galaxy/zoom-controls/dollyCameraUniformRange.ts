import * as THREE from 'three'
import { computeDollyOffsetAndDistance } from './computeDollyOffsetAndDistance'
import { resolveDollyCameraView } from './resolveDollyCameraView'
import type { DollyOptions, OrbitControls } from './types'

const dollyDir = new THREE.Vector3()

/** 在 [minDistance, maxDistance] 的 log 区间内按固定比例步进，避免越放大/越缩小越慢 */
export const dollyCameraUniformRange = (
  controls: OrbitControls,
  camera: THREE.PerspectiveCamera,
  signedNotches: number,
  opts: DollyOptions = {},
): void => {
  if (!signedNotches) return

  if (opts.zoomToCursor && opts.ndc) {
    const { offset, distance, newDistance } = computeDollyOffsetAndDistance(
      controls,
      camera,
      signedNotches,
    )
    const radiusDelta = distance - newDistance

    dollyDir
      .set(opts.ndc.x, opts.ndc.y, 1)
      .unproject(camera)
      .sub(camera.position)
      .normalize()
    if (dollyDir.lengthSq() > 1e-10) {
      camera.position.addScaledVector(dollyDir, radiusDelta)
    } else {
      offset.setLength(newDistance)
      camera.position.copy(controls.target).add(offset)
    }
  } else {
    const view = resolveDollyCameraView(controls, camera, signedNotches)
    if (!view) return
    camera.position.copy(view.position)
  }
  controls.update()
}
