import { nebulaDustRgb, repoLangRgb } from '../colors'
import { hashStr, hashUnit } from '../hash'
import {
  buildGasClumpField,
  galaxyFrameAngles,
  galaxyRadiusForLanguage,
  rotateGalaxyLocal,
  sampleGasDustParticle,
} from '../morphological-layout'
import type { DustBuffers, LanguageEmitCtx } from './types'

/** 单个语言星系的暗尘粒子（沿用该语系的 gas clump 场采样中心） */
export const emitLanguageDustParticles = (
  lang: string,
  ctx: Pick<LanguageEmitCtx, 'hubs' | 'layout' | 'total' | 'sf' | 'perGalaxy'>,
  buffers: DustBuffers,
  o: number,
): number => {
  const { hubs, layout, total, sf, perGalaxy } = ctx
  const { positions, colors, sizes, density } = buffers
  const hub = hubs.get(lang) ?? [0, 0, 0]
  const [hx, hy, hz] = hub as [number, number, number]
  const gR = galaxyRadiusForLanguage(lang, layout, total) * sf
  const [br, bg, bb] = repoLangRgb(lang)
  const { tiltX, tiltY, tiltZ } = galaxyFrameAngles(lang)
  const gasField = buildGasClumpField(lang, gR)

  for (let j = 0; j < perGalaxy; j += 1) {
    const h = hashStr(`galaxy-dust:${lang}:${j}`)
    const particle = sampleGasDustParticle(h, gasField)
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

    const [dr, dg, db] = nebulaDustRgb([br, bg, bb], d)
    colors[o * 3] = dr
    colors[o * 3 + 1] = dg
    colors[o * 3 + 2] = db
    sizes[o] = 2.4 + d * 3.8 + hashUnit(h, 8) * 2.6
    density[o] = d
    o += 1
  }

  return o
}
