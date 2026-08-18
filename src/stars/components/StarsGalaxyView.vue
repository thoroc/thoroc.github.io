<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useGalaxyBuffers } from '../composables/useGalaxyBuffers'
import { useGalaxyCamera } from '../composables/useGalaxyCamera'
import {
  createGalaxyInteractionState,
  useGalaxyInteraction,
} from '../composables/useGalaxyInteraction'
import { useGalaxyRenderLoop } from '../composables/useGalaxyRenderLoop'
import { useGalaxyScene } from '../composables/useGalaxyScene'
import { useStarsI18n } from '../composables/useStarsI18n'
import type { StarsRepoItem } from '../composables/useStarsStore'
import { useStarsStore } from '../composables/useStarsStore'
import { GALAXY_RUNTIME_LAYOUT_TAG } from '../galaxy/layout-payload'
import { repoLegendLanguageKey, repoStarTierKey } from '../galaxy/positions'
import StarsGalaxyControls from './StarsGalaxyControls.vue'
import StarsGalaxyDetail from './StarsGalaxyDetail.vue'
import StarsGalaxyLegend from './StarsGalaxyLegend.vue'

interface StarsGalaxyViewProps {
  items: StarsRepoItem[]
  focusId?: string
  isMobile?: boolean
}

const props = withDefaults(defineProps<StarsGalaxyViewProps>(), {
  focusId: '',
  isMobile: false,
})

const emit = defineEmits<{
  select: [item: StarsRepoItem]
}>()

const { t } = useStarsI18n()
const store = useStarsStore()
const containerRef = ref<HTMLDivElement | null>(null)
const galaxyRootRef = ref<HTMLDivElement | null>(null)
const loadingScene = ref(true)
const showLegend = ref(false)

interface GalaxyLegendFilter {
  langs: string[]
  tiers: string[]
}

function emptyLegendFilter(): GalaxyLegendFilter {
  return { langs: [], tiers: [] }
}

function isLegendFilterActive(filter: GalaxyLegendFilter): boolean {
  return filter.langs.length > 0 || filter.tiers.length > 0
}
const legendFilter = ref<GalaxyLegendFilter>(emptyLegendFilter())

const renderLoop = useGalaxyRenderLoop()
const scene = useGalaxyScene()
const interactionState = createGalaxyInteractionState()
const camera = useGalaxyCamera(
  scene.state,
  interactionState,
  renderLoop.markRender,
)
const buffers = useGalaxyBuffers(
  scene.state,
  camera,
  scene.refreshGalaxyShaderSources,
  renderLoop.markRender,
  renderLoop.getMotionTimeSec,
  store,
  props,
  {
    syncSelectedIndex: (id: string) => syncSelectedIndex(id),
    setHoverIndexNull: () => setHoverIndex(null),
    onSelect: (item: StarsRepoItem) => emit('select', item),
  },
)
const interaction = useGalaxyInteraction(
  scene.state,
  interactionState,
  camera,
  buffers,
  renderLoop.getMotionTimeSec,
  renderLoop.markRender,
  store,
  {
    setHoverIndex: (idx, x, y) => setHoverIndex(idx, x, y),
    onResetKey: () => resetView(),
  },
)

let hoveredIndex: number | null = null
let selectedIndex: number | null = null
const hoverTip = ref({ x: 0, y: 0 })

const hoverLabel = computed(() => {
  const idx = hoveredIndex ?? selectedIndex
  if (idx == null || !buffers.state.currentItems[idx]) return ''
  const item = buffers.state.currentItems[idx]
  const stars = Number(item.stars) || 0
  const v = buffers.state.currentVirtualStars[idx]
  const topic = v?.topic ? ` · #${v.topic}` : ''
  return `${item.fullName} · ★ ${stars.toLocaleString()}${topic}`
})

function syncRepoHighlightMask(channelOffset: number, repoId: string): void {
  if (!buffers.state.interactionData) return
  for (let i = 0; i < buffers.state.starCount; i += 1) {
    buffers.state.interactionData[i * 3 + channelOffset] = 0
  }
  if (!repoId) return
  const indices = buffers.state.repoIdToIndices.get(repoId)
  if (!indices) return
  for (const i of indices) {
    if (i >= 0 && i < buffers.state.starCount)
      buffers.state.interactionData[i * 3 + channelOffset] = 1
  }
}

function syncSelectedIndex(id: string): void {
  if (!id) {
    selectedIndex = null
  } else {
    selectedIndex = buffers.state.idToIndex.get(id) ?? null
  }
  syncRepoHighlightMask(1, id || '')
  const attr = scene.state.points?.geometry?.getAttribute('aInteraction')
  if (attr) attr.needsUpdate = true
  renderLoop.markRender()
}

function setHoverIndex(
  idx: number | null,
  clientX?: number,
  clientY?: number,
): void {
  hoveredIndex = idx
  const hoveredItem = idx != null ? buffers.state.currentItems[idx] : undefined
  if (hoveredItem?.id) {
    syncRepoHighlightMask(2, hoveredItem.id)
  } else if (buffers.state.interactionData) {
    for (let i = 0; i < buffers.state.starCount; i += 1)
      buffers.state.interactionData[i * 3 + 2] = 0
  }
  const hoverAttr = scene.state.points?.geometry?.getAttribute('aInteraction')
  if (hoverAttr) hoverAttr.needsUpdate = true
  const el = containerRef.value
  if (el && clientX != null && clientY != null) {
    const rect = el.getBoundingClientRect()
    hoverTip.value = {
      x: clientX - rect.left + 14,
      y: clientY - rect.top + 14,
    }
  }
  renderLoop.markRender()
}

/** 同步选中高亮（不移动相机） */
function highlightItem(id: string): void {
  syncSelectedIndex(id)
}

function itemMatchesLegendFilter(item: StarsRepoItem): boolean {
  const filter = legendFilter.value
  if (!isLegendFilterActive(filter)) return true
  if (
    filter.tiers.length > 0 &&
    !filter.tiers.includes(repoStarTierKey(item.stars))
  ) {
    return false
  }
  if (
    filter.langs.length > 0 &&
    !filter.langs.includes(
      repoLegendLanguageKey(item, buffers.state.legendLangSet),
    )
  ) {
    return false
  }
  return true
}

function syncLegendHighlight(): void {
  if (!scene.state.points || buffers.state.starCount <= 0) return
  const attr = scene.state.points.geometry.getAttribute('aInteraction')
  if (!attr) return
  const arr = attr.array
  const active = isLegendFilterActive(legendFilter.value)
  for (let i = 0; i < buffers.state.starCount; i += 1) {
    // currentItems is populated 1:1 with starCount by applyBuffers.
    const item = buffers.state.currentItems[i]
    arr[i * 3] =
      !active || (item ? itemMatchesLegendFilter(item) : true) ? 1 : 0
  }
  attr.needsUpdate = true
  renderLoop.markRender()
}

function toggleLegendLang(name: string): void {
  const langs = legendFilter.value.langs.slice()
  const idx = langs.indexOf(name)
  if (idx >= 0) langs.splice(idx, 1)
  else langs.push(name)
  legendFilter.value = { ...legendFilter.value, langs }
  syncLegendHighlight()
}

function toggleLegendTier(key: string): void {
  const tiers = legendFilter.value.tiers.slice()
  const idx = tiers.indexOf(key)
  if (idx >= 0) tiers.splice(idx, 1)
  else tiers.push(key)
  legendFilter.value = { ...legendFilter.value, tiers }
  syncLegendHighlight()
}

function clearLegendFilter(): void {
  legendFilter.value = emptyLegendFilter()
  syncLegendHighlight()
}

function onLegendSelectLang(name: string): void {
  toggleLegendLang(name)
}

function onLegendSelectTier(key: string): void {
  toggleLegendTier(key)
}

function zoomIn(): void {
  camera.zoomIn()
}

function zoomOut(): void {
  camera.zoomOut()
}

function toggleLegend(): void {
  showLegend.value = !showLegend.value
}

function toggleFullscreen(): void {
  if (props.isMobile) return
  store.toggleGalaxyAreaExpanded()
  renderLoop.markRender()
  window.requestAnimationFrame(() => scene.resize())
}

function resetView(): void {
  camera.resetView({
    clearLegendFilter,
    setHoverIndexNull: () => setHoverIndex(null),
    resetMotionClock: renderLoop.resetMotionClock,
  })
}

function toggleAutoRotate(): void {
  camera.toggleAutoRotate()
}

function focusCenterStar(): void {
  buffers.focusCenterStar()
}

function focusOwnerStar(): void {
  buffers.focusOwnerStar()
}

function focusGalaxySelected(): void {
  buffers.focusGalaxySelected()
}

watch(
  () => props.items,
  (items) => {
    buffers.rebuildGalaxy(items)
  },
  { immediate: false },
)

watch(
  () => [
    store.galaxyLayout?.version,
    store.galaxyVirtualIndexMap.size,
    GALAXY_RUNTIME_LAYOUT_TAG,
  ],
  () => {
    if (!scene.sceneRef.value || !props.items?.length) return
    buffers.rebuildGalaxy(props.items)
  },
)

watch(
  () => props.focusId,
  (id) => {
    syncSelectedIndex(id || '')
    if (
      !id ||
      !scene.state.controls ||
      !scene.state.camera ||
      buffers.state.starCount <= 0
    )
      return
    const idx = buffers.state.idToIndex.get(id)
    if (idx != null && idx >= 0) {
      buffers.focusStarByIndex(idx, { emitSelect: false })
    }
  },
)

watch(
  () => store.galaxyAreaExpanded,
  () => {
    renderLoop.markRender()
    window.requestAnimationFrame(() => scene.resize())
  },
)

watch(
  () => props.isMobile,
  () => {
    window.requestAnimationFrame(() => scene.resize())
  },
)

onMounted(async () => {
  await nextTick()
  try {
    if (containerRef.value) {
      scene.initScene(
        containerRef.value,
        camera,
        interactionState,
        interaction.handlers,
        renderLoop.markRender,
      )
    }
    await store.ensureGalaxyLayout()
    buffers.runGalaxyRebuild(props.items)
  } catch (err) {
    console.error('[galaxy] init failed', err)
    loadingScene.value = false
    buffers.layoutComputing.value = false
  } finally {
    loadingScene.value = false
    renderLoop.markRender()
  }
  renderLoop.start(scene.state, camera, buffers)
  document.addEventListener(
    'visibilitychange',
    renderLoop.onDocumentVisibilityChange,
  )
  window.addEventListener('keydown', interaction.onGalaxyKeyDown)
  if (document.hidden) renderLoop.pauseGalaxyForDocumentHidden()
})

onUnmounted(() => {
  document.removeEventListener(
    'visibilitychange',
    renderLoop.onDocumentVisibilityChange,
  )
  window.removeEventListener('keydown', interaction.onGalaxyKeyDown)
  renderLoop.dispose()
  interaction.dispose()
  camera.dispose()
  buffers.dispose()
  scene.dispose(interaction.handlers)
})
</script>

<template>
  <div
    ref="galaxyRootRef"
    class="stars-galaxy"
    :class="{
      'stars-galaxy--area-fullscreen': store.galaxyAreaExpanded && !props.isMobile,
      'stars-galaxy--mobile': props.isMobile,
    }"
  >
    <div ref="containerRef" class="stars-galaxy__canvas" role="img" :aria-label="t('galaxyAria')" />
    <StarsGalaxyLegend
      v-show="showLegend"
      :items="buffers.legendItems.value"
      :star-tiers="buffers.starTierItems.value"
      :active-filter="legendFilter"
      @select-lang="onLegendSelectLang"
      @select-tier="onLegendSelectTier"
      @clear-filter="clearLegendFilter"
    />
    <p
      v-if="hoverLabel"
      class="stars-galaxy__hover"
      :style="{ left: `${hoverTip.x}px`, top: `${hoverTip.y}px` }"
    >
      {{ hoverLabel }}
    </p>
    <div class="stars-galaxy__controls">
      <StarsGalaxyControls
        :auto-rotate="camera.autoRotate.value"
        :show-legend="showLegend"
        :show-focus-owner="buffers.showFocusOwnerRepo.value"
        :show-fullscreen="!props.isMobile"
        :is-fullscreen="store.galaxyAreaExpanded"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @reset="resetView"
        @toggle-auto-rotate="toggleAutoRotate"
        @toggle-legend="toggleLegend"
        @focus-center="focusCenterStar"
        @focus-owner="focusOwnerStar"
        @toggle-fullscreen="toggleFullscreen"
      />
    </div>
    <div v-if="!props.isMobile" class="stars-galaxy__footer">
      <p v-if="loadingScene || buffers.layoutComputing.value" class="stars-galaxy__hint">
        {{ buffers.layoutComputing.value ? t('galaxyLayoutComputing') : t('galaxyLoading') }}
      </p>
      <p v-else class="stars-galaxy__hint">
        {{ t('galaxyHint') }}
      </p>
    </div>
    <p
      v-if="props.isMobile && (loadingScene || buffers.layoutComputing.value)"
      class="stars-galaxy__mobile-status"
    >
      {{ buffers.layoutComputing.value ? t('galaxyLayoutComputing') : t('galaxyLoading') }}
    </p>
    <StarsGalaxyDetail
      v-if="store.galaxySelected"
      :item="store.galaxySelected"
      :is-mobile="props.isMobile"
      @close="store.closeGalaxyDetail"
      @locate="focusGalaxySelected"
    />
  </div>
</template>
