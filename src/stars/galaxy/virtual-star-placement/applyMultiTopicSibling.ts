import { COSMIC_UNIVERSE } from '../constants'
import { gauss3, hashSeed, hashStr } from '../hash'
import type { Vec3, VirtualStarLike } from './types'

/** 同仓多 topic：聚星极近距偏移 */
export const applyMultiTopicSibling = (
  v: VirtualStarLike,
  _repoAnchor: Vec3,
  topicSlot: number,
  topicCount: number,
  positions: Float32Array,
  i: number,
  sf: number,
): void => {
  if (topicCount <= 1 || !v.topic) return
  const h = hashStr(v.virtualKey)
  const { MULTI_TOPIC_SIBLING } = COSMIC_UNIVERSE
  const sibling = sf * MULTI_TOPIC_SIBLING * (0.22 + topicCount * 0.06)
  positions[i * 3] =
    (positions[i * 3] as number) +
    gauss3(hashSeed(h, 'st1'), hashSeed(h, 'st2'), hashSeed(h, 'st3')) *
      sibling +
    topicSlot * sibling * 0.08
  positions[i * 3 + 1] =
    (positions[i * 3 + 1] as number) +
    gauss3(hashSeed(h, 'st4'), hashSeed(h, 'st5'), hashSeed(h, 'st6')) *
      sibling *
      0.45
  positions[i * 3 + 2] =
    (positions[i * 3 + 2] as number) +
    gauss3(hashSeed(h, 'st7'), hashSeed(h, 'st8'), hashSeed(h, 'st9')) * sibling
}
