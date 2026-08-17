import { COSMIC_UNIVERSE } from '../constants'
import { buildLanguageHubMotion } from '../motion-hubs'
import type { GasBuffersLike, LayoutLike, Vec3 } from './types'

/** 为气体云粒子填充星系级运动字段 */
export const fillGasMotionFields = (
  gasBuffers: GasBuffersLike | null | undefined,
  layout: LayoutLike,
  harmonizedHubs: Map<string, Vec3>,
): void => {
  if (!gasBuffers?.count) return
  const langs = gasBuffers.languages || []
  const perGalaxy =
    gasBuffers.perGalaxy ?? COSMIC_UNIVERSE.GAS_PARTICLES_PER_GALAXY
  const corePerGalaxy =
    gasBuffers.corePerGalaxy ?? COSMIC_UNIVERSE.GAS_CORE_FILL_COUNT ?? 0
  const particlesPerLayer = perGalaxy + corePerGalaxy
  const count = gasBuffers.count
  const galaxyHubs = new Float32Array(count * 3)
  const motionOmega = new Float32Array(count * 4)
  const motionOmega2 = new Float32Array(count * 4)

  let o = 0
  for (const lang of langs) {
    const hub = harmonizedHubs.get(lang) ?? ([0, 0, 0] as Vec3)
    const m = buildLanguageHubMotion(layout, lang, hub)
    for (let j = 0; j < particlesPerLayer; j += 1) {
      galaxyHubs[o * 3] = hub[0]
      galaxyHubs[o * 3 + 1] = hub[1]
      galaxyHubs[o * 3 + 2] = hub[2]
      motionOmega[o * 4] = m.universeOrbit
      motionOmega[o * 4 + 1] = m.galaxySpin
      motionOmega[o * 4 + 2] = 0
      motionOmega[o * 4 + 3] = 0
      motionOmega2[o * 4] = m.galaxyOrbit
      motionOmega2[o * 4 + 1] = 0
      motionOmega2[o * 4 + 2] = 0
      motionOmega2[o * 4 + 3] = m.tiltMix
      o += 1
    }
  }

  gasBuffers.galaxyHubs = galaxyHubs
  gasBuffers.motionOmega = motionOmega
  gasBuffers.motionOmega2 = motionOmega2
  gasBuffers.languages = [...langs]
  gasBuffers.perGalaxy = perGalaxy
  gasBuffers.corePerGalaxy = corePerGalaxy
  gasBuffers.langMotions = langs.map((lang) => {
    const hub = harmonizedHubs.get(lang) ?? ([0, 0, 0] as Vec3)
    const m = buildLanguageHubMotion(layout, lang, hub)
    return {
      hub,
      omega: [m.universeOrbit, m.galaxySpin, 0, 0] as [
        number,
        number,
        number,
        number,
      ],
      omega2: [m.galaxyOrbit, 0, 0, m.tiltMix] as [
        number,
        number,
        number,
        number,
      ],
    }
  })
}
