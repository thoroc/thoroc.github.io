interface AnchorCandidate {
  id?: string
  starredAt?: string
}

/** 锚点仓库：最早 star 的那条记录（「中心星」定位用） */
export const findAnchorRepoId = (items: AnchorCandidate[]): string | null => {
  const list = items || []
  if (!list.length) return null

  let best = 0
  let bestMs = Number.POSITIVE_INFINITY
  for (let i = 0; i < list.length; i += 1) {
    const t = Date.parse(list[i]?.starredAt || '')
    if (Number.isFinite(t) && t < bestMs) {
      bestMs = t
      best = i
    }
  }
  return list[best]?.id ?? null
}
