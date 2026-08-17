import { describe, expect, it } from 'bun:test'
import { disposeNebulaSharedGeometry } from './disposeNebulaSharedGeometry'
import { getNebulaBoxGeometry } from './getNebulaBoxGeometry'
import { getSharedNebulaVolumeMaterial } from './getSharedNebulaVolumeMaterial'

describe('disposeNebulaSharedGeometry', () => {
  it('disposes and clears the shared geometry and material', () => {
    const geometry = getNebulaBoxGeometry()
    const material = getSharedNebulaVolumeMaterial()
    disposeNebulaSharedGeometry()
    expect(getNebulaBoxGeometry()).not.toBe(geometry)
    expect(getSharedNebulaVolumeMaterial()).not.toBe(material)
    disposeNebulaSharedGeometry()
  })

  it('is a no-op when nothing has been created yet', () => {
    disposeNebulaSharedGeometry()
    expect(() => disposeNebulaSharedGeometry()).not.toThrow()
  })
})
