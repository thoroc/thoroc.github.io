import * as THREE from 'three'

/** Reused scratch objects for applyTrackballRotate — avoids per-drag allocation. */
export const trackballScratch = {
  dollyDir: new THREE.Vector3(),
  orbitEye: new THREE.Vector3(),
  orbitEyeDir: new THREE.Vector3(),
  orbitUpDir: new THREE.Vector3(),
  orbitSideways: new THREE.Vector3(),
  orbitMoveDir: new THREE.Vector3(),
  orbitAxis: new THREE.Vector3(),
  orbitQuat: new THREE.Quaternion(),
}
