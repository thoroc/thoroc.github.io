import { computed } from 'vue'
import { buildGalaxyVirtualIndexMap } from '../../galaxy/layout-payload'
import { expandReposToVirtualStars } from '../../galaxy/virtual-stars'
import {
  buildLanguageOptions,
  buildLicenseOptions,
  buildYearOptions,
  filterAndSortStars,
  filterStars,
} from '../../utils/stars-filter'
import { cachePageTitle } from './cachePageTitle'
import { currentFilterState } from './currentFilterState'
import { readCachedPageTitle } from './readCachedPageTitle'
import {
  DEFAULT_SITE_TITLE,
  galaxyLayoutPayload,
  language,
  license,
  payload,
  qApplied,
  siteMeta,
  starredYear,
  type,
} from './state'

export const items = computed(() => payload.value?.items || [])
export const total = computed(() => payload.value?.total ?? items.value.length)
export const owner = computed(
  () => payload.value?.owner || siteMeta.value?.owner || '',
)
export const repoName = computed(
  () => payload.value?.repoName || siteMeta.value?.repoName || 'stars',
)
export const generatedAt = computed(
  () => payload.value?.generatedAt || siteMeta.value?.generatedAt || '',
)
export const pageTitle = computed(() => {
  const fromMeta = siteMeta.value?.title
  const fromPayload = payload.value?.ui?.siteName
  const title =
    (typeof fromMeta === 'string' && fromMeta.trim()) ||
    (typeof fromPayload === 'string' && fromPayload.trim()) ||
    ''
  if (title) {
    cachePageTitle(title)
    return title
  }
  const cached = readCachedPageTitle()
  if (cached) return cached
  return DEFAULT_SITE_TITLE
})
export const stats = computed(() => payload.value?.stats || null)
export const galaxyLayout = computed(() => galaxyLayoutPayload.value)
export const galaxyVirtualIndexMap = computed(() =>
  buildGalaxyVirtualIndexMap(expandReposToVirtualStars(items.value)),
)

export const languageOptions = computed(() =>
  buildLanguageOptions(
    filterStars(items.value, currentFilterState({ language: 'all' })),
  ),
)
export const licenseOptions = computed(() =>
  buildLicenseOptions(
    filterStars(items.value, currentFilterState({ license: 'all' })),
  ),
)
export const yearOptions = computed(() =>
  buildYearOptions(
    filterStars(items.value, currentFilterState({ starredYear: 'all' })),
  ),
)

export const filtered = computed(() =>
  filterAndSortStars(items.value, currentFilterState()),
)

export const hasActiveFilters = computed(
  () =>
    !!qApplied.value.trim() ||
    language.value !== 'all' ||
    license.value !== 'all' ||
    starredYear.value !== 'all' ||
    type.value !== 'all',
)
