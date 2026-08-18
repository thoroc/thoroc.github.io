export interface GalaxyRenderLoopState {
  needsRender: boolean
  animationId: number | null
  lastRenderMs: number
  motionTimeSec: number
  lastFrameMs: number
  animationPausedByVisibility: boolean
}

export interface GalaxyFrameSceneDeps {
  sceneRef: { value: import('three').Scene | null }
  rendererRef: { value: import('three').WebGLRenderer | null }
  pointMaterial: import('three').ShaderMaterial | null
  gasMaterial: import('three').ShaderMaterial | null
  nebulaVolumeTimeUniform: { value: number }
}

export interface GalaxyFrameCameraDeps {
  camera: import('three').PerspectiveCamera | null
  controls: import('../../galaxy/zoom-controls').TrackballControls | null
  cameraTransition:
    | import('../../galaxy/camera-transition').CameraTransition
    | null
  autoRotate: { value: boolean }
  state: { autoRotateSuspended: boolean; galaxyMotionFrozen: boolean }
  applyCameraAutoRotate: (dtSec: number) => void
  tickCameraTransition: (now: number) => boolean
}

export interface GalaxyFrameBuffersDeps {
  starCount: number
  gasLangLayers: unknown[]
  updateGasLangLayers: () => void
}
