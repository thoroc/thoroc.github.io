import type { GalaxyLayout } from '../../galaxy/layout-payload'
import type { CountOption, YearOption } from '../../utils/stars-filter/types'

declare global {
  // Injected via a Vite `define` in a downstream build config, if configured;
  // not currently wired up in this repo's astro.config.mjs, so the `typeof`
  // guard in readDefaultSiteTitle always takes the 'Stars' fallback branch.
  // eslint-disable-next-line no-var
  const __STARS_DEFAULT_SITE_TITLE__: string | undefined
}

/** The repo/item shape used throughout the store — a superset covering both
 * utils/stars-filter's StarItem and galaxy/repo-position's RepoLike. */
export interface StarsRepoItem {
  id?: string
  fullName: string
  description?: string
  topics?: string[]
  language: string | null
  license: string | null
  fork: boolean
  stars: number
  forksCount?: number
  watchersCount?: number
  starredAt: string
  pushedAt: string
}

export interface StarsUiConfig {
  showLanguage?: boolean
  showStarsCount?: boolean
  showLicense?: boolean
  virtualRowHeight?: number
  defaultSort?: string
  defaultUiLocale?: string
  searchDebounceMs?: number
  siteName?: string
}

export interface StarsPayload {
  items?: StarsRepoItem[]
  total?: number
  owner?: string
  repoName?: string
  generatedAt?: string
  stats?: unknown
  ui?: StarsUiConfig
}

export interface StarsSiteMeta {
  owner?: string
  repoName?: string
  generatedAt?: string
  title?: string
  // Not produced by this repo's own scripts/stars/generate/writeSiteJson.ts —
  // optional upstream-tool fields App.vue reads defensively (same class as
  // __STARS_DEFAULT_SITE_TITLE__/GALAXY_RUNTIME_LAYOUT_TAG elsewhere).
  toolRepoOwner?: string
  toolRepoName?: string
  toolVersion?: string
}

export interface GalaxyRenderStats {
  layoutVersion: number
  pointCount: number
  precomputed: boolean
}

export type { CountOption, YearOption }

/** The reactive object returned by useStarsStore(). Assembled at runtime via
 * `reactive({ ...refs, ...methods })` plus `Object.defineProperties` for the
 * computed-backed getters (items, total, filtered, etc.) — this interface
 * describes that combined runtime shape for consumers, not the intermediate
 * construction steps. */
export interface StarsStore {
  uiLocale: string
  loading: boolean
  error: string
  payload: StarsPayload | null
  siteMeta: StarsSiteMeta | null
  qInput: string
  qApplied: string
  language: string
  license: string
  starredYear: string
  type: string
  sort: string
  galaxyRenderStats: GalaxyRenderStats
  setGalaxyRenderStats: (
    stats:
      | { layoutVersion?: unknown; pointCount?: unknown; precomputed?: unknown }
      | null
      | undefined,
  ) => void
  showLanguage: boolean
  showStarsCount: boolean
  showLicense: boolean
  virtualRowHeight: number
  viewMode: string
  galaxyFocus: string
  galaxySelected: StarsRepoItem | null
  galaxyAreaExpanded: boolean
  setViewMode: (mode: string) => void
  setGalaxyAreaExpanded: (expanded: unknown) => void
  toggleGalaxyAreaExpanded: () => void
  ensureGalaxyLayout: () => Promise<GalaxyLayout | null>
  selectGalaxyItem: (item: StarsRepoItem | null | undefined) => void
  closeGalaxyDetail: () => void
  bootstrap: () => Promise<void>
  onSearch: () => void
  onPopState: () => void
  applyQuery: () => void
  scrollListToTop: () => void
  setUiLocale: (locale: string) => void
  patchLanguageInQuery: (langValue: string | null | undefined) => void
  patchLicenseInQuery: (licenseValue: string | null | undefined) => void
  patchStarredYearInQuery: (yearValue: string | null | undefined) => void
  clearAllFilters: () => void
  clearFilterKey: (key: string) => void
  isDescExpanded: (id: string) => boolean
  toggleDescExpanded: (id: string) => void
  collapseDescExpanded: (id: string) => void
  readonly items: StarsRepoItem[]
  readonly total: number
  readonly owner: string
  readonly repoName: string
  readonly generatedAt: string
  readonly pageTitle: string
  readonly stats: unknown
  readonly galaxyLayout: GalaxyLayout | null
  readonly galaxyVirtualIndexMap: Map<string, number>
  readonly licenseOptions: CountOption[]
  readonly yearOptions: YearOption[]
  readonly languageOptions: CountOption[]
  readonly filtered: StarsRepoItem[]
  readonly hasActiveFilters: boolean
}

export type { GalaxyLayout }
