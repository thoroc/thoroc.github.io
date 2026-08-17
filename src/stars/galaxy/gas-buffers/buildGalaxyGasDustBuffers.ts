import { COSMIC_UNIVERSE } from '../constants'
import {
  buildCosmicLanguageField,
  buildLanguageGalaxyHubs,
  qualifyingGasLanguages,
} from '../morphological-layout'
import { emitFieldDustParticles } from './emitFieldDustParticles'
import { emitLanguageDustParticles } from './emitLanguageDustParticles'
import type { DustBuffers, GalaxyLayoutLike } from './types'

export interface GalaxyGasDustBuffersResult extends Partial<DustBuffers> {
  positions: Float32Array
  colors: Float32Array
  sizes: Float32Array
  density: Float32Array
  languages: string[]
  perGalaxy: number
  fieldDustStart: number
  fieldDustCount: number
  count: number
}

export const buildGalaxyGasDustBuffers = (
  layout: GalaxyLayoutLike,
  repos: unknown[] | null | undefined,
): GalaxyGasDustBuffersResult => {
  const { GAS_DUST_PER_GALAXY, FIELD_DUST_COUNT } = COSMIC_UNIVERSE
  const hubs = buildLanguageGalaxyHubs(layout)
  const field = buildCosmicLanguageField(
    layout,
    Math.max(repos?.length ?? 0, 1),
  )
  const total = Math.max(repos?.length ?? 0, 1)
  const sf = Math.min(layout.spreadFactor ?? 1, 1.32)
  const gasLangs: string[] = qualifyingGasLanguages(layout)
  const perGalaxy = GAS_DUST_PER_GALAXY ?? 0
  const fieldDust = FIELD_DUST_COUNT ?? 0
  const count = gasLangs.length * perGalaxy + fieldDust
  if (!count) {
    return {
      positions: new Float32Array(0),
      colors: new Float32Array(0),
      sizes: new Float32Array(0),
      density: new Float32Array(0),
      languages: [],
      perGalaxy,
      fieldDustStart: 0,
      fieldDustCount: 0,
      count: 0,
    }
  }

  const buffers: DustBuffers = {
    positions: new Float32Array(count * 3),
    colors: new Float32Array(count * 3),
    sizes: new Float32Array(count),
    density: new Float32Array(count),
  }
  const { positions, colors, sizes, density } = buffers
  let o = 0

  const emitCtx = { hubs, layout, total, sf, perGalaxy }
  for (const lang of gasLangs) {
    o = emitLanguageDustParticles(lang, emitCtx, buffers, o)
  }
  o = emitFieldDustParticles(field, sf, fieldDust, buffers, o)

  const fieldDustStart = gasLangs.length * perGalaxy
  return {
    positions,
    colors,
    sizes,
    density,
    languages: gasLangs,
    perGalaxy,
    fieldDustStart,
    fieldDustCount: fieldDust,
    count,
  }
}
