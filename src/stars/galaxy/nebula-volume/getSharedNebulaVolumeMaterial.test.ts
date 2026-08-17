import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { disposeNebulaSharedGeometry } from './disposeNebulaSharedGeometry'
import { getSharedNebulaVolumeMaterial } from './getSharedNebulaVolumeMaterial'

describe('getSharedNebulaVolumeMaterial', () => {
  it('returns a shared ShaderMaterial instance with all expected uniforms', () => {
    disposeNebulaSharedGeometry()
    const a = getSharedNebulaVolumeMaterial()
    const b = getSharedNebulaVolumeMaterial()
    expect(a).toBeInstanceOf(THREE.ShaderMaterial)
    expect(a).toBe(b)
    for (const key of [
      'uTime',
      'uLangTint',
      'uEllipsoid',
      'uSeed',
      'uStepCount',
      'uInvModelMatrix',
    ]) {
      expect(a.uniforms[key]).toBeDefined()
    }
    disposeNebulaSharedGeometry()
  })

  it('uses a provided shared uTime uniform', () => {
    disposeNebulaSharedGeometry()
    const sharedUniforms = { uTime: { value: 42 } }
    const mat = getSharedNebulaVolumeMaterial(sharedUniforms)
    expect(mat.uniforms.uTime?.value).toBe(42)
    disposeNebulaSharedGeometry()
  })
})
