import { COSMIC_UNIVERSE, R_MAX, R_MIN } from '../constants'
import { hashStr, hashUnit } from '../hash'

export const buildDustBuffers = (
  count = 1600,
): { positions: Float32Array; sizes: Float32Array } => {
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const span = R_MAX - R_MIN
  const { INTERGALACTIC_SPREAD } = COSMIC_UNIVERSE

  for (let i = 0; i < count; i += 1) {
    const h = hashStr(`dust-${i}`)
    const theta = hashUnit(h, 1) * Math.PI * 2
    const phi = Math.acos(Math.max(-1, Math.min(1, 2 * hashUnit(h, 2) - 1)))
    const r =
      span *
      INTERGALACTIC_SPREAD *
      Math.cbrt(hashUnit(h, 3)) *
      (0.65 + hashUnit(h, 4) * 0.55)

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.cos(phi)
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    sizes[i] = 0.1 + hashUnit(h, 6) * 0.18
  }
  return { positions, sizes }
}
