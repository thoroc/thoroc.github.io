export type { LanguageLayout as LayoutLike } from '../repo-position'
export type { Vec3 } from '../virtual-star-placement'

import type { Vec3 } from '../virtual-star-placement'

export interface VirtualStarLike {
  virtualKey: string
  repoId: string
  item: object
  language: string
  topic: string | null
}

export interface MotionFields {
  galaxyHubs: Float32Array
  nebulaCenters: Float32Array
  motionOmega: Float32Array
  motionOmega2: Float32Array
  yBobAmp: Float32Array
  yBobPhase: Float32Array
}

export interface GasBuffersLike {
  count: number
  languages?: string[]
  perGalaxy?: number
  corePerGalaxy?: number
  galaxyHubs?: Float32Array
  motionOmega?: Float32Array
  motionOmega2?: Float32Array
  langMotions?: Array<{
    hub: Vec3
    omega: [number, number, number, number]
    omega2: [number, number, number, number]
  }>
}
