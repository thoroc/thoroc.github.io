import * as THREE from 'three'
import { ref } from 'vue'
import { nebulaLangTint, repoLangRgb } from '../../galaxy/colors'
import { COSMIC_UNIVERSE, LEGEND_LANG_TOP } from '../../galaxy/constants'
import { hashStr } from '../../galaxy/hash'
import { hasValidGalaxyLayout } from '../../galaxy/layout-payload'
import type { Vec3 } from '../../galaxy/motion'
import {
  applyGalaxyHubMotionJs,
  motionWorldPosition,
} from '../../galaxy/motion'
import { createNebulaVolumeMesh } from '../../galaxy/nebula-volume'
import type { GalaxyBuffers } from '../../galaxy/positions'
import { buildGalaxyBuffers, ownerSelfRepoId } from '../../galaxy/positions'
import type { CameraView } from '../../galaxy/zoom-controls'
import {
  fitCameraInsideObserver,
  resolveFocusCameraView,
} from '../../galaxy/zoom-controls'
import type { UseGalaxyCameraReturn } from '../useGalaxyCamera'
import { asOrbitControls } from '../useGalaxyCamera'
import type { GalaxySceneState } from '../useGalaxyScene'
import type { StarsRepoItem, StarsStore } from '../useStarsStore'
import type {
  GalaxyBuffersCallbacks,
  GalaxyBuffersState,
  GasBuffersWithMotion,
  GasDustBuffersWithMotion,
} from './types'

export interface GalaxyBuffersProps {
  focusId?: string
}

/**
 * Owns the star/gas/dust buffer sync merged with camera-focus (fitCamera,
 * focusStarByIndex and friends): focusing a star needs restPositions/
 * motionFields to compute its live animated world position, and
 * applyBuffers calls fitCamera/focusStarByIndex directly on rebuild — a
 * genuine two-way coupling that keeps this as one cohesive-state module
 * rather than two composables passing a shared box back and forth.
 */
export const useGalaxyBuffers = (
  scene: GalaxySceneState,
  camera: UseGalaxyCameraReturn,
  refreshGalaxyShaderSourcesOnScene: () => void,
  markRender: () => void,
  getMotionTimeSec: () => number,
  store: StarsStore,
  props: GalaxyBuffersProps,
  callbacks: GalaxyBuffersCallbacks,
) => {
  const legendItems = ref<import('../../galaxy/star-visuals').LegendEntry[]>([])
  const starTierItems = ref<
    import('../../galaxy/star-visuals').StarTierBucket[]
  >([])
  const showFocusOwnerRepo = ref(false)
  const layoutComputing = ref(false)

  let starFocusScratch: THREE.Vector3 | null = null

  const state: GalaxyBuffersState = {
    starCount: 0,
    restPositions: null,
    starSizes: null,
    starBrights: null,
    motionFields: null,
    idToIndex: new Map(),
    repoIdToIndices: new Map(),
    currentVirtualStars: [],
    currentItems: [],
    interactionData: null,
    anchorStarIndex: -1,
    ownerStarIndex: -1,
    legendLangSet: new Set(),
    gasLangLayers: [],
    gasDustLangLayers: [],
    fieldGasMesh: null,
    fieldGasDustMesh: null,
    fieldVolumeMesh: null,
  }

  const resolveStarLocalPosition = (index: number): Vec3 | null => {
    if (!state.restPositions || index < 0 || index >= state.starCount)
      return null
    const rx = state.restPositions[index * 3] ?? 0
    const ry = state.restPositions[index * 3 + 1] ?? 0
    const rz = state.restPositions[index * 3 + 2] ?? 0
    if (state.motionFields) {
      return motionWorldPosition(
        rx,
        ry,
        rz,
        state.motionFields,
        index,
        getMotionTimeSec(),
      )
    }
    return [rx, ry, rz]
  }

  const starWorldPosition = (index: number): THREE.Vector3 | null => {
    const local = resolveStarLocalPosition(index)
    if (!local || !scene.points) return null
    if (!starFocusScratch) starFocusScratch = new THREE.Vector3()
    starFocusScratch.set(local[0], local[1], local[2])
    if (scene.viewPivot) scene.viewPivot.updateMatrixWorld(true)
    if (scene.galaxyGroup) scene.galaxyGroup.updateMatrixWorld(true)
    scene.points.updateMatrixWorld(true)
    return scene.points.localToWorld(starFocusScratch.clone())
  }

  const fitCamera = (positions: Float32Array, count: number): void => {
    if (!scene.camera || !scene.controls || count === 0) return
    fitCameraInsideObserver(
      asOrbitControls(scene.controls),
      scene.camera,
      positions,
      count,
      { padding: 0.76 },
    )
    camera.resetViewPivot()
    if (scene.galaxyGroup) scene.galaxyGroup.rotation.y = 0
    camera.saveDefaultView()
  }

  const focusStarByIndex = (
    index: number,
    opts: { emitSelect?: boolean } = {},
  ): void => {
    const { emitSelect = true } = opts
    if (
      !scene.controls ||
      !scene.camera ||
      index < 0 ||
      index >= state.starCount
    )
      return
    const world = starWorldPosition(index)
    if (!world) return

    const aSize =
      state.starSizes?.[index] ??
      scene.points?.geometry?.getAttribute('aSize')?.array?.[index] ??
      1
    const bright = state.starBrights?.[index] ?? 0.5
    const pixelRatio = scene.rendererRef.value?.getPixelRatio() ?? 1

    const view: CameraView = resolveFocusCameraView(
      asOrbitControls(scene.controls),
      scene.camera,
      world,
      { aSize, bright, pixelRatio },
    )
    camera.animateCameraTo(view, 260)
    const item = state.currentItems[index]
    if (item) {
      callbacks.syncSelectedIndex(item.id ?? '')
      if (emitSelect) callbacks.onSelect(item as StarsRepoItem)
    }
  }

  const focusCenterStar = (): void => {
    if (state.anchorStarIndex >= 0) {
      focusStarByIndex(state.anchorStarIndex)
      return
    }
    if (scene.controls && scene.camera) {
      const view = resolveFocusCameraView(
        asOrbitControls(scene.controls),
        scene.camera,
        new THREE.Vector3(0, 0, 0),
        { span: 6 },
      )
      camera.animateCameraTo(view, 260)
    }
  }

  const focusGalaxySelected = (): void => {
    const id = store.galaxySelected?.id ?? props.focusId
    if (!id || !scene.controls || !scene.camera) return
    const idx = state.idToIndex.get(id)
    if (idx != null && idx >= 0) {
      focusStarByIndex(idx, { emitSelect: false })
    }
  }

  const focusOwnerStar = (): void => {
    if (state.ownerStarIndex >= 0) focusStarByIndex(state.ownerStarIndex)
  }

  const syncMotionAttributes = (buffers: GalaxyBuffers): void => {
    state.starCount = buffers.count
    const densityScale = 1 / Math.sqrt(Math.max(buffers.count, 1) / 4200)
    if (scene.pointMaterial) {
      ;(scene.pointMaterial.uniforms.uDensityScale as { value: number }).value =
        Math.max(0.2, Math.min(1, densityScale))
    }
    state.restPositions = buffers.positions
    state.starSizes = buffers.sizes
    state.starBrights = buffers.brights
    state.motionFields = buffers.motion ?? null
  }

  const syncPickPositions = (): void => {
    if (!scene.points || !state.restPositions || state.starCount <= 0) return
    const posAttr = scene.points.geometry.getAttribute('position')
    if (!posAttr || posAttr.array.length !== state.restPositions.length) return
    posAttr.array.set(state.restPositions)
    posAttr.needsUpdate = true
  }

  const canUsePrecomputedLayout = (): boolean =>
    hasValidGalaxyLayout(store.galaxyLayout) &&
    store.galaxyVirtualIndexMap.size > 0

  const buildGalaxyBuffersForItems = (
    items: StarsRepoItem[],
  ): GalaxyBuffers => {
    if (canUsePrecomputedLayout()) {
      return buildGalaxyBuffers(items, {
        layout: store.galaxyLayout,
        virtualIndexMap: store.galaxyVirtualIndexMap,
      })
    }
    return buildGalaxyBuffers(items)
  }

  const disposeGasLangLayers = (): void => {
    for (const layer of state.gasLangLayers) {
      if (scene.galaxyGroup) scene.galaxyGroup.remove(layer.pivot)
      layer.geometry.dispose()
    }
    state.gasLangLayers = []
    for (const layer of state.gasDustLangLayers) {
      if (scene.galaxyGroup) scene.galaxyGroup.remove(layer.pivot)
      layer.geometry.dispose()
    }
    state.gasDustLangLayers = []
    if (state.fieldGasMesh) {
      if (scene.galaxyGroup) scene.galaxyGroup.remove(state.fieldGasMesh)
      state.fieldGasMesh.geometry.dispose()
      state.fieldGasMesh = null
    }
    if (state.fieldGasDustMesh) {
      if (scene.galaxyGroup) scene.galaxyGroup.remove(state.fieldGasDustMesh)
      state.fieldGasDustMesh.geometry.dispose()
      state.fieldGasDustMesh = null
    }
    if (state.fieldVolumeMesh) {
      if (scene.galaxyGroup) scene.galaxyGroup.remove(state.fieldVolumeMesh)
      state.fieldVolumeMesh = null
    }
  }

  const updateGasLangLayers = (): void => {
    if (!state.gasLangLayers.length && !state.gasDustLangLayers.length) return
    const t = getMotionTimeSec()
    for (const layer of [...state.gasLangLayers, ...state.gasDustLangLayers]) {
      const { pivot, hub, omega, omega2 } = layer
      const origin = applyGalaxyHubMotion(hub, omega, omega2, t)
      pivot.position.set(origin[0], origin[1], origin[2])
    }
  }

  const syncGasClouds = (
    gasBuffers: GasBuffersWithMotion | undefined,
  ): void => {
    if (!scene.galaxyGroup || !scene.gasMaterial) return

    disposeGasLangLayers()
    if (!gasBuffers?.count) return

    const langs = gasBuffers.languages || []
    const langMotions = gasBuffers.langMotions || []
    const langRadii = gasBuffers.langRadii || []
    const perGalaxy =
      gasBuffers.perGalaxy || COSMIC_UNIVERSE.GAS_PARTICLES_PER_GALAXY
    const corePerGalaxy =
      gasBuffers.corePerGalaxy ?? COSMIC_UNIVERSE.GAS_CORE_FILL_COUNT ?? 0
    const particlesPerLayer = perGalaxy + corePerGalaxy

    let offset = 0
    if (langs.length && langMotions.length) {
      for (let li = 0; li < langs.length; li += 1) {
        const motion = langMotions[li]
        if (!motion?.hub) continue
        const hub = motion.hub
        const localPos = new Float32Array(particlesPerLayer * 3)
        const colors = new Float32Array(particlesPerLayer * 3)
        const sizes = new Float32Array(particlesPerLayer)
        const phases = new Float32Array(particlesPerLayer)
        const softness = new Float32Array(particlesPerLayer)
        const density = new Float32Array(particlesPerLayer)
        const stretch = new Float32Array(particlesPerLayer)

        for (let j = 0; j < particlesPerLayer; j += 1) {
          const i = offset + j
          localPos[j * 3] = (gasBuffers.positions[i * 3] as number) - hub[0]
          localPos[j * 3 + 1] =
            (gasBuffers.positions[i * 3 + 1] as number) - hub[1]
          localPos[j * 3 + 2] =
            (gasBuffers.positions[i * 3 + 2] as number) - hub[2]
          colors[j * 3] = gasBuffers.colors[i * 3] as number
          colors[j * 3 + 1] = gasBuffers.colors[i * 3 + 1] as number
          colors[j * 3 + 2] = gasBuffers.colors[i * 3 + 2] as number
          sizes[j] = gasBuffers.sizes[i] as number
          phases[j] = gasBuffers.phases[i] as number
          softness[j] = gasBuffers.softness?.[i] ?? 0.7
          density[j] = gasBuffers.density?.[i] ?? 0.5
          stretch[j] = gasBuffers.stretch?.[i] ?? 0.2
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(localPos, 3),
        )
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
        geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
        geometry.setAttribute(
          'aSoftness',
          new THREE.BufferAttribute(softness, 1),
        )
        geometry.setAttribute('aDensity', new THREE.BufferAttribute(density, 1))
        geometry.setAttribute('aStretch', new THREE.BufferAttribute(stretch, 1))

        const pivot = new THREE.Group()
        pivot.name = `gas-${langs[li]}`

        const gR = langRadii[li] ?? 36
        const ellipsoid: [number, number, number] = [
          gR * 1.52,
          gR * 1.22,
          gR * 1.42,
        ]
        const langTint = nebulaLangTint(repoLangRgb(langs[li]), 0.58)
        const volSeed = (hashStr(`nebula-vol:${langs[li]}`) % 10000) / 10000
        const volumeMesh = createNebulaVolumeMesh(
          langTint,
          ellipsoid,
          volSeed,
          {
            uTime: scene.nebulaVolumeTimeUniform,
          },
        )
        pivot.add(volumeMesh)

        const points = new THREE.Points(geometry, scene.gasMaterial)
        pivot.add(points)
        pivot.renderOrder = -2
        scene.galaxyGroup.add(pivot)

        state.gasLangLayers.push({
          pivot,
          geometry,
          hub: [...hub],
          omega: [...motion.omega],
          omega2: [...motion.omega2],
        })
        offset += particlesPerLayer
      }
    }

    const fieldStart = gasBuffers.fieldGasStart ?? offset
    const fieldCount =
      gasBuffers.fieldGasCount ?? Math.max(0, gasBuffers.count - fieldStart)
    if (fieldCount > 0) {
      const localPos = new Float32Array(fieldCount * 3)
      const colors = new Float32Array(fieldCount * 3)
      const sizes = new Float32Array(fieldCount)
      const phases = new Float32Array(fieldCount)
      const softness = new Float32Array(fieldCount)
      const density = new Float32Array(fieldCount)
      const stretch = new Float32Array(fieldCount)

      for (let j = 0; j < fieldCount; j += 1) {
        const i = fieldStart + j
        localPos[j * 3] = gasBuffers.positions[i * 3] as number
        localPos[j * 3 + 1] = gasBuffers.positions[i * 3 + 1] as number
        localPos[j * 3 + 2] = gasBuffers.positions[i * 3 + 2] as number
        colors[j * 3] = gasBuffers.colors[i * 3] as number
        colors[j * 3 + 1] = gasBuffers.colors[i * 3 + 1] as number
        colors[j * 3 + 2] = gasBuffers.colors[i * 3 + 2] as number
        sizes[j] = gasBuffers.sizes[i] as number
        phases[j] = gasBuffers.phases[i] as number
        softness[j] = gasBuffers.softness?.[i] ?? 0.62
        density[j] = gasBuffers.density?.[i] ?? 0.38
        stretch[j] = gasBuffers.stretch?.[i] ?? 0.08
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(localPos, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
      geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
      geometry.setAttribute('aSoftness', new THREE.BufferAttribute(softness, 1))
      geometry.setAttribute('aDensity', new THREE.BufferAttribute(density, 1))
      geometry.setAttribute('aStretch', new THREE.BufferAttribute(stretch, 1))

      state.fieldGasMesh = new THREE.Points(geometry, scene.gasMaterial)
      state.fieldGasMesh.name = 'field-gas'
      state.fieldGasMesh.renderOrder = -3
      scene.galaxyGroup.add(state.fieldGasMesh)
    }

    const fieldVolumeRadius = gasBuffers.fieldVolumeRadius ?? 0
    if (fieldVolumeRadius > 0) {
      const fieldTint = nebulaLangTint([0.42, 0.52, 0.62], 0.42)
      state.fieldVolumeMesh = createNebulaVolumeMesh(
        fieldTint,
        [
          fieldVolumeRadius * 1.12,
          fieldVolumeRadius * 0.92,
          fieldVolumeRadius * 1.06,
        ],
        0.37,
        { uTime: scene.nebulaVolumeTimeUniform },
        { isField: true },
      )
      state.fieldVolumeMesh.name = 'field-nebula-volume'
      state.fieldVolumeMesh.renderOrder = -6
      scene.galaxyGroup.add(state.fieldVolumeMesh)
    }

    updateGasLangLayers()
  }

  const syncGasDustClouds = (
    gasDustBuffers: GasDustBuffersWithMotion | undefined,
  ): void => {
    if (!scene.galaxyGroup || !scene.gasDustMaterial || !gasDustBuffers?.count)
      return

    const langs = gasDustBuffers.languages || []
    const langMotions = gasDustBuffers.langMotions || []
    const perGalaxy =
      gasDustBuffers.perGalaxy || COSMIC_UNIVERSE.GAS_DUST_PER_GALAXY || 0

    let offset = 0
    if (langs.length && langMotions.length) {
      for (let li = 0; li < langs.length; li += 1) {
        const motion = langMotions[li]
        if (!motion?.hub) continue
        const hub = motion.hub
        const localPos = new Float32Array(perGalaxy * 3)
        const colors = new Float32Array(perGalaxy * 3)
        const sizes = new Float32Array(perGalaxy)
        const density = new Float32Array(perGalaxy)

        for (let j = 0; j < perGalaxy; j += 1) {
          const i = offset + j
          localPos[j * 3] = (gasDustBuffers.positions[i * 3] as number) - hub[0]
          localPos[j * 3 + 1] =
            (gasDustBuffers.positions[i * 3 + 1] as number) - hub[1]
          localPos[j * 3 + 2] =
            (gasDustBuffers.positions[i * 3 + 2] as number) - hub[2]
          colors[j * 3] = gasDustBuffers.colors[i * 3] as number
          colors[j * 3 + 1] = gasDustBuffers.colors[i * 3 + 1] as number
          colors[j * 3 + 2] = gasDustBuffers.colors[i * 3 + 2] as number
          sizes[j] = gasDustBuffers.sizes[i] as number
          density[j] = gasDustBuffers.density?.[i] ?? 0.5
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(localPos, 3),
        )
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
        geometry.setAttribute('aDensity', new THREE.BufferAttribute(density, 1))

        const pivot = new THREE.Group()
        pivot.name = `gas-dust-${langs[li]}`
        const points = new THREE.Points(geometry, scene.gasDustMaterial)
        pivot.add(points)
        pivot.renderOrder = -4
        scene.galaxyGroup.add(pivot)

        state.gasDustLangLayers.push({
          pivot,
          geometry,
          hub: [...hub],
          omega: [...motion.omega],
          omega2: [...motion.omega2],
        })
        offset += perGalaxy
      }
    }

    const fieldStart = gasDustBuffers.fieldDustStart ?? offset
    const fieldCount =
      gasDustBuffers.fieldDustCount ??
      Math.max(0, gasDustBuffers.count - fieldStart)
    if (fieldCount > 0) {
      const localPos = new Float32Array(fieldCount * 3)
      const colors = new Float32Array(fieldCount * 3)
      const sizes = new Float32Array(fieldCount)
      const density = new Float32Array(fieldCount)

      for (let j = 0; j < fieldCount; j += 1) {
        const i = fieldStart + j
        localPos[j * 3] = gasDustBuffers.positions[i * 3] as number
        localPos[j * 3 + 1] = gasDustBuffers.positions[i * 3 + 1] as number
        localPos[j * 3 + 2] = gasDustBuffers.positions[i * 3 + 2] as number
        colors[j * 3] = gasDustBuffers.colors[i * 3] as number
        colors[j * 3 + 1] = gasDustBuffers.colors[i * 3 + 1] as number
        colors[j * 3 + 2] = gasDustBuffers.colors[i * 3 + 2] as number
        sizes[j] = gasDustBuffers.sizes[i] as number
        density[j] = gasDustBuffers.density?.[i] ?? 0.4
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(localPos, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
      geometry.setAttribute('aDensity', new THREE.BufferAttribute(density, 1))

      state.fieldGasDustMesh = new THREE.Points(geometry, scene.gasDustMaterial)
      state.fieldGasDustMesh.name = 'field-gas-dust'
      state.fieldGasDustMesh.renderOrder = -5
      scene.galaxyGroup.add(state.fieldGasDustMesh)
    }

    updateGasLangLayers()
  }

  const applyBuffers = (buffers: GalaxyBuffers): void => {
    const threeScene = scene.sceneRef.value
    if (!threeScene || !scene.pointMaterial || !scene.galaxyGroup) return

    state.idToIndex = buffers.idToIndex
    state.repoIdToIndices = buffers.repoIdToIndices ?? new Map()
    state.currentVirtualStars = buffers.virtualStars ?? []
    state.currentItems = buffers.items
    legendItems.value = buffers.legend.slice(0, LEGEND_LANG_TOP)
    starTierItems.value = buffers.starTiers
    state.legendLangSet = new Set(legendItems.value.map((row) => row.name))
    state.anchorStarIndex = buffers.anchorIndex ?? -1
    const selfRepoId = ownerSelfRepoId(store.owner)
    const ownerIndices = selfRepoId
      ? state.repoIdToIndices.get(selfRepoId)
      : null
    state.ownerStarIndex = ownerIndices?.[0] ?? -1
    showFocusOwnerRepo.value = state.ownerStarIndex >= 0
    callbacks.setHoverIndexNull()
    callbacks.syncSelectedIndex(props.focusId || '')

    if (scene.points) {
      scene.galaxyGroup.remove(scene.points)
      scene.points.geometry.dispose()
      scene.points = null
    }

    if (buffers.count === 0) {
      state.starCount = 0
      state.restPositions = null
      state.motionFields = null
      syncGasClouds(buffers.gas)
      syncGasDustClouds(buffers.gasDust)
      return
    }

    syncGasClouds(buffers.gas)
    syncGasDustClouds(buffers.gasDust)

    syncMotionAttributes(buffers)

    state.interactionData = new Float32Array(buffers.count * 3)
    for (let i = 0; i < buffers.count; i += 1) {
      state.interactionData[i * 3] = 1
      state.interactionData[i * 3 + 1] = 0
      state.interactionData[i * 3 + 2] = 0
    }

    const indices = new Float32Array(buffers.count)
    for (let i = 0; i < buffers.count; i += 1) {
      indices[i] = i
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(buffers.positions, 3),
    )
    geometry.setAttribute('color', new THREE.BufferAttribute(buffers.colors, 3))
    geometry.setAttribute('aSize', new THREE.BufferAttribute(buffers.sizes, 1))
    geometry.setAttribute(
      'aBright',
      new THREE.BufferAttribute(buffers.brights, 1),
    )
    geometry.setAttribute(
      'aActivity',
      new THREE.BufferAttribute(buffers.activities, 1),
    )
    geometry.setAttribute(
      'aInteraction',
      new THREE.BufferAttribute(state.interactionData, 3),
    )
    geometry.setAttribute('aIndex', new THREE.BufferAttribute(indices, 1))
    const ringFlags = buffers.ringStarFlags ?? new Float32Array(buffers.count)
    geometry.setAttribute('aRingStar', new THREE.BufferAttribute(ringFlags, 1))

    const motion = buffers.motion
    if (motion) {
      geometry.setAttribute(
        'aGalaxyHub',
        new THREE.BufferAttribute(motion.galaxyHubs, 3),
      )
      geometry.setAttribute(
        'aNebulaCenter',
        new THREE.BufferAttribute(motion.nebulaCenters, 3),
      )
      geometry.setAttribute(
        'aMotionOmega',
        new THREE.BufferAttribute(motion.motionOmega, 4),
      )
      geometry.setAttribute(
        'aMotionOmega2',
        new THREE.BufferAttribute(motion.motionOmega2, 4),
      )
      const bobAttr = new Float32Array(motion.yBobAmp.length * 2)
      for (let i = 0; i < motion.yBobAmp.length; i += 1) {
        bobAttr[i * 2] = motion.yBobAmp[i] as number
        bobAttr[i * 2 + 1] = motion.yBobPhase[i] as number
      }
      geometry.setAttribute('aMotionBob', new THREE.BufferAttribute(bobAttr, 2))
    }

    scene.points = new THREE.Points(geometry, scene.pointMaterial)
    scene.points.name = 'repos'
    scene.galaxyGroup.add(scene.points)

    fitCamera(buffers.positions, buffers.count)
    camera.resetViewPivot()
    if (scene.galaxyGroup) scene.galaxyGroup.rotation.y = 0
    syncPickPositions()
    callbacks.syncSelectedIndex(props.focusId || '')
    if (props.focusId) {
      const idx = state.idToIndex.get(props.focusId)
      if (idx != null && idx >= 0) focusStarByIndex(idx, { emitSelect: false })
    }
    markRender()
  }

  const runGalaxyRebuild = (items: StarsRepoItem[]): void => {
    refreshGalaxyShaderSourcesOnScene()
    const run = () => {
      try {
        const buffers = buildGalaxyBuffersForItems(items)
        store.setGalaxyRenderStats({
          layoutVersion: store.galaxyLayout?.version ?? 0,
          pointCount: buffers.count,
          precomputed: canUsePrecomputedLayout(),
        })
        applyBuffers(buffers)
      } finally {
        layoutComputing.value = false
        markRender()
      }
    }

    if (canUsePrecomputedLayout()) {
      run()
      return
    }

    layoutComputing.value = true
    markRender()
    window.setTimeout(run, 0)
  }

  const rebuildGalaxy = (items: StarsRepoItem[]): void => {
    if (!scene.sceneRef.value) return
    runGalaxyRebuild(items)
  }

  const dispose = (): void => {
    if (scene.points) {
      scene.points.geometry.dispose()
      scene.points = null
    }
    disposeGasLangLayers()
    state.starCount = 0
    state.restPositions = null
    state.starSizes = null
    state.starBrights = null
    state.motionFields = null
  }

  return {
    state,
    legendItems,
    starTierItems,
    showFocusOwnerRepo,
    layoutComputing,
    fitCamera,
    starWorldPosition,
    resolveStarLocalPosition,
    focusStarByIndex,
    focusCenterStar,
    focusGalaxySelected,
    focusOwnerStar,
    syncPickPositions,
    canUsePrecomputedLayout,
    disposeGasLangLayers,
    updateGasLangLayers,
    applyBuffers,
    runGalaxyRebuild,
    rebuildGalaxy,
    dispose,
  }
}

function applyGalaxyHubMotion(
  hub: Vec3,
  omega: [number, number, number, number],
  omega2: [number, number, number, number],
  t: number,
): Vec3 {
  return applyGalaxyHubMotionJs(hub[0], hub[1], hub[2], hub, omega, omega2, t)
}

export type UseGalaxyBuffersReturn = ReturnType<typeof useGalaxyBuffers>
