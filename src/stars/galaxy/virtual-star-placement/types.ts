import type { GalaxyLayoutLike } from '../galaxy-field'

export type Vec3 = [number, number, number]

export interface RepoLike {
  id?: string
  language?: string | null
}

export interface VirtualStarLike {
  virtualKey: string
  repoId: string
  topic?: string | null
  item?: { language?: string | null }
  language?: string | null
}

export type PlacementLayout = GalaxyLayoutLike & {
  spreadFactor?: number
}

export interface TopicClusterAccumulator {
  sx: number
  sy: number
  sz: number
  repoN: number
}

export type TopicClusterCenter = [number, number, number, number]

export interface HarmonizeMeta {
  cx: number
  cy: number
  cz: number
  scale: number
  yFlatten: number
}

export interface AuxBuffer {
  buf: Float32Array
  n: number
}
