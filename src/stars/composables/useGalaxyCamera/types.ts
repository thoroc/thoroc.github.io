import type * as THREE from 'three'

export interface GalaxyDefaultView {
  position: THREE.Vector3
  target: THREE.Vector3
  pivotQuaternion: THREE.Quaternion
}

export interface GalaxyCameraState {
  autoRotateSuspended: boolean
  galaxyMotionFrozen: boolean
  defaultView: GalaxyDefaultView | null
}

export interface GalaxyResetViewDeps {
  clearLegendFilter: () => void
  setHoverIndexNull: () => void
  resetMotionClock: () => void
}
