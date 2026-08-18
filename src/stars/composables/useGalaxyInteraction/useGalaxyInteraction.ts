import { GALAXY_ZOOM } from '../../galaxy/constants'
import { pickStarIndexScreen } from '../../galaxy/pick'
import {
  applyTrackballRotate,
  nudgeOrbitCamera,
} from '../../galaxy/zoom-controls'
import type { UseGalaxyBuffersReturn } from '../useGalaxyBuffers'
import type { UseGalaxyCameraReturn } from '../useGalaxyCamera'
import type { GalaxySceneState } from '../useGalaxyScene'
import type { StarsStore } from '../useStarsStore'
import {
  DRAG_THRESHOLD_SQ,
  type GalaxyInteractionState,
  type PickViewSnapshot,
} from './types'

export interface GalaxyInteractionCallbacks {
  setHoverIndex: (
    idx: number | null,
    clientX?: number,
    clientY?: number,
  ) => void
  onResetKey: () => void
}

/**
 * Pointer/wheel/pinch gesture handling and star picking. Reads the Three.js
 * scene handles and depends on Camera (dolly/transition control) and
 * Buffers (pick geometry + focus-on-tap) since interaction is the piece
 * that drives every other piece in response to DOM events.
 */
export const useGalaxyInteraction = (
  scene: GalaxySceneState,
  state: GalaxyInteractionState,
  camera: UseGalaxyCameraReturn,
  buffers: UseGalaxyBuffersReturn,
  getMotionTimeSec: () => number,
  markRender: () => void,
  store: StarsStore,
  callbacks: GalaxyInteractionCallbacks,
) => {
  const clearPointerPick = (): void => {
    state.pointerPickIdx = null
    state.pointerPickView = null
  }

  const snapshotPickView = (): PickViewSnapshot | null => {
    if (!scene.camera || !scene.controls) return null
    return {
      motionSec: getMotionTimeSec(),
      camPos: scene.camera.position.clone(),
      target: scene.controls.target.clone(),
    }
  }

  const pickIndex = (
    clientX: number,
    clientY: number,
    motionSecOverride?: number,
  ): number | null => {
    const renderer = scene.rendererRef.value
    if (
      !renderer ||
      !scene.camera ||
      !scene.points ||
      !buffers.state.restPositions ||
      buffers.state.starCount <= 0
    )
      return null

    const rect = renderer.domElement.getBoundingClientRect()
    if (scene.viewPivot) scene.viewPivot.updateMatrixWorld(true)
    if (scene.galaxyGroup) scene.galaxyGroup.updateMatrixWorld(true)

    const idx = pickStarIndexScreen({
      camera: scene.camera,
      points: scene.points,
      restPositions: buffers.state.restPositions,
      starCount: buffers.state.starCount,
      clientX,
      clientY,
      canvasRect: rect,
      sizes: buffers.state.starSizes,
      brights: buffers.state.starBrights,
      pixelRatio: renderer.getPixelRatio(),
      motionFields: buffers.state.motionFields,
      motionTimeSec: motionSecOverride ?? getMotionTimeSec(),
    })
    if (idx == null || idx < 0 || idx >= buffers.state.currentItems.length)
      return null
    return idx
  }

  const pickIndexWithView = (
    clientX: number,
    clientY: number,
    view: PickViewSnapshot | null,
  ): number | null => {
    if (!view || !scene.camera || !scene.controls)
      return pickIndex(clientX, clientY, view?.motionSec)
    const savedPos = scene.camera.position.clone()
    const savedTarget = scene.controls.target.clone()
    scene.camera.position.copy(view.camPos)
    scene.controls.target.copy(view.target)
    scene.camera.lookAt(scene.controls.target)
    scene.camera.updateMatrixWorld(true)
    const idx = pickIndex(clientX, clientY, view.motionSec)
    scene.camera.position.copy(savedPos)
    scene.controls.target.copy(savedTarget)
    scene.camera.lookAt(scene.controls.target)
    scene.camera.updateMatrixWorld(true)
    scene.controls.update()
    return idx
  }

  const pinchPointerDistance = (): number | null => {
    if (state.activePointers.size < 2) return null
    const [a, b] = [...state.activePointers.values()]
    if (!a || !b) return null
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  const syncControlsForPointerCount = (): void => {
    if (!scene.controls) return
    scene.controls.enabled = !state.pinchActive && state.activePointers.size < 2
  }

  const beginPinchGesture = (event: PointerEvent): void => {
    if (event?.cancelable) event.preventDefault()
    state.pinchActive = true
    camera.cancelCameraTransition()
    clearPointerPick()
    state.pointerDown = null
    state.pointerDragMoved = false
    state.orbitGestureActive = false
    if (scene.controls) scene.controls.enabled = false
    const dist = pinchPointerDistance()
    if (dist != null) state.lastPinchDistance = dist
    markRender()
  }

  const endPinchGestureIfNeeded = (): void => {
    if (state.activePointers.size >= 2) return
    state.pinchActive = false
    state.lastPinchDistance = null
    syncControlsForPointerCount()
  }

  const trackPointerDrag = (event: PointerEvent): void => {
    if (!state.pointerDown || event.pointerId !== state.pointerDown.pointerId)
      return
    const dx = event.clientX - state.pointerDown.x
    const dy = event.clientY - state.pointerDown.y
    if (dx * dx + dy * dy > DRAG_THRESHOLD_SQ) state.pointerDragMoved = true
  }

  const applyOrbitDragFromPointer = (event: PointerEvent): void => {
    if (
      !scene.controls ||
      !scene.camera ||
      state.pinchActive ||
      state.activePointers.size > 1
    )
      return
    if (state.pointerDown?.button !== 0 || !(event.buttons & 1)) return

    if (state.orbitDragLastX == null || state.orbitDragLastY == null) {
      state.orbitDragLastX = event.clientX
      state.orbitDragLastY = event.clientY
      return
    }

    const dx = event.clientX - state.orbitDragLastX
    const dy = event.clientY - state.orbitDragLastY
    state.orbitDragLastX = event.clientX
    state.orbitDragLastY = event.clientY
    if (!dx && !dy) return

    camera.cancelCameraTransition()
    if (!state.orbitGestureActive) {
      state.orbitGestureActive = true
      camera.suspendGalaxyMotion()
      const renderer = scene.rendererRef.value
      if (renderer) renderer.domElement.style.cursor = 'grabbing'
    }

    const el = scene.rendererRef.value?.domElement
    applyTrackballRotate(
      scene.controls,
      scene.camera,
      dx,
      dy,
      el?.clientHeight ?? 480,
      GALAXY_ZOOM.ORBIT_ROTATE_SPEED ?? 2.4,
    )
    markRender()
  }

  const onPointerDown = (event: PointerEvent): void => {
    state.activePointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })

    if (state.activePointers.size >= 2) {
      beginPinchGesture(event)
      return
    }

    syncControlsForPointerCount()

    if (event.button === 1) {
      event.preventDefault()
      camera.cancelCameraTransition()
      state.middleDragLastY = event.clientY
      return
    }
    if (event.button !== 0) return
    camera.cancelCameraTransition()
    camera.suspendGalaxyMotion()
    state.pointerDragMoved = false
    state.pointerPickView = snapshotPickView()
    state.pointerPickIdx = pickIndexWithView(
      event.clientX,
      event.clientY,
      state.pointerPickView,
    )
    state.pointerDown = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
      button: event.button,
    }
    state.orbitDragLastX = event.clientX
    state.orbitDragLastY = event.clientY
  }

  const onCanvasHover = (event: PointerEvent): void => {
    state.pendingHover = { x: event.clientX, y: event.clientY }
    if (!state.hoverRaf) {
      state.hoverRaf = requestAnimationFrame(flushCanvasHover)
    }
  }

  const flushCanvasHover = (): void => {
    state.hoverRaf = 0
    const renderer = scene.rendererRef.value
    if (!renderer || !state.pendingHover) return
    const { x, y } = state.pendingHover
    state.pendingHover = null
    const idx = pickIndex(x, y)
    callbacks.setHoverIndex(idx, x, y)
    renderer.domElement.style.cursor = idx != null ? 'pointer' : 'grab'
  }

  const onPointerMove = (event: PointerEvent): void => {
    trackPointerDrag(event)
    state.activePointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })

    if (state.activePointers.size >= 2) {
      if (event.cancelable) event.preventDefault()
      if (!state.pinchActive) beginPinchGesture(event)
      const dist = pinchPointerDistance()
      if (dist != null && state.lastPinchDistance != null) {
        const delta = dist - state.lastPinchDistance
        if (Math.abs(delta) > 0.35) {
          camera.dollyByNotches(-delta * GALAXY_ZOOM.PINCH_NOTCH_PER_PX)
          state.lastPinchDistance = dist
        }
      } else if (dist != null) {
        state.lastPinchDistance = dist
      }
      markRender()
      return
    }

    applyOrbitDragFromPointer(event)

    if (state.middleDragLastY != null && event.buttons & 4) {
      const dy = event.clientY - state.middleDragLastY
      if (Math.abs(dy) > 0.8) {
        camera.animateDolly(
          -dy * GALAXY_ZOOM.MIDDLE_DRAG_NOTCH_PER_PX,
          GALAXY_ZOOM.CAMERA_DOLLY_MS * 0.85,
        )
        state.middleDragLastY = event.clientY
      }
      markRender()
      return
    }

    onCanvasHover(event)
  }

  const onPointerUp = (event: PointerEvent): void => {
    state.activePointers.delete(event.pointerId)
    endPinchGestureIfNeeded()
    if (event.button === 1) state.middleDragLastY = null

    if (!state.pointerDown || event.pointerId !== state.pointerDown.pointerId)
      return
    const downX = state.pointerDown.x
    const downY = state.pointerDown.y
    const dx = event.clientX - downX
    const dy = event.clientY - downY
    const isPrimaryTap = state.pointerDown.button === 0
    const isTap = dx * dx + dy * dy <= DRAG_THRESHOLD_SQ
    const wasDrag = state.pointerDragMoved
    const frozenView = state.pointerPickView
    let idx = state.pointerPickIdx
    state.pointerDown = null
    state.pointerDragMoved = false
    state.orbitDragLastX = null
    state.orbitDragLastY = null
    clearPointerPick()

    if (isPrimaryTap && isTap && !wasDrag) {
      if (idx == null && frozenView)
        idx = pickIndexWithView(downX, downY, frozenView)
      if (idx != null) {
        callbacks.setHoverIndex(idx, event.clientX, event.clientY)
        buffers.focusStarByIndex(idx)
      }
    }

    if (isPrimaryTap) {
      state.orbitGestureActive = false
      const renderer = scene.rendererRef.value
      if (renderer) renderer.domElement.style.cursor = 'grab'
    }

    camera.syncAutoRotateAfterInteraction()
  }

  const onPointerCancel = (event: PointerEvent): void => {
    state.activePointers.delete(event.pointerId)
    endPinchGestureIfNeeded()
    state.middleDragLastY = null
    state.pointerDown = null
    state.pointerDragMoved = false
    state.orbitDragLastX = null
    state.orbitDragLastY = null
    state.orbitGestureActive = false
    clearPointerPick()
    camera.syncAutoRotateAfterInteraction()
    const renderer = scene.rendererRef.value
    if (renderer) renderer.domElement.style.cursor = 'grab'
  }

  const onCanvasLeave = (): void => {
    callbacks.setHoverIndex(null)
    const renderer = scene.rendererRef.value
    if (renderer) renderer.domElement.style.cursor = 'grab'
  }

  const onGalaxyWheel = (event: WheelEvent): void => {
    if (!scene.controls || !scene.camera || !scene.rendererRef.value) return
    event.preventDefault()

    let delta = event.deltaY
    if (event.deltaMode === 1) delta *= 16
    else if (event.deltaMode === 2) delta *= 100
    if (event.ctrlKey) delta *= 2.5

    state.wheelDeltaAccum += delta
    const steps = Math.trunc(-state.wheelDeltaAccum / GALAXY_ZOOM.WHEEL_NOTCH)
    if (steps === 0) return

    state.wheelDeltaAccum += steps * GALAXY_ZOOM.WHEEL_NOTCH
    camera.animateDolly(
      steps * GALAXY_ZOOM.ZOOM_SPEED,
      GALAXY_ZOOM.CAMERA_DOLLY_MS,
    )
  }

  const onGalaxyAuxClick = (event: MouseEvent): void => {
    if (event.button === 1) event.preventDefault()
  }

  const isGalaxyKeyboardContext = (): boolean => {
    if (store.viewMode !== 'galaxy') return false
    const el = document.activeElement
    if (!el) return true
    const tag = el.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return false
    if ((el as HTMLElement).isContentEditable) return false
    return true
  }

  const nudgeAndRender = (azimuth: number, polar: number): void => {
    if (!scene.controls || !scene.camera) return
    camera.cancelCameraTransition()
    nudgeOrbitCamera(scene.controls, scene.camera, azimuth, polar)
    markRender()
  }

  const onGalaxyKeyDown = (event: KeyboardEvent): void => {
    if (!isGalaxyKeyboardContext() || !scene.controls || !scene.camera) return

    const key = event.key
    if (key === '+' || key === '=') {
      event.preventDefault()
      camera.zoomIn()
      return
    }
    if (key === '-' || key === '_') {
      event.preventDefault()
      camera.zoomOut()
      return
    }
    if (key === 'r' || key === 'R') {
      event.preventDefault()
      callbacks.onResetKey()
      return
    }
    if (key === 'ArrowLeft') {
      event.preventDefault()
      nudgeAndRender(GALAXY_ZOOM.KEYBOARD_ORBIT_AZIMUTH, 0)
      return
    }
    if (key === 'ArrowRight') {
      event.preventDefault()
      nudgeAndRender(-GALAXY_ZOOM.KEYBOARD_ORBIT_AZIMUTH, 0)
      return
    }
    if (key === 'ArrowUp') {
      event.preventDefault()
      nudgeAndRender(0, -GALAXY_ZOOM.KEYBOARD_ORBIT_POLAR)
      return
    }
    if (key === 'ArrowDown') {
      event.preventDefault()
      nudgeAndRender(0, GALAXY_ZOOM.KEYBOARD_ORBIT_POLAR)
    }
  }

  const handlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onCanvasLeave,
    onGalaxyWheel,
    onGalaxyAuxClick,
  }

  const dispose = (): void => {
    if (state.hoverRaf) cancelAnimationFrame(state.hoverRaf)
    clearPointerPick()
    state.activePointers.clear()
    state.lastPinchDistance = null
    state.middleDragLastY = null
    state.wheelDeltaAccum = 0
    state.orbitDragLastX = null
    state.orbitDragLastY = null
    state.pointerDown = null
    state.pointerDragMoved = false
    state.orbitGestureActive = false
    state.pinchActive = false
    state.hoverRaf = 0
    state.pendingHover = null
  }

  return {
    state,
    handlers,
    onGalaxyKeyDown,
    clearPointerPick,
    snapshotPickView,
    pickIndex,
    pickIndexWithView,
    dispose,
  }
}

export type UseGalaxyInteractionReturn = ReturnType<typeof useGalaxyInteraction>
