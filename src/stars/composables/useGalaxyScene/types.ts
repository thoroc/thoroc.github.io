import type * as THREE from 'three'
import type { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import type { CameraTransition } from '../../galaxy/camera-transition'

export interface GalaxySceneState {
  sceneRef: { value: THREE.Scene | null }
  rendererRef: { value: THREE.WebGLRenderer | null }
  camera: THREE.PerspectiveCamera | null
  controls: TrackballControls | null
  viewPivot: THREE.Group | null
  galaxyGroup: THREE.Group | null
  points: THREE.Points | null
  dust: THREE.Points | null
  cosmicSky: THREE.Mesh | null
  pointMaterial: THREE.ShaderMaterial | null
  gasMaterial: THREE.ShaderMaterial | null
  gasDustMaterial: THREE.ShaderMaterial | null
  resizeObserver: ResizeObserver | null
  cameraTransition: CameraTransition | null
  nebulaVolumeTimeUniform: { value: number }
}

export interface GalaxySceneInteractionHandlers {
  onPointerDown: (event: PointerEvent) => void
  onPointerMove: (event: PointerEvent) => void
  onPointerUp: (event: PointerEvent) => void
  onPointerCancel: (event: PointerEvent) => void
  onCanvasLeave: () => void
  onGalaxyWheel: (event: WheelEvent) => void
  onGalaxyAuxClick: (event: MouseEvent) => void
}
