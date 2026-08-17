import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { createCosmicSkyMesh } from './createCosmicSkyMesh'

describe('createCosmicSkyMesh', () => {
  it('builds a named, unculled background sphere with a shader material', () => {
    const mesh = createCosmicSkyMesh()
    expect(mesh).toBeInstanceOf(THREE.Mesh)
    expect(mesh.geometry).toBeInstanceOf(THREE.SphereGeometry)
    expect(mesh.material).toBeInstanceOf(THREE.ShaderMaterial)
    expect(mesh.name).toBe('cosmic-sky')
    expect(mesh.renderOrder).toBe(-100)
    expect(mesh.frustumCulled).toBe(false)
  })
})
