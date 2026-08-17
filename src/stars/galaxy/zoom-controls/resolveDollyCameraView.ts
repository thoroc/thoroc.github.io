import type * as THREE from 'three'
import { computeDollyOffsetAndDistance } from './computeDollyOffsetAndDistance'
import type { CameraView, OrbitControls } from './types'

/** 计算 dolly 后的相机位姿（不写入场景） */
export const resolveDollyCameraView = (
  controls: OrbitControls,
  camera: THREE.PerspectiveCamera,
  signedNotches: number,
): CameraView | null => {
  if (!signedNotches) return null

  const { offset, newDistance } = computeDollyOffsetAndDistance(
    controls,
    camera,
    signedNotches,
  )
  offset.setLength(newDistance)
  return {
    position: controls.target.clone().add(offset),
    target: controls.target.clone(),
  }
}
