import { OTHER_LANGUAGE_KEY } from '../../utils/other-language'
import { nebulaDustRgb, repoLangRgb } from '../colors'
import { gauss3, hashSeed, hashStr, hashUnit } from '../hash'
import type { DustBuffers, GasField } from './types'

/** 全局背景暗尘粒子（不属于任何语言星系，均匀撒在场里） */
export const emitFieldDustParticles = (
  field: GasField,
  sf: number,
  fieldDust: number,
  buffers: DustBuffers,
  o: number,
): number => {
  const { positions, colors, sizes, density } = buffers
  const kernels = [...field.kernels.values()]
  const span = field.span
  const coreR = field.coreR
  for (let j = 0; j < fieldDust; j += 1) {
    const h = hashStr(`field-dust:${j}`)
    const u = hashUnit(h, 1)
    const v = hashUnit(h, 2)
    const w = hashUnit(h, 3)
    const theta = Math.PI * 2 * u
    const phi = Math.acos(Math.max(-1, Math.min(1, 2 * v - 1)))
    const radial = coreR * 1.05 * Math.cbrt(w)
    let gx = radial * Math.sin(phi) * Math.cos(theta)
    let gy = radial * Math.cos(phi)
    let gz = radial * Math.sin(phi) * Math.sin(theta)
    gx +=
      gauss3(hashSeed(h, 'd1'), hashSeed(h, 'd2'), hashSeed(h, 'd3')) *
      span *
      0.035
    gy +=
      gauss3(hashSeed(h, 'd4'), hashSeed(h, 'd5'), hashSeed(h, 'd6')) *
      span *
      0.028
    gz +=
      gauss3(hashSeed(h, 'd7'), hashSeed(h, 'd8'), hashSeed(h, 'd9')) *
      span *
      0.035

    positions[o * 3] = gx * sf
    positions[o * 3 + 1] = gy * sf
    positions[o * 3 + 2] = gz * sf

    const pick =
      kernels[Math.floor(hashUnit(h, 10) * kernels.length) % kernels.length]
    const lang = pick?.lang ?? OTHER_LANGUAGE_KEY
    const [br, bg, bb] = repoLangRgb(lang)
    const d = 0.32 + hashUnit(h, 11) * 0.48
    const [dr, dg, db] = nebulaDustRgb([br, bg, bb], d)
    colors[o * 3] = dr
    colors[o * 3 + 1] = dg
    colors[o * 3 + 2] = db
    sizes[o] = 1.8 + hashUnit(h, 12) * 2.8
    density[o] = d
    o += 1
  }
  return o
}
