import { COSMIC_UNIVERSE } from '../constants'
import {
  buildCosmicLanguageField,
  buildLanguageGalaxyHubs,
  qualifyingGasLanguages,
} from '../morphological-layout'
import { emitFieldGasParticles } from './emitFieldGasParticles'
import { emitLanguageGasParticles } from './emitLanguageGasParticles'
import type { GalaxyLayoutLike, GasBuffers } from './types'

export interface GalaxyGasBuffersResult extends Partial<GasBuffers> {
  positions: Float32Array
  colors: Float32Array
  sizes: Float32Array
  phases: Float32Array
  softness: Float32Array
  density: Float32Array
  stretch: Float32Array
  languages: string[]
  langRadii: number[]
  perGalaxy: number
  corePerGalaxy: number
  fieldGasStart?: number
  fieldGasCount?: number
  fieldVolumeRadius?: number
  count: number
}

export const buildGalaxyGasBuffers = (
  layout: GalaxyLayoutLike,
  repos: unknown[] | null | undefined,
): GalaxyGasBuffersResult => {
  const { GAS_PARTICLES_PER_GALAXY, GAS_CORE_FILL_COUNT, FIELD_GAS_COUNT } =
    COSMIC_UNIVERSE
  const hubs = buildLanguageGalaxyHubs(layout)
  const field = buildCosmicLanguageField(
    layout,
    Math.max(repos?.length ?? 0, 1),
  )
  const total = Math.max(repos?.length ?? 0, 1)
  const sf = Math.min(layout.spreadFactor ?? 1, 1.32)
  const gasLangs: string[] = qualifyingGasLanguages(layout)
  const perGalaxy = GAS_PARTICLES_PER_GALAXY
  const corePerGalaxy = GAS_CORE_FILL_COUNT
  const fieldGas = FIELD_GAS_COUNT ?? 0
  const count = gasLangs.length * (perGalaxy + corePerGalaxy) + fieldGas
  if (!count) {
    return {
      positions: new Float32Array(0),
      colors: new Float32Array(0),
      sizes: new Float32Array(0),
      phases: new Float32Array(0),
      softness: new Float32Array(0),
      density: new Float32Array(0),
      stretch: new Float32Array(0),
      languages: [],
      langRadii: [],
      perGalaxy,
      corePerGalaxy,
      count: 0,
    }
  }

  const buffers: GasBuffers = {
    positions: new Float32Array(count * 3),
    colors: new Float32Array(count * 3),
    sizes: new Float32Array(count),
    phases: new Float32Array(count),
    softness: new Float32Array(count),
    density: new Float32Array(count),
    stretch: new Float32Array(count),
  }
  const { positions, colors, sizes, phases, softness, density, stretch } =
    buffers
  const langRadii: number[] = []
  let o = 0

  const emitCtx = { hubs, layout, total, sf, perGalaxy, corePerGalaxy }
  for (const lang of gasLangs) {
    const emitted = emitLanguageGasParticles(lang, emitCtx, buffers, o)
    o = emitted.o
    langRadii.push(emitted.gR)
  }

  const { o: fieldGasEnd, coreR } = emitFieldGasParticles(
    field,
    sf,
    fieldGas,
    buffers,
    o,
  )
  o = fieldGasEnd

  const fieldGasStart = gasLangs.length * (perGalaxy + corePerGalaxy)
  return {
    positions,
    colors,
    sizes,
    phases,
    softness,
    density,
    stretch,
    languages: gasLangs,
    langRadii,
    perGalaxy,
    corePerGalaxy,
    fieldGasStart,
    fieldGasCount: fieldGas,
    fieldVolumeRadius: coreR * sf * 1.62,
    count,
  }
}
