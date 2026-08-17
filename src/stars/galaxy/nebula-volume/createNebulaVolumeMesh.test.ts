import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { createNebulaVolumeMesh } from './createNebulaVolumeMesh'
import { disposeNebulaSharedGeometry } from './disposeNebulaSharedGeometry'

describe('createNebulaVolumeMesh', () => {
  it('creates a named, scaled mesh with user data set', () => {
    disposeNebulaSharedGeometry()
    const mesh = createNebulaVolumeMesh([0.5, 0.5, 0.5], [10, 8, 9], 0.3)
    expect(mesh).toBeInstanceOf(THREE.Mesh)
    expect(mesh.name).toBe('nebula-volume')
    expect(mesh.renderOrder).toBe(-5)
    expect(mesh.scale.x).toBe(20)
    expect(mesh.userData.seed).toBe(0.3)
    expect(mesh.userData.isField).toBe(false)
    disposeNebulaSharedGeometry()
  })

  it('marks a field nebula with the field name and render order', () => {
    disposeNebulaSharedGeometry()
    const mesh = createNebulaVolumeMesh([0.2, 0.2, 0.2], [5, 5, 5], 0.1, null, {
      isField: true,
    })
    expect(mesh.name).toBe('field-nebula-volume')
    expect(mesh.renderOrder).toBe(-6)
    expect(mesh.userData.isField).toBe(true)
    disposeNebulaSharedGeometry()
  })

  it('updates uniforms and step count in onBeforeRender based on camera distance', () => {
    disposeNebulaSharedGeometry()
    const mesh = createNebulaVolumeMesh([0.4, 0.4, 0.4], [10, 10, 10], 0.5)
    mesh.updateMatrixWorld(true)
    const material = mesh.material as THREE.ShaderMaterial
    const camera = new THREE.PerspectiveCamera()
    camera.position.set(0, 0, 300)
    mesh.onBeforeRender?.(
      {} as never,
      {} as never,
      camera,
      {} as never,
      {} as never,
      {} as never,
    )
    expect(material.uniforms.uStepCount?.value).toBe(8)
    disposeNebulaSharedGeometry()
  })
})
