import { MORPHOLOGY_LAYOUT } from '../constants'
import { gauss3, hashSeed, hashUnit } from '../hash'
import type { Vec3 } from './types'

/** 场星 / 无 topic 仓：锚点附近小抖动 */
export const placeRepoStar = (
  repoAnchor: Vec3,
  positions: Float32Array,
  i: number,
  h: number,
  sf: number,
): void => {
  const { REPO_JITTER_MIN, REPO_JITTER_MAX } = MORPHOLOGY_LAYOUT
  const jitter =
    REPO_JITTER_MIN + hashUnit(h, 7) * (REPO_JITTER_MAX - REPO_JITTER_MIN)
  const s = jitter * sf
  positions[i * 3] =
    repoAnchor[0] +
    gauss3(hashSeed(h, 'rx1'), hashSeed(h, 'rx2'), hashSeed(h, 'rx3')) * s
  positions[i * 3 + 1] =
    repoAnchor[1] +
    gauss3(hashSeed(h, 'ry1'), hashSeed(h, 'ry2'), hashSeed(h, 'ry3')) *
      s *
      0.55
  positions[i * 3 + 2] =
    repoAnchor[2] +
    gauss3(hashSeed(h, 'rz1'), hashSeed(h, 'rz2'), hashSeed(h, 'rz3')) * s
}
