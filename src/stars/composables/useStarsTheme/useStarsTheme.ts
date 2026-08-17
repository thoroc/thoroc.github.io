import { onMounted, onUnmounted, ref } from 'vue'
import {
  applyColorTheme,
  persistColorThemePreference,
  readColorThemePreference,
  resolveColorTheme,
} from '../../theme/color-theme'
import type { StarsTheme } from './types'

export const useStarsTheme = (): StarsTheme => {
  const preference = ref(readColorThemePreference())
  const resolvedTheme = ref(resolveColorTheme(preference.value))

  const syncTheme = (): void => {
    resolvedTheme.value = applyColorTheme(preference.value)
  }

  const setColorTheme: StarsTheme['setColorTheme'] = (next) => {
    const value = next === 'dark' ? 'dark' : 'light'
    preference.value = value
    persistColorThemePreference(value)
    syncTheme()
  }

  let mediaQuery: MediaQueryList | undefined
  let onMediaChange: (() => void) | undefined

  onMounted(() => {
    syncTheme()
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    onMediaChange = () => {
      if (preference.value === 'system') syncTheme()
    }
    mediaQuery.addEventListener('change', onMediaChange)
  })

  onUnmounted(() => {
    if (mediaQuery && onMediaChange) {
      mediaQuery.removeEventListener('change', onMediaChange)
    }
  })

  return {
    preference,
    resolvedTheme,
    setColorTheme,
  }
}
