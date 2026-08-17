import type { LanguageLayout as LayoutLike, RepoLike } from '../repo-position'

export type { LayoutLike, RepoLike }

export interface VirtualStar {
  repoId: string
  item: RepoLike
  language: string
  topic: string | null
  virtualKey: string
}

export interface ApplyTopicRingRefinementOptions {
  totalRepos?: number
  ringRadiusFrac?: number
  hubs?: Map<string, [number, number, number]>
  ringStarFlags?: Float32Array | null
}
