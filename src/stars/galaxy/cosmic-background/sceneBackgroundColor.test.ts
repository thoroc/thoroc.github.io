import { describe, expect, it } from 'bun:test'
import { sceneBackgroundColor } from './sceneBackgroundColor'

describe('sceneBackgroundColor', () => {
  it('returns the fixed background color', () => {
    expect(sceneBackgroundColor()).toBe(0x060a12)
  })
})
