import { gauss3, hashSeed, hashUnit } from '../hash'
import { smoothstep } from './smoothstep'
import type { EllipsoidSample } from './types'

/** 在椭球/尘柱体内采样 */
export const sampleEllipsoidVolume = (
  h: number,
  rx: number,
  ry: number,
  rz: number,
  tier: number,
  pillar = false,
): EllipsoidSample => {
  const u = hashUnit(h, 6)
  const v = hashUnit(h, 7)
  const w = hashUnit(h, 8)
  let lx: number
  let ly: number
  let lz: number
  let radial: number
  if (pillar) {
    const theta = Math.PI * 2 * u
    radial = w ** 1.15 * (0.82 + tier * 0.14)
    lx = Math.cos(theta) * radial * rx
    lz = Math.sin(theta) * radial * rz
    ly = (v * 2 - 1) * ry * (0.55 + radial * 0.45)
  } else {
    const theta = Math.PI * 2 * u
    const phi = Math.acos(Math.max(-1, Math.min(1, 2 * v - 1)))
    radial = w ** 1.48 * (0.88 + tier * 0.16)
    const sr = Math.sin(phi)
    lx = sr * Math.cos(theta) * radial * rx
    ly = Math.cos(phi) * radial * ry
    lz = sr * Math.sin(theta) * radial * rz
  }
  const bulge = Math.exp(-radial * radial * (pillar ? 1.8 : 2.2))
  const edgeFade = 1.0 - smoothstep(pillar ? 0.68 : 0.72, 0.98, radial)
  const density = (0.16 + bulge * 0.38 + hashUnit(h, 9) * 0.1) * edgeFade
  const wisp = 0.14 * (1 - radial * 0.55)
  lx +=
    gauss3(hashSeed(h, 'w1'), hashSeed(h, 'w2'), hashSeed(h, 'w3')) * rx * wisp
  ly +=
    gauss3(hashSeed(h, 'w4'), hashSeed(h, 'w5'), hashSeed(h, 'w6')) * ry * wisp
  lz +=
    gauss3(hashSeed(h, 'w7'), hashSeed(h, 'w8'), hashSeed(h, 'w9')) * rz * wisp
  return { lx, ly, lz, density }
}
