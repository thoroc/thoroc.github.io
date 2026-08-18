import type * as THREE from 'three'
import type { Vec3 } from '../../galaxy/motion'
import type {
  GalaxyGasBuffersResult,
  GalaxyGasDustBuffersResult,
  MotionFields,
  RepoLike,
  VirtualStar,
} from '../../galaxy/positions'
import type { StarsRepoItem } from '../useStarsStore'

export interface GasLangLayer {
  pivot: THREE.Group
  geometry: THREE.BufferGeometry
  hub: Vec3
  omega: [number, number, number, number]
  omega2: [number, number, number, number]
}

export interface GasLangMotion {
  hub: Vec3
  omega: [number, number, number, number]
  omega2: [number, number, number, number]
}

/**
 * finalizeGalaxyMotion always attaches `langMotions` onto the gas/gas-dust
 * buffers via fillGasMotionFields, but GalaxyGasBuffersResult/
 * GalaxyGasDustBuffersResult don't declare the field — extended locally
 * here rather than widening those upstream interfaces.
 */
export type GasBuffersWithMotion = GalaxyGasBuffersResult & {
  langMotions?: GasLangMotion[]
}
export type GasDustBuffersWithMotion = GalaxyGasDustBuffersResult & {
  langMotions?: GasLangMotion[]
}

export interface GalaxyBuffersState {
  starCount: number
  restPositions: Float32Array | null
  starSizes: Float32Array | null
  starBrights: Float32Array | null
  motionFields: MotionFields | null
  idToIndex: Map<string, number>
  repoIdToIndices: Map<string, number[]>
  currentVirtualStars: VirtualStar[]
  currentItems: RepoLike[]
  interactionData: Float32Array | null
  anchorStarIndex: number
  ownerStarIndex: number
  legendLangSet: Set<string>
  gasLangLayers: GasLangLayer[]
  gasDustLangLayers: GasLangLayer[]
  fieldGasMesh: THREE.Points | null
  fieldGasDustMesh: THREE.Points | null
  fieldVolumeMesh: THREE.Mesh | null
}

export interface GalaxyBuffersCallbacks {
  syncSelectedIndex: (id: string) => void
  setHoverIndexNull: () => void
  onSelect: (item: StarsRepoItem) => void
}
