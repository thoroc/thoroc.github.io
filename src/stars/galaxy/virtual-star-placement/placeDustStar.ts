import { gauss3, hashSeed, hashUnit } from '../hash'
import type { Vec3 } from './types'

export const placeDustStar = (
  base: Vec3,
  spread: number,
  positions: Float32Array,
  i: number,
  h: number,
): void => {
  const dust = spread * (1.05 + hashUnit(h, 21) * 1.45)
  positions[i * 3] =
    base[0] +
    gauss3(hashSeed(h, 'd1'), hashSeed(h, 'd2'), hashSeed(h, 'd3')) * dust
  positions[i * 3 + 1] =
    base[1] +
    gauss3(hashSeed(h, 'd4'), hashSeed(h, 'd5'), hashSeed(h, 'd6')) *
      dust *
      0.82
  positions[i * 3 + 2] =
    base[2] +
    gauss3(hashSeed(h, 'd7'), hashSeed(h, 'd8'), hashSeed(h, 'd9')) * dust
}
