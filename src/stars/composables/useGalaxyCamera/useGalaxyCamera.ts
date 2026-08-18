import * as THREE from 'three'
import { ref } from 'vue'
import { GALAXY_ZOOM } from '../../galaxy/constants'
import type { CameraView, OrbitControls } from '../../galaxy/zoom-controls'
import {
  dollyCameraUniformRange,
  resolveDollyCameraView,
} from '../../galaxy/zoom-controls'
import type { GalaxyInteractionState } from '../useGalaxyInteraction'
import type { GalaxySceneState } from '../useGalaxyScene'
import type { GalaxyCameraState, GalaxyResetViewDeps } from './types'

/**
 * zoom-controls' pure functions type their `controls` param against three's
 * OrbitControls, but this view drives a TrackballControls instance — both
 * expose the `.target`/camera-transform surface those functions actually
 * read (OrbitControls-only members like autoRotate/damping are never
 * touched). Cast at every call site into zoom-controls rather than
 * widening zoom-controls' own types.
 */
export const asOrbitControls = (
  c: import('three/examples/jsm/controls/TrackballControls.js').TrackballControls,
): OrbitControls => c as unknown as OrbitControls

/**
 * Camera manipulation, auto-rotate, and camera-transition control. Reads
 * the Three.js camera/controls/viewPivot/galaxyGroup/cameraTransition
 * handles from the shared scene state box, and the gesture flags
 * (orbitGestureActive/pinchActive/pointerDown) from the shared interaction
 * state box, since auto-rotate must suspend during any active drag/pinch
 * regardless of which composable initiated it.
 */
export const useGalaxyCamera = (
  scene: GalaxySceneState,
  interaction: GalaxyInteractionState,
  markRender: () => void,
) => {
  const autoRotate = ref(true)
  const state: GalaxyCameraState = {
    autoRotateSuspended: false,
    galaxyMotionFrozen: false,
    defaultView: null,
  }
  let autoRotateScratch: THREE.Vector3 | null = null

  const saveDefaultView = (): void => {
    if (!scene.camera || !scene.controls) return
    state.defaultView = {
      position: scene.camera.position.clone(),
      target: scene.controls.target.clone(),
      pivotQuaternion: scene.viewPivot
        ? scene.viewPivot.quaternion.clone()
        : new THREE.Quaternion(),
    }
  }

  const resetViewPivot = (): void => {
    if (!scene.viewPivot) return
    scene.viewPivot.rotation.set(0, 0, 0)
    scene.viewPivot.quaternion.set(0, 0, 0, 1)
  }

  const cancelCameraTransition = (): void => {
    if (scene.cameraTransition?.active) {
      scene.cameraTransition.cancel()
      state.autoRotateSuspended = false
    }
  }

  const suspendGalaxyMotion = (): void => {
    state.galaxyMotionFrozen = true
    state.autoRotateSuspended = true
  }

  const syncAutoRotateAfterInteraction = (): void => {
    if (interaction.pointerDown || interaction.orbitGestureActive) return
    state.galaxyMotionFrozen = false
    state.autoRotateSuspended = false
  }

  const applyCameraAutoRotate = (dtSec: number): void => {
    if (
      !scene.camera ||
      !scene.controls ||
      !autoRotate.value ||
      state.autoRotateSuspended ||
      state.galaxyMotionFrozen
    )
      return
    if (
      scene.cameraTransition?.active ||
      interaction.orbitGestureActive ||
      interaction.pinchActive ||
      interaction.pointerDown
    )
      return
    if (!autoRotateScratch) autoRotateScratch = new THREE.Vector3()
    // 与 OrbitControls autoRotateSpeed 同一换算：2π/60 × speed × dt
    const angle =
      ((Math.PI * 2) / 60) * (GALAXY_ZOOM.AUTO_ROTATE_SPEED ?? 0.32) * dtSec
    autoRotateScratch.subVectors(scene.camera.position, scene.controls.target)
    autoRotateScratch.applyAxisAngle(new THREE.Vector3(0, 1, 0), -angle)
    scene.camera.position.copy(scene.controls.target).add(autoRotateScratch)
    markRender()
  }

  const animateCameraTo = (
    view: CameraView,
    durationMs: number,
    onComplete?: () => void,
  ): void => {
    if (!scene.controls || !scene.camera || !scene.cameraTransition || !view)
      return
    state.autoRotateSuspended = true
    scene.cameraTransition.start(
      asOrbitControls(scene.controls),
      scene.camera,
      view,
      {
        durationMs,
        onComplete: () => {
          state.autoRotateSuspended = false
          onComplete?.()
          markRender()
        },
      },
    )
    markRender()
  }

  const animateDolly = (
    notches: number,
    durationMs: number = GALAXY_ZOOM.CAMERA_DOLLY_MS,
  ): void => {
    if (!scene.controls || !scene.camera) return
    const view = resolveDollyCameraView(
      asOrbitControls(scene.controls),
      scene.camera,
      notches,
    )
    if (!view) return
    animateCameraTo(view, durationMs)
  }

  const dollyByNotches = (notches: number): void => {
    if (!scene.controls || !scene.camera || !notches) return
    cancelCameraTransition()
    dollyCameraUniformRange(
      asOrbitControls(scene.controls),
      scene.camera,
      notches,
    )
    markRender()
  }

  const zoomIn = (): void => {
    if (!scene.controls || !scene.camera) return
    animateDolly(-GALAXY_ZOOM.ZOOM_SPEED, GALAXY_ZOOM.CAMERA_DOLLY_MS)
  }

  const zoomOut = (): void => {
    if (!scene.controls || !scene.camera) return
    animateDolly(GALAXY_ZOOM.ZOOM_SPEED, GALAXY_ZOOM.CAMERA_DOLLY_MS)
  }

  const toggleAutoRotate = (): void => {
    autoRotate.value = !autoRotate.value
    markRender()
  }

  const tickCameraTransition = (now: number): boolean => {
    if (!scene.cameraTransition?.active || !scene.controls || !scene.camera)
      return false
    return scene.cameraTransition.tick(
      now,
      asOrbitControls(scene.controls),
      scene.camera,
    )
  }

  const resetView = (deps: GalaxyResetViewDeps): void => {
    if (!state.defaultView || !scene.controls || !scene.camera) return
    const view = state.defaultView
    cancelCameraTransition()
    animateCameraTo(view, GALAXY_ZOOM.CAMERA_RESET_MS, () => {
      if (scene.viewPivot) scene.viewPivot.quaternion.copy(view.pivotQuaternion)
      if (scene.galaxyGroup) scene.galaxyGroup.rotation.y = 0
      deps.resetMotionClock()
      if (scene.pointMaterial)
        (scene.pointMaterial.uniforms.uMotionTime as { value: number }).value =
          0
      deps.clearLegendFilter()
      deps.setHoverIndexNull()
    })
  }

  const dispose = (): void => {
    cancelCameraTransition()
    state.galaxyMotionFrozen = false
    state.autoRotateSuspended = false
  }

  return {
    autoRotate,
    state,
    saveDefaultView,
    resetViewPivot,
    cancelCameraTransition,
    suspendGalaxyMotion,
    syncAutoRotateAfterInteraction,
    applyCameraAutoRotate,
    animateCameraTo,
    animateDolly,
    dollyByNotches,
    zoomIn,
    zoomOut,
    toggleAutoRotate,
    tickCameraTransition,
    resetView,
    dispose,
  }
}

export type UseGalaxyCameraReturn = ReturnType<typeof useGalaxyCamera>
