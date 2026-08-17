import type * as THREE from 'three'

/** Mutable box object — shared module-level singletons, split across sibling files. */
export const nebulaVolumeState: {
  boxGeometry: THREE.BoxGeometry | null
  material: THREE.ShaderMaterial | null
} = {
  boxGeometry: null,
  material: null,
}
