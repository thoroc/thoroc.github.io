import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { disposeNebulaSharedGeometry } from './disposeNebulaSharedGeometry'
import { getNebulaBoxGeometry } from './getNebulaBoxGeometry'

describe('getNebulaBoxGeometry', () => {
  it('returns a shared BoxGeometry instance', () => {
    disposeNebulaSharedGeometry()
    const a = getNebulaBoxGeometry()
    const b = getNebulaBoxGeometry()
    expect(a).toBeInstanceOf(THREE.BoxGeometry)
    expect(a).toBe(b)
    disposeNebulaSharedGeometry()
  })
})
