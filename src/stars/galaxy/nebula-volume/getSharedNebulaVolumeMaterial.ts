import * as THREE from 'three'
import { nebulaVolumeFragmentShader, nebulaVolumeVertexShader } from './shaders'
import { nebulaVolumeState } from './state'
import type { SharedUniforms } from './types'

export const getSharedNebulaVolumeMaterial = (
  sharedUniforms: SharedUniforms | null = null,
): THREE.ShaderMaterial => {
  if (!nebulaVolumeState.material) {
    nebulaVolumeState.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: sharedUniforms?.uTime ?? { value: 0 },
        uLangTint: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
        uEllipsoid: { value: new THREE.Vector3(40, 32, 38) },
        uSeed: { value: 0.5 },
        uStepCount: { value: 10 },
        uInvModelMatrix: { value: new THREE.Matrix4() },
      },
      vertexShader: nebulaVolumeVertexShader,
      fragmentShader: nebulaVolumeFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
    })
  }
  return nebulaVolumeState.material
}
