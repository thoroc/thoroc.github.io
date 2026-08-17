import { mapLegacySort } from '../../utils/stars-filter'
import { applyQuery } from './applyQuery'
import { ensureGalaxyLayout } from './ensureGalaxyLayout'
import { hasStarsFilterQuery } from './hasStarsFilterQuery'
import { loadData } from './loadData'
import { loadSiteMeta } from './loadSiteMeta'
import { restoreSession } from './restoreSession'
import {
  bootstrapState,
  error,
  loading,
  payload,
  sort,
  viewMode,
} from './state'

export const bootstrap = (): Promise<void> => {
  if (bootstrapState.promise) return bootstrapState.promise
  bootstrapState.promise = (async () => {
    loading.value = true
    error.value = ''
    try {
      await Promise.all([loadSiteMeta(), loadData()])
      const ui = payload.value?.ui || {}
      if (ui.defaultSort && !hasStarsFilterQuery()) {
        const params = new URLSearchParams(window.location.search)
        if (!params.has('stars-sort'))
          sort.value = mapLegacySort(ui.defaultSort)
      }
      applyQuery()
      if (!hasStarsFilterQuery()) restoreSession()
      if (viewMode.value === 'galaxy') await ensureGalaxyLayout()
    } finally {
      loading.value = false
    }
  })()
  return bootstrapState.promise
}
