import { COSMIC_UNIVERSE } from '../constants'
import { gauss3, hashSeed, hashUnit } from '../hash'

export const applyFieldFilament = (
  h: number,
  x: number,
  y: number,
  z: number,
  span: number,
): [number, number, number] => {
  const amp = span * (COSMIC_UNIVERSE.FIELD_FILAMENT ?? 0.04)
  const fx = hashUnit(h, 21) * Math.PI * 2
  const fy = hashUnit(h, 22) * Math.PI * 2
  return [
    x +
      Math.sin(fy + z * 0.028) *
        amp *
        gauss3(hashSeed(h, 'f1'), hashSeed(h, 'f2'), hashSeed(h, 'f3')),
    y +
      Math.cos(fx + x * 0.024) *
        amp *
        0.72 *
        gauss3(hashSeed(h, 'f4'), hashSeed(h, 'f5'), hashSeed(h, 'f6')),
    z +
      Math.sin(fx + y * 0.026) *
        amp *
        gauss3(hashSeed(h, 'f7'), hashSeed(h, 'f8'), hashSeed(h, 'f9')),
  ]
}
