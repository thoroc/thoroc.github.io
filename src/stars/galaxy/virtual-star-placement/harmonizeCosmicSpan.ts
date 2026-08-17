import { COSMIC_UNIVERSE, FORCE_LAYOUT } from '../constants'
import type { AuxBuffer, HarmonizeMeta } from './types'

/** 质心归零 + 温和缩放 */
export const harmonizeCosmicSpan = (
  positions: Float32Array,
  count: number,
  auxBuffers: AuxBuffer[] = [],
): HarmonizeMeta | null => {
  if (count <= 0) return null
  const targetSpan = FORCE_LAYOUT.TARGET_SPAN
  const yFlatten = COSMIC_UNIVERSE.UNIVERSE_Y_FLATTEN

  let cx = 0
  let cy = 0
  let cz = 0
  for (let i = 0; i < count; i += 1) {
    cx += positions[i * 3] as number
    cy += positions[i * 3 + 1] as number
    cz += positions[i * 3 + 2] as number
  }
  const inv = 1 / count
  cx *= inv
  cy *= inv
  cz *= inv

  const radii = new Float32Array(count)
  let maxR = 1
  for (let i = 0; i < count; i += 1) {
    const x = (positions[i * 3] as number) - cx
    const y = (positions[i * 3 + 1] as number) - cy
    const z = (positions[i * 3 + 2] as number) - cz
    const r = Math.sqrt(x * x + y * y + z * z)
    radii[i] = r
    maxR = Math.max(maxR, r)
  }

  const sorted = [...radii].sort((a, b) => a - b)
  const p88 = sorted[Math.min(count - 1, Math.floor(count * 0.88))] || maxR
  const desired = targetSpan * 0.92
  const effectiveR = Math.max(p88 * 1.02, maxR * 0.78)
  let scale = desired / effectiveR
  if (scale > 1.14) scale = 1.14

  const applyScale = (buf: Float32Array, n: number) => {
    for (let i = 0; i < n; i += 1) {
      buf[i * 3] = ((buf[i * 3] as number) - cx) * scale
      buf[i * 3 + 1] = ((buf[i * 3 + 1] as number) - cy) * scale * yFlatten
      buf[i * 3 + 2] = ((buf[i * 3 + 2] as number) - cz) * scale
    }
  }

  applyScale(positions, count)
  for (const aux of auxBuffers) {
    if (!aux?.buf || aux.n <= 0) continue
    applyScale(aux.buf, aux.n)
  }

  return { cx, cy, cz, scale, yFlatten }
}
