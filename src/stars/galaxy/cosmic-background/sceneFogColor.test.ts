import { describe, expect, it } from 'bun:test'
import { sceneFogColor } from './sceneFogColor'

describe('sceneFogColor', () => {
  it('returns the fixed fog color', () => {
    expect(sceneFogColor()).toBe(0x080e18)
  })
})
