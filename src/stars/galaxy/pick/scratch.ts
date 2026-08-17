import * as THREE from 'three'

/** Reused scratch vectors — avoids per-star allocation in the pick hot loop. */
export const pickScratch = {
  world: new THREE.Vector3(),
  mv: new THREE.Vector3(),
  proj: new THREE.Vector3(),
}
