import * as THREE from 'three'
import { MOUSE } from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { shallowRef } from 'vue'
import { createCameraTransition } from '../../galaxy/camera-transition'
import { GALAXY_ZOOM, SCENE_FOG } from '../../galaxy/constants'
import {
  createCosmicSkyMesh,
  sceneBackgroundColor,
  sceneFogColor,
} from '../../galaxy/cosmic-background'
import { disposeNebulaSharedGeometry } from '../../galaxy/nebula-volume'
import { buildDustBuffers } from '../../galaxy/positions'
import type { GalaxyInteractionState } from '../useGalaxyInteraction'
import {
  fragmentShader,
  gasDustFragmentShader,
  gasDustVertexShader,
  gasFragmentShader,
  gasVertexShader,
  vertexShader,
} from './shaders'
import type { GalaxySceneInteractionHandlers, GalaxySceneState } from './types'

export interface GalaxySceneCameraDeps {
  cancelCameraTransition: () => void
  suspendGalaxyMotion: () => void
  syncAutoRotateAfterInteraction: () => void
}

/**
 * Owns the Three.js scene/camera/renderer/controls object graph, the shader
 * materials, and the dust/cosmic-sky meshes — a cohesive-state module (Phase
 * 1 taxonomy) in the same class as useStarsStore.ts: many functions sharing
 * closures over one mutable object graph that would be actively harmful to
 * split further (a scene, its camera, and its renderer are not independently
 * meaningful pieces).
 */
export const useGalaxyScene = () => {
  const sceneRef = shallowRef<THREE.Scene | null>(null)
  const rendererRef = shallowRef<THREE.WebGLRenderer | null>(null)

  const state: GalaxySceneState = {
    sceneRef,
    rendererRef,
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
  }

  const sceneBackground = (): number => sceneBackgroundColor()

  const resize = (): void => {
    const el = containerElRef.value
    const renderer = rendererRef.value
    if (!el || !renderer || !state.camera) return
    const width = el.clientWidth
    const height = el.clientHeight
    if (width <= 0 || height <= 0) return
    state.camera.aspect = width / height
    state.camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    if (state.pointMaterial) {
      ;(state.pointMaterial.uniforms.uPixelRatio as { value: number }).value =
        renderer.getPixelRatio()
    }
    if (state.gasMaterial) {
      ;(state.gasMaterial.uniforms.uPixelRatio as { value: number }).value =
        renderer.getPixelRatio()
    }
    if (state.gasDustMaterial) {
      ;(state.gasDustMaterial.uniforms.uPixelRatio as { value: number }).value =
        renderer.getPixelRatio()
    }
    markRenderRef.current?.()
  }

  const containerElRef: { value: HTMLElement | null } = { value: null }
  const markRenderRef: { current: (() => void) | null } = { current: null }

  const refreshGalaxyShaderSources = (): void => {
    if (state.pointMaterial) {
      state.pointMaterial.vertexShader = vertexShader
      state.pointMaterial.fragmentShader = fragmentShader
      state.pointMaterial.needsUpdate = true
    }
    if (state.gasMaterial) {
      state.gasMaterial.vertexShader = gasVertexShader
      state.gasMaterial.fragmentShader = gasFragmentShader
      state.gasMaterial.needsUpdate = true
    }
  }

  const initScene = (
    el: HTMLElement,
    camera: GalaxySceneCameraDeps,
    interaction: GalaxyInteractionState,
    handlers: GalaxySceneInteractionHandlers,
    markRender: () => void,
  ): void => {
    containerElRef.value = el
    markRenderRef.current = markRender

    const width = el.clientWidth || 640
    const height = el.clientHeight || 480

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(sceneBackground())
    scene.fog = new THREE.FogExp2(sceneFogColor(), SCENE_FOG.DENSITY)
    sceneRef.value = scene

    state.cosmicSky = createCosmicSkyMesh()
    scene.add(state.cosmicSky)

    state.viewPivot = new THREE.Group()
    scene.add(state.viewPivot)

    state.galaxyGroup = new THREE.Group()
    state.galaxyGroup.rotation.x = 0
    state.viewPivot.add(state.galaxyGroup)

    state.camera = new THREE.PerspectiveCamera(48, width / height, 0.05, 8000)
    state.camera.position.set(0, 0, 1.0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25))
    renderer.setSize(width, height)
    el.appendChild(renderer.domElement)
    rendererRef.value = renderer

    state.cameraTransition = createCameraTransition()

    state.controls = new TrackballControls(state.camera, renderer.domElement)
    state.controls.rotateSpeed = GALAXY_ZOOM.ORBIT_ROTATE_SPEED ?? 2.4
    state.controls.panSpeed = 0.55
    state.controls.staticMoving = false
    state.controls.dynamicDampingFactor = 0.14
    state.controls.noRotate = true
    state.controls.noZoom = true
    state.controls.minDistance = GALAXY_ZOOM.MIN_DISTANCE
    state.controls.maxDistance = GALAXY_ZOOM.MAX_DISTANCE
    state.controls.target.set(0, 0, 0)
    state.controls.mouseButtons = {
      LEFT: null,
      MIDDLE: null,
      RIGHT: MOUSE.PAN,
    }
    state.controls.addEventListener('start', () => {
      camera.cancelCameraTransition()
      interaction.orbitGestureActive = true
      camera.suspendGalaxyMotion()
      renderer.domElement.style.cursor = 'grabbing'
      markRender()
    })
    state.controls.addEventListener('change', () => {
      markRender()
    })
    state.controls.addEventListener('end', () => {
      interaction.orbitGestureActive = false
      renderer.domElement.style.cursor = 'grab'
      camera.syncAutoRotateAfterInteraction()
      markRender()
    })

    state.pointMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMotionTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uDensityScale: { value: 1 },
        uFogDensity: { value: SCENE_FOG.DENSITY },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    })

    state.gasMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: gasVertexShader,
      fragmentShader: gasFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    state.gasDustMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: gasDustVertexShader,
      fragmentShader: gasDustFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    })

    const dustMaterial = new THREE.PointsMaterial({
      color: 0x6a7a9a,
      size: 0.12,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.11,
      depthWrite: false,
      fog: false,
    })

    const dustBuffers = buildDustBuffers(720)
    const dustGeometry = new THREE.BufferGeometry()
    dustGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(dustBuffers.positions, 3),
    )
    state.dust = new THREE.Points(dustGeometry, dustMaterial)
    state.dust.name = 'dust'
    state.galaxyGroup.add(state.dust)

    renderer.domElement.addEventListener(
      'pointerdown',
      handlers.onPointerDown,
      {
        capture: true,
      },
    )
    renderer.domElement.addEventListener(
      'pointermove',
      handlers.onPointerMove,
      {
        passive: false,
      },
    )
    renderer.domElement.addEventListener('pointerup', handlers.onPointerUp)
    renderer.domElement.addEventListener(
      'pointercancel',
      handlers.onPointerCancel,
    )
    renderer.domElement.addEventListener('pointerleave', handlers.onCanvasLeave)
    renderer.domElement.addEventListener('wheel', handlers.onGalaxyWheel, {
      passive: false,
    })
    renderer.domElement.addEventListener('auxclick', handlers.onGalaxyAuxClick)
    renderer.domElement.style.cursor = 'grab'

    state.resizeObserver = new ResizeObserver(() => resize())
    state.resizeObserver.observe(el)

    markRender()
  }

  const dispose = (handlers: GalaxySceneInteractionHandlers): void => {
    state.resizeObserver?.disconnect()
    const renderer = rendererRef.value
    if (renderer) {
      renderer.domElement.removeEventListener(
        'pointerdown',
        handlers.onPointerDown,
        { capture: true },
      )
      renderer.domElement.removeEventListener(
        'pointermove',
        handlers.onPointerMove,
      )
      renderer.domElement.removeEventListener('pointerup', handlers.onPointerUp)
      renderer.domElement.removeEventListener(
        'pointercancel',
        handlers.onPointerCancel,
      )
      renderer.domElement.removeEventListener(
        'pointerleave',
        handlers.onCanvasLeave,
      )
      renderer.domElement.removeEventListener('wheel', handlers.onGalaxyWheel)
      renderer.domElement.removeEventListener(
        'auxclick',
        handlers.onGalaxyAuxClick,
      )
      renderer.dispose()
      renderer.domElement.remove()
    }
    if (state.dust) {
      state.dust.geometry.dispose()
      if (state.dust.material instanceof THREE.Material)
        state.dust.material.dispose()
      state.dust = null
    }
    state.gasMaterial?.dispose()
    state.gasMaterial = null
    state.gasDustMaterial?.dispose()
    state.gasDustMaterial = null
    if (state.cosmicSky) {
      state.cosmicSky.geometry.dispose()
      if (state.cosmicSky.material instanceof THREE.Material)
        state.cosmicSky.material.dispose()
      state.cosmicSky = null
    }
    disposeNebulaSharedGeometry()
    state.pointMaterial?.dispose()
    state.controls?.dispose()
    sceneRef.value = null
    rendererRef.value = null
    state.galaxyGroup = null
    state.viewPivot = null
    state.cameraTransition = null
  }

  return {
    sceneRef,
    rendererRef,
    state,
    initScene,
    resize,
    refreshGalaxyShaderSources,
    dispose,
  }
}

export type UseGalaxySceneReturn = ReturnType<typeof useGalaxyScene>
