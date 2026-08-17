export type { MaxCtx } from '../repo-position'

export interface RepoLike {
  language?: string | null
  stars?: number
  forksCount?: number
  watchersCount?: number
}

export interface LegendEntry {
  name: string
  count: number
}

export interface StarTierBucket {
  key: string
  min: number
  count: number
}
