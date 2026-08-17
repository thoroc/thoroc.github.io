import { describe, expect, test } from 'bun:test'
import {
  COSMIC_UNIVERSE,
  FORCE_LAYOUT,
  GALAXY,
  GALAXY_MOTION,
  GALAXY_ZOOM,
  HIERARCHY_LAYOUT,
  MORPHOLOGY_LAYOUT,
  PARTICLE_BRIGHT_RANGE,
  PARTICLE_SIZE_RANGE,
  PARTICLE_SIZE_WEIGHTS,
  PARTICLE_VISUAL_WEIGHTS,
  R_MAX,
  R_MIN,
  SCENE_FOG,
  STAR_YEAR_MAX,
  STAR_YEAR_MIN,
  TWINKLE_RANK_GAMMA,
  TWINKLE_WEIGHTS,
} from './constants'

// This is a data module (no functions) — the test only guards against
// accidental structural drift (a typo dropping a key, R_MIN >= R_MAX,
// weights that no longer sum sensibly), not the tuning values themselves.
describe('galaxy constants', () => {
  test('radial bounds are ordered', () => {
    expect(R_MIN).toBeLessThan(R_MAX)
  })

  test('star-year bounds are ordered', () => {
    expect(STAR_YEAR_MIN).toBeLessThan(STAR_YEAR_MAX)
  })

  test('weight groups are present and finite', () => {
    for (const weights of [
      TWINKLE_WEIGHTS,
      PARTICLE_VISUAL_WEIGHTS,
      PARTICLE_SIZE_WEIGHTS,
    ]) {
      for (const value of Object.values(weights)) {
        expect(Number.isFinite(value)).toBe(true)
      }
    }
  })

  test('range objects have MIN < MAX', () => {
    expect(PARTICLE_SIZE_RANGE.MIN).toBeLessThan(PARTICLE_SIZE_RANGE.MAX)
    expect(PARTICLE_BRIGHT_RANGE.MIN).toBeLessThan(PARTICLE_BRIGHT_RANGE.MAX)
  })

  test('top-level tuning objects exist with the expected key groups', () => {
    expect(typeof GALAXY.TWIST).toBe('number')
    expect(typeof GALAXY_MOTION.SPEED_SCALE).toBe('number')
    expect(typeof FORCE_LAYOUT.TARGET_SPAN).toBe('number')
    expect(typeof HIERARCHY_LAYOUT.LANG_FORCE_STEPS).toBe('number')
    expect(typeof COSMIC_UNIVERSE.INTERGALACTIC_RATIO).toBe('number')
    expect(typeof MORPHOLOGY_LAYOUT.VOLUME_SCALE).toBe('number')
    expect(typeof SCENE_FOG.DENSITY).toBe('number')
    expect(typeof GALAXY_ZOOM.MIN_DISTANCE).toBe('number')
    expect(TWINKLE_RANK_GAMMA).toBeGreaterThan(0)
  })
})
