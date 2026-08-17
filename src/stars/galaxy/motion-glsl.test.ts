import { describe, expect, it } from 'bun:test'
import { GALAXY_HUB_MOTION_GLSL, GALAXY_MOTION_GLSL } from './motion-glsl'

describe('motion-glsl', () => {
  it('exposes both shader chunks as non-empty GLSL source strings', () => {
    expect(typeof GALAXY_MOTION_GLSL).toBe('string')
    expect(typeof GALAXY_HUB_MOTION_GLSL).toBe('string')
    expect(GALAXY_MOTION_GLSL).toContain('applyGalaxyMotion')
    expect(GALAXY_HUB_MOTION_GLSL).toContain('applyGalaxyHubMotion')
  })

  it('inlines the shared rotation helpers into both shaders', () => {
    expect(GALAXY_MOTION_GLSL).toContain('rotateTiltedGalaxyY')
    expect(GALAXY_HUB_MOTION_GLSL).toContain('rotateTiltedGalaxyY')
  })
})
