import { OTHER_LANGUAGE_KEY } from '../../utils/other-language'
import { GALAXY } from '../constants'
import { hashStr } from '../hash'
import { galaxyRadiusForLanguage } from '../morphological-layout'
import { hashUnitLocal } from './hashUnitLocal'
import { measureGroupFromPositions } from './measureGroupFromPositions'
import { placeRingGroup } from './placeRingGroup'
import { topicRingKey } from './topicRingKey'
import type {
  ApplyTopicRingRefinementOptions,
  LayoutLike,
  VirtualStar,
} from './types'
import { virtualLanguageKey } from './virtualLanguageKey'

/** 力导向后的 topic 环几何微调（仅处理成环组，不改云团） */
export const applyTopicRingRefinement = (
  virtualStars: VirtualStar[] | null | undefined,
  positions: Float32Array,
  layout: LayoutLike,
  ringKeys: Set<string> | null | undefined,
  opts: ApplyTopicRingRefinementOptions = {},
): void => {
  const n = virtualStars?.length ?? 0
  if (!n || !ringKeys?.size) return

  const stars = virtualStars as VirtualStar[]
  const totalRepos = Math.max(opts.totalRepos ?? 1, 1)
  const sf = Math.min(layout?.spreadFactor ?? 1, 1.32)
  const ringFrac = opts.ringRadiusFrac ?? GALAXY.TOPIC_RING_GALAXY_FRAC ?? 0.46
  const hubs = opts.hubs
  const ringStarFlags = opts.ringStarFlags ?? null

  const ringGroups = new Map<string, number[]>()
  for (let i = 0; i < n; i += 1) {
    const v = stars[i] as VirtualStar
    const lang = virtualLanguageKey(v, layout)
    const ringKey = v.topic ? topicRingKey(lang, v.topic) : ''
    if (v.topic && ringKeys.has(ringKey)) {
      if (!ringGroups.has(ringKey)) ringGroups.set(ringKey, [])
      ;(ringGroups.get(ringKey) as number[]).push(i)
    }
  }

  for (const [ringKey, indices] of ringGroups) {
    const lang = ringKey.split('\0')[0] || OTHER_LANGUAGE_KEY
    const group = measureGroupFromPositions(indices, positions)
    const gR = galaxyRadiusForLanguage(lang, layout, totalRepos) * sf
    const maxRingR =
      gR *
      ringFrac *
      (0.55 + hashUnitLocal(hashStr(`ring-r:${ringKey}`), 1) * 0.22)

    let rcx = group.cx
    let rcy = group.cy
    let rcz = group.cz
    const hub = hubs?.get(lang)
    if (hub) {
      const dx = rcx - hub[0]
      const dz = rcz - hub[2]
      const toHub = Math.hypot(dx, dz)
      const maxOff = gR * 0.38
      if (toHub > maxOff) {
        const s = maxOff / toHub
        rcx = hub[0] + dx * s
        rcz = hub[2] + dz * s
        rcy = hub[1] + (rcy - hub[1]) * s
      }
    }

    placeRingGroup(
      stars,
      indices,
      positions,
      rcx,
      rcy,
      rcz,
      Math.max(group.spread, gR * 0.12),
      ringKey,
      0,
      maxRingR,
      ringStarFlags,
    )
  }
}
