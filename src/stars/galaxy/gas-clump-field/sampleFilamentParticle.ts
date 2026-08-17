import { gauss3, hashSeed, hashUnit } from '../hash'
import { normalize3 } from './normalize3'
import { smoothstep } from './smoothstep'
import type { FilamentSample, GasClump } from './types'

export const sampleFilamentParticle = (
  h: number,
  cl: GasClump,
): FilamentSample => {
  const chainT = hashUnit(h, 2)
  const chainLen = cl.rx * (0.58 + hashUnit(h, 3) * 1.35)
  const perpAng = hashUnit(h, 4) * Math.PI * 2
  const perpR =
    cl.rx * 0.16 * (1 - Math.abs(chainT - 0.5) * 1.2) * hashUnit(h, 5)
  const [dx, dy, dz] = normalize3(cl.filDx ?? 1, cl.filDy ?? 0, cl.filDz ?? 0)
  let px = dy * Math.sin(perpAng) - dz * Math.cos(perpAng)
  let py = dz * Math.sin(perpAng) - dx * Math.cos(perpAng)
  let pz = dx * Math.sin(perpAng) - dy * Math.cos(perpAng)
  ;[px, py, pz] = normalize3(px, py, pz)

  const along = (chainT - 0.5) * chainLen
  let lx = cl.cx + dx * along + px * perpR
  let ly = cl.cy + dy * along + py * perpR * 0.65
  let lz = cl.cz + dz * along + pz * perpR

  const wisp = 0.1 * cl.rx
  lx += gauss3(hashSeed(h, 'f1'), hashSeed(h, 'f2'), hashSeed(h, 'f3')) * wisp
  ly +=
    gauss3(hashSeed(h, 'f4'), hashSeed(h, 'f5'), hashSeed(h, 'f6')) *
    wisp *
    0.55
  lz += gauss3(hashSeed(h, 'f7'), hashSeed(h, 'f8'), hashSeed(h, 'f9')) * wisp

  const radial = Math.abs(chainT - 0.5) * 2
  const edgeFade = 1.0 - smoothstep(0.52, 0.96, radial)
  const density = (0.2 + (1 - radial) * 0.38 + hashUnit(h, 9) * 0.14) * edgeFade
  const stretch = 0.48 + hashUnit(h, 10) * 0.52
  return { lx, ly, lz, density, stretch }
}
