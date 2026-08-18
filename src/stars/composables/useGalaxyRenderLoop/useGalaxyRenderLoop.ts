import type { UseGalaxyBuffersReturn } from '../useGalaxyBuffers'
import type { UseGalaxyCameraReturn } from '../useGalaxyCamera'
import type { GalaxySceneState } from '../useGalaxyScene'
import type { GalaxyRenderLoopState } from './types'

const TWINKLE_FRAME_MS = 33

/**
 * Owns the RAF loop, its frame-accumulated time (`motionTimeSec`/`lastFrameMs`),
 * and the `needsRender` render-gate. `markRender` is exposed standalone (no
 * dependency on scene/camera/buffers) so every other composable can be
 * constructed with it before this composable's `start()` is called with
 * their fully-wired APIs — see StarsGalaxyView.vue's construction order.
 */
export const useGalaxyRenderLoop = () => {
  const state: GalaxyRenderLoopState = {
    needsRender: true,
    animationId: null,
    lastRenderMs: 0,
    motionTimeSec: 0,
    lastFrameMs: 0,
    animationPausedByVisibility: false,
  }

  const markRender = (): void => {
    state.needsRender = true
  }

  const getMotionTimeSec = (): number => state.motionTimeSec

  let sceneState: GalaxySceneState | null = null
  let cameraApi: UseGalaxyCameraReturn | null = null
  let buffersApi: UseGalaxyBuffersReturn | null = null

  const animate = (now: number): void => {
    state.animationId = requestAnimationFrame(animate)
    if (!sceneState || !cameraApi || !buffersApi) return

    const dtSec =
      state.lastFrameMs > 0
        ? Math.min((now - state.lastFrameMs) * 0.001, 0.05)
        : 0
    state.lastFrameMs = now

    const { camera, controls, cameraTransition } = sceneState
    const cameraAnimating =
      cameraTransition?.active && controls && camera
        ? cameraApi.tickCameraTransition(now)
        : false
    if (!cameraAnimating) {
      cameraApi.applyCameraAutoRotate(dtSec)
      controls?.update()
    }

    if (
      cameraApi.autoRotate.value &&
      !cameraApi.state.autoRotateSuspended &&
      !cameraApi.state.galaxyMotionFrozen
    ) {
      state.motionTimeSec += dtSec
    }

    const timeSec = now * 0.001
    if (sceneState.pointMaterial) {
      ;(sceneState.pointMaterial.uniforms.uTime as { value: number }).value =
        timeSec
      ;(
        sceneState.pointMaterial.uniforms.uMotionTime as { value: number }
      ).value = state.motionTimeSec
    }
    if (sceneState.gasMaterial) {
      ;(sceneState.gasMaterial.uniforms.uTime as { value: number }).value =
        timeSec
    }
    sceneState.nebulaVolumeTimeUniform.value = timeSec
    if (buffersApi.state.gasLangLayers.length > 0) {
      buffersApi.updateGasLangLayers()
    }

    const scene = sceneState.sceneRef.value
    const renderer = sceneState.rendererRef.value
    if (!scene || !renderer || !camera) return

    const shouldRender =
      state.needsRender ||
      cameraAnimating ||
      (cameraApi.autoRotate.value && !cameraApi.state.autoRotateSuspended) ||
      buffersApi.state.starCount > 0 ||
      now - state.lastRenderMs >= TWINKLE_FRAME_MS
    if (!shouldRender) return

    renderer.render(scene, camera)
    state.lastRenderMs = now
    state.needsRender = false
  }

  const start = (
    scene: GalaxySceneState,
    camera: UseGalaxyCameraReturn,
    buffers: UseGalaxyBuffersReturn,
  ): void => {
    sceneState = scene
    cameraApi = camera
    buffersApi = buffers
    state.animationId = requestAnimationFrame(animate)
  }

  const pauseGalaxyForDocumentHidden = (): void => {
    if (state.animationPausedByVisibility || state.animationId == null) return
    cancelAnimationFrame(state.animationId)
    state.animationId = null
    state.animationPausedByVisibility = true
    state.lastFrameMs = 0
  }

  const resumeGalaxyFromDocumentVisible = (): void => {
    if (!state.animationPausedByVisibility) return
    state.animationPausedByVisibility = false
    state.lastFrameMs = 0
    if (state.animationId == null) {
      state.animationId = requestAnimationFrame(animate)
    }
  }

  const onDocumentVisibilityChange = (): void => {
    if (document.hidden) {
      pauseGalaxyForDocumentHidden()
      return
    }
    resumeGalaxyFromDocumentVisible()
    markRender()
  }

  const resetMotionClock = (): void => {
    state.motionTimeSec = 0
    state.lastFrameMs = 0
  }

  const dispose = (): void => {
    if (state.animationId != null) cancelAnimationFrame(state.animationId)
    state.animationId = null
    state.motionTimeSec = 0
    state.lastFrameMs = 0
    state.animationPausedByVisibility = false
    sceneState = null
    cameraApi = null
    buffersApi = null
  }

  return {
    state,
    markRender,
    getMotionTimeSec,
    start,
    pauseGalaxyForDocumentHidden,
    resumeGalaxyFromDocumentVisible,
    onDocumentVisibilityChange,
    resetMotionClock,
    dispose,
  }
}

export type UseGalaxyRenderLoopReturn = ReturnType<typeof useGalaxyRenderLoop>
