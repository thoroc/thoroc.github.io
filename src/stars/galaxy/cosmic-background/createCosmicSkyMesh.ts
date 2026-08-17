import * as THREE from 'three'
import { SKY_RADIUS, skyFragmentShader, skyVertexShader } from './shaders'

/** 深空渐变穹顶 + 微弱银河感 */
export const createCosmicSkyMesh = (): THREE.Mesh => {
  const geometry = new THREE.SphereGeometry(SKY_RADIUS, 32, 24)
  const material = new THREE.ShaderMaterial({
    vertexShader: skyVertexShader,
    fragmentShader: skyFragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = 'cosmic-sky'
  mesh.renderOrder = -100
  mesh.frustumCulled = false
  return mesh
}
