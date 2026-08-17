import { PUSH_RECENCY_HALF_LIFE_DAYS } from '../constants'

/** 最近推送时效分 0~1，越近越大 */
export const pushRecencyScore = (pushedAt: string | undefined): number => {
  const ts = Date.parse(pushedAt || '')
  if (!Number.isFinite(ts)) return 0.08
  const ageDays = (Date.now() - ts) / 86400000
  return Math.max(0.05, 1 - Math.min(1, ageDays / PUSH_RECENCY_HALF_LIFE_DAYS))
}
