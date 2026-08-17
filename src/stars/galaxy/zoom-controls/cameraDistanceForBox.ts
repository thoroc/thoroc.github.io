import * as THREE from 'three'

/** 根据包围盒与 FOV 计算合适的相机距离 */
export const cameraDistanceForBox = (
  camera: THREE.PerspectiveCamera,
  box: THREE.Box3,
  padding = 1.18,
): number => {
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z, 1)
  const fovRad = (camera.fov * Math.PI) / 180
  const fitHeight = maxDim / (2 * Math.tan(fovRad / 2))
  const fitWidth = fitHeight / Math.max(camera.aspect, 0.5)
  return Math.max(fitHeight, fitWidth) * padding
}
