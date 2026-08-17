export type { VirtualStarLike } from '../motion/types'
export type { LanguageLayout as LayoutLike } from '../repo-position'
export type { HarmonizeMeta, Vec3 } from '../virtual-star-placement'

export interface LanguageHubMotion {
  universeOrbit: number
  galaxySpin: number
  galaxyOrbit: number
  tiltMix: number
}
