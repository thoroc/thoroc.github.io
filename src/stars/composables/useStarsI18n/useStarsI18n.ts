import { computed } from 'vue'
import { STARS_ROUTE_BASE } from '../../config'
import { createTranslator } from '../../i18n'
import { useStarsStore } from '../useStarsStore'
import type { StarsI18n } from './types'

export const useStarsI18n = (): StarsI18n => {
  const store = useStarsStore()
  const locale = computed(() => store.uiLocale)
  const t = computed(() => createTranslator(() => locale.value))
  const basePath = computed(() => STARS_ROUTE_BASE)
  return { locale, t, basePath }
}
