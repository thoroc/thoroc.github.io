import type {
  GalaxyGasBuffersResult,
  GalaxyGasDustBuffersResult,
} from '../gas-buffers'
import type { GalaxyLayout } from '../layout-payload'
import type { MotionFields } from '../motion'
import type { RepoLike } from '../repo-position'
import type { LegendEntry, StarTierBucket } from '../star-visuals'
import type { HarmonizeMeta } from '../virtual-star-placement'
import type { VirtualStar } from '../virtual-stars'

export type {
  GalaxyGasBuffersResult,
  GalaxyGasDustBuffersResult,
} from '../gas-buffers'
export type { MotionFields } from '../motion'
export type {
  LanguageLayout as LayoutLike,
  MaxCtx,
  RepoLike,
} from '../repo-position'
export type { HarmonizeMeta } from '../virtual-star-placement'
export type { VirtualStar } from '../virtual-stars'

export interface GalaxyCtx {
  layout?: Partial<GalaxyLayout> | null
  virtualIndexMap?: Map<string, number> | null
}

export interface GalaxyPositionsResolution {
  positions: Float32Array
  anchorIndex: number
  harmonizeMeta: HarmonizeMeta | null
}

export interface StarVisualBuffers {
  colors: Float32Array
  brights: Float32Array
  activities: Float32Array
  seeds: Float32Array
  idToIndex: Map<string, number>
}

export interface GalaxyBuffers {
  count: number
  maxStars: number
  positions: Float32Array
  colors: Float32Array
  sizes: Float32Array
  brights: Float32Array
  activities: Float32Array
  seeds: Float32Array
  idToIndex: Map<string, number>
  repoIdToIndices: Map<string, number[]>
  items: RepoLike[]
  virtualStars: VirtualStar[]
  ringKeys: Set<string>
  legend: LegendEntry[]
  starTiers: StarTierBucket[]
  motion: MotionFields
  anchorIndex: number
  gas: GalaxyGasBuffersResult
  gasDust: GalaxyGasDustBuffersResult
  ringStarFlags: Float32Array
}
