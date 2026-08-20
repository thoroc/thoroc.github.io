import { ref } from 'vue'
import type {
  GalaxyLayout,
  GalaxyRenderStats,
  StarsPayload,
  StarsRepoItem,
  StarsSiteMeta,
} from './types'

export const PAGE_TITLE_CACHE_KEY = 'stars-page-title'
export const STARS_FILTERS_SESSION_KEY = 'stars-filters'

export const DEFAULT_SITE_TITLE =
  typeof __STARS_DEFAULT_SITE_TITLE__ === 'string' &&
  __STARS_DEFAULT_SITE_TITLE__.trim()
    ? __STARS_DEFAULT_SITE_TITLE__.trim()
    : 'Stars'

export const payload = ref<StarsPayload | null>(null)
export const siteMeta = ref<StarsSiteMeta | null>(null)
export const loading = ref(true)
export const error = ref('')
export const qInput = ref('')
export const qApplied = ref('')
export const language = ref('all')
export const license = ref('all')
export const starredYear = ref('all')
export const type = ref('all')
export const sort = ref('recently_starred')
export const uiLocale = ref('en')
export const showLanguage = ref(true)
export const showStarsCount = ref(true)
export const showLicense = ref(true)
export const virtualRowHeight = ref(140)
export const expandedDescIds = ref(new Set<string>())
export const viewMode = ref('list')
export const galaxyFocus = ref('')
export const galaxySelected = ref<StarsRepoItem | null>(null)
export const galaxyAreaExpanded = ref(false)
export const galaxyLayoutPayload = ref<GalaxyLayout | null>(null)
export const galaxyRenderStats = ref<GalaxyRenderStats>({
  layoutVersion: 0,
  pointCount: 0,
  precomputed: false,
})

/** Mutable box objects — see the Phase 1 mutable-box-object pattern. A `let`
 * binding reassigned from another file's function is a read-only ES module
 * import; wrapping it in an object and mutating the property is the only
 * way this state survives a one-function-per-file split. */
export const scrollController = { fn: (): void => undefined }
export const rowRemeasureController = {
  fn: (_itemIndex?: number | null): void => undefined,
}
export const debounceState: {
  timer: ReturnType<typeof setTimeout> | undefined
} = {
  timer: undefined,
}
export const searchConfig = { debounceMs: 300 }
export const localeConfig = { configured: 'en' }
export const galaxyLayoutState: {
  promise: Promise<GalaxyLayout | null> | null
} = {
  promise: null,
}
export const bootstrapState: { promise: Promise<void> | null } = {
  promise: null,
}
