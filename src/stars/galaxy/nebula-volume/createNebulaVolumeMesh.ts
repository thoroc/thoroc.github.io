import * as THREE from 'three'
import { getNebulaBoxGeometry } from './getNebulaBoxGeometry'
import { getSharedNebulaVolumeMaterial } from './getSharedNebulaVolumeMaterial'
import type {
  Ellipsoid,
  LangRgb,
  NebulaMaterialUniforms,
  NebulaMeshOptions,
  SharedUniforms,
} from './types'

const worldPosScratch = new THREE.Vector3()

export const createNebulaVolumeMesh = (
  langRgb: LangRgb,
  ellipsoid: Ellipsoid,
  seed: number,
  sharedUniforms: SharedUniforms | null = null,
  opts: NebulaMeshOptions = {},
): THREE.Mesh => {
  const mat = getSharedNebulaVolumeMaterial(sharedUniforms)
  // three's ShaderMaterial.uniforms is typed as `{ [uniform: string]: IUniform }`
  // (no generics) — narrowing to our known uniform shape genuinely needs the
  // `unknown` intermediary; this is not a hidden-any workaround, see
  // NebulaMaterialUniforms in ./types.
  const uniforms = mat.uniforms as unknown as NebulaMaterialUniforms
  const mesh = new THREE.Mesh(getNebulaBoxGeometry(), mat)
  mesh.name = opts.isField ? 'field-nebula-volume' : 'nebula-volume'
  mesh.renderOrder = opts.isField ? -6 : -5
  mesh.scale.set(ellipsoid[0] * 2, ellipsoid[1] * 2, ellipsoid[2] * 2)
  mesh.frustumCulled = true
  mesh.userData.langTint = langRgb
  mesh.userData.ellipsoid = ellipsoid
  mesh.userData.seed = seed
  mesh.userData.isField = !!opts.isField

  mesh.onBeforeRender = (_renderer, _scene, camera) => {
    uniforms.uInvModelMatrix.value.copy(mesh.matrixWorld).invert()
    uniforms.uLangTint.value.set(langRgb[0], langRgb[1], langRgb[2])
    uniforms.uEllipsoid.value.set(ellipsoid[0], ellipsoid[1], ellipsoid[2])
    uniforms.uSeed.value = seed
    mesh.getWorldPosition(worldPosScratch)
    const dist = camera.position.distanceTo(worldPosScratch)
    if (mesh.userData.isField) {
      uniforms.uStepCount.value = dist > 220 ? 7 : dist > 120 ? 8 : 9
    } else {
      uniforms.uStepCount.value = dist > 200 ? 8 : dist > 110 ? 10 : 12
    }
  }
  return mesh
}
