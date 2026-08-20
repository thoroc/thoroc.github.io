import { stableCollator } from '../../utils/stable-collator'
import { GALAXY, R_MAX, R_MIN } from '../constants'
import { hashStr, hashUnit } from '../hash'
import type { LanguageLayout, RepoLike } from './types'

/** 为当前可见仓库分配语言团中心（黄金角 + 按数量分角宽，避免等分扇区拉成星带） */
export const buildLanguageLayout = (
  items: RepoLike[] | null | undefined,
): LanguageLayout => {
  const list = items || []
  const counts = new Map<string, number>()
  for (const item of list) {
    const key = item.language || '其他'
    counts.set(key, (counts.get(key) || 0) + 1)
  }

  const sorted = [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || stableCollator(a[0], b[0]),
  )
  const topN = GALAXY.LAYOUT_LANG_TOP
  const primaryTop = sorted.slice(0, topN).map(([name]) => name)
  const topSet = new Set(primaryTop)
  const layoutLangs = [...primaryTop]
  if (!topSet.has('其他')) layoutLangs.push('其他')

  const n = Math.max(layoutLangs.length, 1)
  const total = Math.max(list.length, 1)
  const golden = Math.PI * (3 - Math.sqrt(5))
  const langAngles = new Map<string, number>()
  const langWedge = new Map<string, number>()
  const langRadial = new Map<string, number>()
  const langCounts = new Map<string, number>()
  const langKeys = new Set(layoutLangs)

  layoutLangs.forEach((name, i) => {
    let count = 0
    if (name === '其他') {
      for (const item of list) {
        const key = item.language || '其他'
        if (!topSet.has(key)) count += 1
      }
      if (topSet.has('其他')) count += counts.get('其他') || 0
    } else {
      count = counts.get(name) || 0
    }
    const share = Math.max(count, 1) / total
    const ang = i * golden * 2.4 - Math.PI / 2
    const lh = hashStr(`lang-layout:${name}`)
    const rBase = 0.04 + ((i + 0.5) / n) * 0.78
    const rJitter = hashUnit(lh, 8) * 0.2
    const rr =
      R_MIN * 0.08 +
      (R_MAX - R_MIN) *
        Math.min(0.96, rBase + rJitter + Math.sqrt(share) * 0.14)
    langAngles.set(name, ang)
    langRadial.set(name, rr)
    langCounts.set(name, count)
    langWedge.set(name, Math.PI * 2 * Math.sqrt(share) * GALAXY.LANG_WEDGE_FILL)
  })

  const spreadFactor = Math.max(1.25, (Math.max(list.length, 1) / 650) ** 0.4)

  return {
    langAngles,
    langWedge,
    langRadial,
    langCounts,
    langKeys,
    languages: layoutLangs,
    wedge: (Math.PI * 2) / n,
    spreadFactor,
  }
}
