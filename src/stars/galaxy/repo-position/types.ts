export type { Rgb } from '../colors'

export interface RepoLike {
  id?: string
  fullName?: string
  language?: string | null
  topics?: string[]
  stars?: number
  forksCount?: number
  watchersCount?: number
  pushedAt?: string
  starredAt?: string
}

export interface MaxCtx {
  maxStars: number
  maxForks: number
  maxWatchers: number
}

export interface InfluenceRange {
  MIN: number
  MAX: number
  GAMMA: number
}

export interface VirtualStarLike {
  virtualKey: string
  topic?: string | null
}

export interface LanguageLayout {
  langAngles: Map<string, number>
  langWedge: Map<string, number>
  langRadial: Map<string, number>
  langCounts: Map<string, number>
  langKeys: Set<string>
  languages: string[]
  wedge: number
  spreadFactor: number
}
