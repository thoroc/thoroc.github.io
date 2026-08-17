import { nebulaLangTint, repoLangRgb } from '../colors'
import { gauss3, hashSeed, hashStr, hashUnit } from '../hash'
import type { GasBuffers, GasField } from './types'

/** 全局背景雾气粒子（不属于任何语言星系，均匀撒在场里） */
export const emitFieldGasParticles = (
  field: GasField,
  sf: number,
  fieldGas: number,
  buffers: GasBuffers,
  o: number,
): { o: number; coreR: number } => {
  const { positions, colors, sizes, phases, softness, density, stretch } =
    buffers
  const kernels = [...field.kernels.values()]
  const span = field.span
  const coreR = field.coreR
  for (let j = 0; j < fieldGas; j += 1) {
    const h = hashStr(`field-gas:${j}`)
    const u = hashUnit(h, 1)
    const v = hashUnit(h, 2)
    const w = hashUnit(h, 3)
    const theta = Math.PI * 2 * u
    const phi = Math.acos(Math.max(-1, Math.min(1, 2 * v - 1)))
    const radial = coreR * 1.38 * Math.cbrt(w)
    let gx = radial * Math.sin(phi) * Math.cos(theta)
    let gy = radial * Math.cos(phi)
    let gz = radial * Math.sin(phi) * Math.sin(theta)
    gx +=
      gauss3(hashSeed(h, 'g1'), hashSeed(h, 'g2'), hashSeed(h, 'g3')) *
      span *
      0.04
    gy +=
      gauss3(hashSeed(h, 'g4'), hashSeed(h, 'g5'), hashSeed(h, 'g6')) *
      span *
      0.032
    gz +=
      gauss3(hashSeed(h, 'g7'), hashSeed(h, 'g8'), hashSeed(h, 'g9')) *
      span *
      0.04

    positions[o * 3] = gx * sf
    positions[o * 3 + 1] = gy * sf
    positions[o * 3 + 2] = gz * sf

    const pick =
      kernels[Math.floor(hashUnit(h, 10) * kernels.length) % kernels.length]
    const lang = pick?.lang ?? '其他'
    const [br, bg, bb] = repoLangRgb(lang)
    const d = 0.28 + hashUnit(h, 11) * 0.42
    const [nr, ng, nb] = nebulaLangTint([br, bg, bb], d)
    colors[o * 3] = nr
    colors[o * 3 + 1] = ng
    colors[o * 3 + 2] = nb
    sizes[o] = 4.8 + hashUnit(h, 13) * 7.2
    phases[o] = hashUnit(h, 14) * Math.PI * 2
    softness[o] = 0.72 + hashUnit(h, 15) * 0.24
    density[o] = d
    stretch[o] = 0.02 + hashUnit(h, 16) * 0.06
    o += 1
  }
  return { o, coreR }
}
