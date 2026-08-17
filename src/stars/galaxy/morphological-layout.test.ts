import { describe, expect, it } from 'bun:test'
import * as morphologicalLayout from './morphological-layout'

describe('morphological-layout barrel', () => {
  it('re-exports the galaxy-field, gas-clump-field, and virtual-star-placement API', () => {
    expect(typeof morphologicalLayout.buildCosmicLanguageField).toBe('function')
    expect(typeof morphologicalLayout.buildLanguageGalaxyHubs).toBe('function')
    expect(typeof morphologicalLayout.galaxyFrameAngles).toBe('function')
    expect(typeof morphologicalLayout.galaxyRadiusForLanguage).toBe('function')
    expect(typeof morphologicalLayout.gasCloudFrameAngles).toBe('function')
    expect(typeof morphologicalLayout.qualifyingGasLanguages).toBe('function')
    expect(typeof morphologicalLayout.rotateGalaxyLocal).toBe('function')
    expect(typeof morphologicalLayout.buildGasClumpField).toBe('function')
    expect(typeof morphologicalLayout.sampleGasCloudParticle).toBe('function')
    expect(typeof morphologicalLayout.sampleGasDustParticle).toBe('function')
    expect(typeof morphologicalLayout.buildMorphologicalVirtualPositions).toBe(
      'function',
    )
    expect(typeof morphologicalLayout.harmonizeCosmicSpan).toBe('function')
  })
})
