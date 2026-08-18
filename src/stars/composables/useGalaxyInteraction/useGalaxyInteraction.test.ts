import { describe, expect, it, mock } from 'bun:test'
import { GALAXY_ZOOM } from '../../galaxy/constants'
import type { UseGalaxyBuffersReturn } from '../useGalaxyBuffers'
import type { UseGalaxyCameraReturn } from '../useGalaxyCamera'
import type { GalaxySceneState } from '../useGalaxyScene'
import type { StarsStore } from '../useStarsStore'
import { createGalaxyInteractionState } from './types'
import { useGalaxyInteraction } from './useGalaxyInteraction'

const makeScene = (): GalaxySceneState =>
  ({
    sceneRef: { value: null },
    rendererRef: { value: null },
    camera: null,
    controls: null,
    viewPivot: null,
    galaxyGroup: null,
    points: null,
    dust: null,
    cosmicSky: null,
    pointMaterial: null,
    gasMaterial: null,
    gasDustMaterial: null,
    resizeObserver: null,
    cameraTransition: null,
    nebulaVolumeTimeUniform: { value: 0 },
  }) as GalaxySceneState

const makeCamera = (): UseGalaxyCameraReturn =>
  ({
    autoRotate: { value: true },
    state: {
      autoRotateSuspended: false,
      galaxyMotionFrozen: false,
      defaultView: null,
    },
    cancelCameraTransition: mock(() => undefined),
    suspendGalaxyMotion: mock(() => undefined),
    syncAutoRotateAfterInteraction: mock(() => undefined),
    dollyByNotches: mock(() => undefined),
    animateDolly: mock(() => undefined),
    zoomIn: mock(() => undefined),
    zoomOut: mock(() => undefined),
    resetView: mock(() => undefined),
  }) as unknown as UseGalaxyCameraReturn

const makeBuffers = (): UseGalaxyBuffersReturn =>
  ({
    state: {
      restPositions: null,
      starCount: 0,
      starSizes: null,
      starBrights: null,
      motionFields: null,
      currentItems: [],
    },
    focusStarByIndex: mock(() => undefined),
  }) as unknown as UseGalaxyBuffersReturn

const makeStore = (): StarsStore =>
  ({ viewMode: 'galaxy' }) as unknown as StarsStore

const wheelEvent = (deltaY: number): WheelEvent =>
  ({
    deltaY,
    deltaMode: 0,
    ctrlKey: false,
    preventDefault: () => undefined,
  }) as unknown as WheelEvent

describe('useGalaxyInteraction', () => {
  it('does not treat a small pointer move as a drag', () => {
    const scene = makeScene()
    const state = createGalaxyInteractionState()
    const camera = makeCamera()
    const buffers = makeBuffers()
    const interaction = useGalaxyInteraction(
      scene,
      state,
      camera,
      buffers,
      () => 0,
      () => undefined,
      makeStore(),
      {
        setHoverIndex: mock(() => undefined),
        onResetKey: mock(() => undefined),
      },
    )

    interaction.handlers.onPointerDown({
      pointerId: 1,
      button: 0,
      clientX: 100,
      clientY: 100,
    } as PointerEvent)
    interaction.handlers.onPointerMove({
      pointerId: 1,
      buttons: 1,
      clientX: 102,
      clientY: 101,
    } as PointerEvent)

    expect(state.pointerDragMoved).toBe(false)
  })

  it('treats a pointer move past the drag threshold as a drag', () => {
    const scene = makeScene()
    const state = createGalaxyInteractionState()
    const camera = makeCamera()
    const buffers = makeBuffers()
    const interaction = useGalaxyInteraction(
      scene,
      state,
      camera,
      buffers,
      () => 0,
      () => undefined,
      makeStore(),
      {
        setHoverIndex: mock(() => undefined),
        onResetKey: mock(() => undefined),
      },
    )

    interaction.handlers.onPointerDown({
      pointerId: 1,
      button: 0,
      clientX: 100,
      clientY: 100,
    } as PointerEvent)
    interaction.handlers.onPointerMove({
      pointerId: 1,
      buttons: 1,
      clientX: 130,
      clientY: 130,
    } as PointerEvent)

    expect(state.pointerDragMoved).toBe(true)
  })

  it('accumulates wheel delta and only dollies once a full notch is crossed', () => {
    const scene = {
      ...makeScene(),
      controls: {},
      camera: {},
    } as GalaxySceneState
    scene.rendererRef.value = {} as never
    const state = createGalaxyInteractionState()
    const camera = makeCamera()
    const buffers = makeBuffers()
    const interaction = useGalaxyInteraction(
      scene,
      state,
      camera,
      buffers,
      () => 0,
      () => undefined,
      makeStore(),
      {
        setHoverIndex: mock(() => undefined),
        onResetKey: mock(() => undefined),
      },
    )

    const smallDelta = GALAXY_ZOOM.WHEEL_NOTCH * 0.4
    interaction.handlers.onGalaxyWheel(wheelEvent(smallDelta))
    expect(camera.animateDolly).not.toHaveBeenCalled()

    interaction.handlers.onGalaxyWheel(wheelEvent(smallDelta))
    interaction.handlers.onGalaxyWheel(wheelEvent(smallDelta))
    expect(camera.animateDolly).toHaveBeenCalledTimes(1)
  })

  it('ignores galaxy keyboard shortcuts when the active element is an input', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    const scene = {
      ...makeScene(),
      controls: {},
      camera: {},
    } as GalaxySceneState
    const state = createGalaxyInteractionState()
    const camera = makeCamera()
    const buffers = makeBuffers()
    const interaction = useGalaxyInteraction(
      scene,
      state,
      camera,
      buffers,
      () => 0,
      () => undefined,
      makeStore(),
      {
        setHoverIndex: mock(() => undefined),
        onResetKey: mock(() => undefined),
      },
    )

    interaction.onGalaxyKeyDown({
      key: '+',
      preventDefault: () => undefined,
    } as KeyboardEvent)
    expect(camera.zoomIn).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('dispose clears gesture state', () => {
    const scene = makeScene()
    const state = createGalaxyInteractionState()
    const camera = makeCamera()
    const buffers = makeBuffers()
    const interaction = useGalaxyInteraction(
      scene,
      state,
      camera,
      buffers,
      () => 0,
      () => undefined,
      makeStore(),
      {
        setHoverIndex: mock(() => undefined),
        onResetKey: mock(() => undefined),
      },
    )

    interaction.handlers.onPointerDown({
      pointerId: 1,
      button: 0,
      clientX: 1,
      clientY: 1,
    } as PointerEvent)
    expect(state.pointerDown).not.toBeNull()

    interaction.dispose()
    expect(state.pointerDown).toBeNull()
    expect(state.activePointers.size).toBe(0)
  })
})
