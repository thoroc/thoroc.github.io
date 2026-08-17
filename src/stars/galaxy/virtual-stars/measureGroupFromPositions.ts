import { MORPHOLOGY_LAYOUT } from '../constants'

export interface GroupMeasurement {
  cx: number
  cy: number
  cz: number
  spread: number
  n: number
}

export const measureGroupFromPositions = (
  indices: number[],
  positions: Float32Array,
): GroupMeasurement => {
  let cx = 0
  let cy = 0
  let cz = 0
  const count = indices.length
  if (!count) {
    return { cx: 0, cy: 0, cz: 0, spread: 14, n: 0 }
  }
  for (const i of indices) {
    cx += positions[i * 3] as number
    cy += positions[i * 3 + 1] as number
    cz += positions[i * 3 + 2] as number
  }
  const inv = 1 / count
  cx *= inv
  cy *= inv
  cz *= inv
  let maxR = 1
  for (const i of indices) {
    const dx = (positions[i * 3] as number) - cx
    const dy = (positions[i * 3 + 1] as number) - cy
    const dz = (positions[i * 3 + 2] as number) - cz
    maxR = Math.max(maxR, Math.sqrt(dx * dx + dy * dy + dz * dz))
  }
  const spread = Math.max(
    MORPHOLOGY_LAYOUT.GROUP_SPREAD_MIN,
    maxR * 1.15,
    Math.sqrt(count) * MORPHOLOGY_LAYOUT.GROUP_SPREAD_PER_STAR,
  )
  return { cx, cy, cz, spread, n: count }
}
