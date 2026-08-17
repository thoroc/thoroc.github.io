import { nebulaLangTint, repoLangRgb } from '../colors'
import { hashStr, hashUnit } from '../hash'
import {
  buildGasClumpField,
  galaxyFrameAngles,
  galaxyRadiusForLanguage,
  rotateGalaxyLocal,
  sampleGasCloudParticle,
} from '../morphological-layout'
import type { GasBuffers, LanguageEmitCtx } from './types'

/** 单个语言星系的气体云粒子（弥散 + 核心两层）+ 该语系核心半径 */
export const emitLanguageGasParticles = (
  lang: string,
  ctx: LanguageEmitCtx,
  buffers: GasBuffers,
  o: number,
): { o: number; gR: number } => {
  const { hubs, layout, total, sf, perGalaxy, corePerGalaxy } = ctx
  const { positions, colors, sizes, phases, softness, density, stretch } =
    buffers
  const hub = hubs.get(lang) ?? [0, 0, 0]
  const [hx, hy, hz] = hub as [number, number, number]
  const gR = galaxyRadiusForLanguage(lang, layout, total) * sf
  const [br, bg, bb] = repoLangRgb(lang)
  const { tiltX, tiltY, tiltZ } = galaxyFrameAngles(lang)
  const gasField = buildGasClumpField(lang, gR)
  const morphStretch =
    gasField.morphology === 3
      ? 0.22
      : gasField.morphology === 4
        ? 0.18
        : gasField.morphology === 2
          ? 0.14
          : 0.06

  for (let j = 0; j < perGalaxy; j += 1) {
    const h = hashStr(`galaxy-gas:${lang}:${j}`)
    const particle = sampleGasCloudParticle(h, gasField)
    const [rx, ry, rz] = rotateGalaxyLocal(
      particle.lx,
      particle.ly,
      particle.lz,
      tiltX,
      tiltZ,
      tiltY,
    ) as [number, number, number]
    const d = particle.density

    positions[o * 3] = hx * sf + rx
    positions[o * 3 + 1] = hy * sf + ry
    positions[o * 3 + 2] = hz * sf + rz

    const [nr, ng, nb] = nebulaLangTint([br, bg, bb], d)
    colors[o * 3] = nr
    colors[o * 3 + 1] = ng
    colors[o * 3 + 2] = nb

    sizes[o] =
      5.2 + (1 - d) * 7.2 + d * 2.8 + hashUnit(h, 8) * (2.2 + (1 - d) * 3.4)

    phases[o] = hashUnit(h, 9) * Math.PI * 2
    softness[o] = 0.58 + (1 - d) * 0.38
    density[o] = d
    stretch[o] = (particle.stretch ?? morphStretch) + hashUnit(h, 13) * 0.22
    o += 1
  }

  for (let j = 0; j < corePerGalaxy; j += 1) {
    const h = hashStr(`galaxy-gas-core:${lang}:${j}`)
    const coreR = gR * (0.06 + hashUnit(h, 1) * 0.22)
    const ang = hashUnit(h, 2) * Math.PI * 2
    const lift = hashUnit(h, 3)
    const lx = Math.cos(ang) * coreR * (0.35 + hashUnit(h, 4) * 0.65)
    const ly = (lift - 0.5) * gR * 0.14 * (0.4 + hashUnit(h, 5) * 0.6)
    const lz = Math.sin(ang) * coreR * (0.35 + hashUnit(h, 6) * 0.65)
    const [rx, ry, rz] = rotateGalaxyLocal(lx, ly, lz, tiltX, tiltZ, tiltY) as [
      number,
      number,
      number,
    ]
    const d = 0.72 + hashUnit(h, 7) * 0.22

    positions[o * 3] = hx * sf + rx
    positions[o * 3 + 1] = hy * sf + ry
    positions[o * 3 + 2] = hz * sf + rz

    const [nr, ng, nb] = nebulaLangTint([br, bg, bb], d)
    colors[o * 3] = nr
    colors[o * 3 + 1] = ng
    colors[o * 3 + 2] = nb

    sizes[o] = 14.0 + hashUnit(h, 8) * 12.0
    phases[o] = hashUnit(h, 9) * Math.PI * 2
    softness[o] = 0.38 + hashUnit(h, 10) * 0.12
    density[o] = d
    stretch[o] = morphStretch * 0.35
    o += 1
  }

  return { o, gR }
}
