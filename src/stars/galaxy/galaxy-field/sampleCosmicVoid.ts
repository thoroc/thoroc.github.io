import { COSMIC_UNIVERSE } from '../constants'
import { gauss3, hashSeed, hashUnit } from '../hash'

/** 场星：在整个宇宙球均匀采样 */
export const sampleCosmicVoid = (
  h: number,
  span: number,
): [number, number, number] => {
  const { INTERGALACTIC_SPREAD } = COSMIC_UNIVERSE
  const u = hashUnit(h, 10)
  const v = hashUnit(h, 11)
  const w = hashUnit(h, 12)
  const theta = Math.PI * 2 * u
  const phi = Math.acos(Math.max(-1, Math.min(1, 2 * v - 1)))
  const r =
    span * INTERGALACTIC_SPREAD * Math.cbrt(w) * (0.48 + hashUnit(h, 13) * 0.52)
  let x = r * Math.sin(phi) * Math.cos(theta)
  let y = r * Math.cos(phi)
  let z = r * Math.sin(phi) * Math.sin(theta)
  const jitter = span * 0.035
  x +=
    gauss3(hashSeed(h, 'ig1'), hashSeed(h, 'ig2'), hashSeed(h, 'ig3')) * jitter
  y +=
    gauss3(hashSeed(h, 'ig4'), hashSeed(h, 'ig5'), hashSeed(h, 'ig6')) *
    jitter *
    0.82
  z +=
    gauss3(hashSeed(h, 'ig7'), hashSeed(h, 'ig8'), hashSeed(h, 'ig9')) * jitter
  return [x, y, z]
}
