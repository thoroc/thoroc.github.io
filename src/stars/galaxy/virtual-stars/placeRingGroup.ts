import { GALAXY, MORPHOLOGY_LAYOUT } from '../constants'
import { gauss3, hashSeed, hashStr } from '../hash'
import { hashUnitLocal } from './hashUnitLocal'
import { nebulaSampleRadius } from './nebulaSampleRadius'
import type { VirtualStar } from './types'

export const placeRingGroup = (
  virtualStars: VirtualStar[],
  indices: number[],
  positions: Float32Array,
  cx: number,
  cy: number,
  cz: number,
  groupSpread: number,
  ringKey: string,
  planeTangAng = 0,
  maxRingR: number | null = null,
  ringStarFlags: Float32Array | null = null,
): void => {
  const count = indices.length
  if (!count) return

  let ringR =
    (Math.max(GALAXY.TOPIC_RING_RADIUS_BASE, groupSpread * 0.38) +
      Math.log1p(Math.sqrt(Math.min(count, GALAXY.TOPIC_RING_SURFACE_MAX))) *
        Math.max(GALAXY.TOPIC_RING_RADIUS_SCALE, groupSpread * 0.07)) *
    MORPHOLOGY_LAYOUT.RING_RADIUS_SCALE
  if (maxRingR != null && maxRingR > 0) {
    ringR = Math.min(ringR, maxRingR)
  }
  const surfaceMax = Math.max(4, GALAXY.TOPIC_RING_SURFACE_MAX ?? 36)
  const onRingCount = Math.min(count, surfaceMax)
  const cloudSpread = Math.max(groupSpread * 0.55, ringR * 0.72)
  const phase = hashUnitLocal(hashStr(`ring-phase:${ringKey}`), 0) * Math.PI * 2
  const h0 = hashStr(ringKey)
  const tiltA =
    gauss3(hashSeed(h0, 'ta'), hashSeed(h0, 'tb'), hashSeed(h0, 'tc')) * 0.72
  const tiltB =
    planeTangAng +
    gauss3(hashSeed(h0, 'td'), hashSeed(h0, 'te'), hashSeed(h0, 'tf')) * 0.38
  const ca = Math.cos(tiltA)
  const sa = Math.sin(tiltA)
  const cb = Math.cos(tiltB)
  const sb = Math.sin(tiltB)

  for (let j = 0; j < count; j += 1) {
    const i = indices[j] as number
    const v = virtualStars[i] as VirtualStar
    const h = hashStr(v.virtualKey)

    let lx: number
    let ly: number
    let lz: number

    if (j < onRingCount) {
      const angJitter =
        (hashUnitLocal(h, 14) - 0.5) *
        ((Math.PI * 2) / Math.max(onRingCount, 1)) *
        0.65
      const ang = phase + (Math.PI * 2 * j) / onRingCount + angJitter
      const tubeAng = hashUnitLocal(h, 9) * Math.PI * 2
      const radialJitter = (hashUnitLocal(h, 8) - 0.5) * ringR * 0.14
      const r = ringR + radialJitter
      const tube =
        groupSpread *
        (0.05 + hashUnitLocal(h, 13) * 0.08) *
        MORPHOLOGY_LAYOUT.RING_TUBE_SCALE *
        Math.sin(tubeAng)

      lx = Math.cos(ang) * r
      ly =
        Math.sin(tubeAng) * groupSpread * 0.22 +
        gauss3(hashSeed(h, 'y1'), hashSeed(h, 'y2'), hashSeed(h, 'y3')) *
          groupSpread *
          0.1
      lz = Math.sin(ang) * r
      lx += Math.cos(tubeAng) * tube
      lz += Math.sin(tubeAng) * tube
      if (ringStarFlags) ringStarFlags[i] = 1
    } else {
      const rad = nebulaSampleRadius(h, cloudSpread)
      const ang = hashUnitLocal(h, 10) * Math.PI * 2
      const lift = hashUnitLocal(h, 11)
      lx = Math.cos(ang) * rad
      ly = (lift - 0.5) * cloudSpread * 0.35
      lz = Math.sin(ang) * rad
      if (ringStarFlags) ringStarFlags[i] = 0
    }

    const ly1 = ly * ca - lz * sa
    const lz1 = ly * sa + lz * ca
    const lx2 = lx * cb + lz1 * sb
    const lz2 = -lx * sb + lz1 * cb

    positions[i * 3] = cx + lx2
    positions[i * 3 + 1] = cy + ly1
    positions[i * 3 + 2] = cz + lz2
  }
}
