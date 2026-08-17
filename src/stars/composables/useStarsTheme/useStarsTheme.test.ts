import { afterEach, describe, expect, it } from 'bun:test'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { STARS_COLOR_THEME_KEY } from '../../theme/color-theme'
import type { StarsTheme } from './types'
import { useStarsTheme } from './useStarsTheme'

let exposed: StarsTheme | null = null
const Host = defineComponent({
  setup() {
    exposed = useStarsTheme()
    return () => h('div')
  },
})

describe('useStarsTheme', () => {
  afterEach(() => {
    localStorage.removeItem(STARS_COLOR_THEME_KEY)
    exposed = null
  })

  it('exposes preference, resolvedTheme, and setColorTheme after mount', () => {
    const wrapper = mount(Host)
    expect(exposed).not.toBeNull()
    const theme = exposed as StarsTheme
    expect(['light', 'dark', 'system']).toContain(theme.preference.value)
    expect(['light', 'dark']).toContain(theme.resolvedTheme.value)
    expect(typeof theme.setColorTheme).toBe('function')
    wrapper.unmount()
  })

  it('setColorTheme("dark") updates preference/resolvedTheme and persists it', () => {
    const wrapper = mount(Host)
    exposed?.setColorTheme('dark')
    expect(exposed?.preference.value).toBe('dark')
    expect(exposed?.resolvedTheme.value).toBe('dark')
    expect(localStorage.getItem(STARS_COLOR_THEME_KEY)).toBe('dark')
    wrapper.unmount()
  })

  it('normalizes any non-"dark" value passed to setColorTheme to "light"', () => {
    const wrapper = mount(Host)
    // biome-ignore lint/suspicious/noExplicitAny: exercising the runtime normalization guard
    exposed?.setColorTheme('purple' as any)
    expect(exposed?.preference.value).toBe('light')
    expect(exposed?.resolvedTheme.value).toBe('light')
    wrapper.unmount()
  })

  it('re-syncs on a system color-scheme change while preference is "system"', () => {
    const original = window.matchMedia
    let changeHandler: (() => void) | undefined
    window.matchMedia = ((query: string) =>
      ({
        matches: true,
        media: query,
        addEventListener: (_type: string, handler: () => void) => {
          changeHandler = handler
        },
        removeEventListener: () => {},
      }) as unknown as MediaQueryList) as typeof window.matchMedia

    const wrapper = mount(Host)
    expect(exposed?.preference.value).toBe('system')
    changeHandler?.()
    expect(exposed?.resolvedTheme.value).toBe('dark')

    wrapper.unmount()
    window.matchMedia = original
  })

  it('ignores a system color-scheme change while preference is not "system"', () => {
    const original = window.matchMedia
    let changeHandler: (() => void) | undefined
    window.matchMedia = ((query: string) =>
      ({
        matches: true,
        media: query,
        addEventListener: (_type: string, handler: () => void) => {
          changeHandler = handler
        },
        removeEventListener: () => {},
      }) as unknown as MediaQueryList) as typeof window.matchMedia

    const wrapper = mount(Host)
    exposed?.setColorTheme('light')
    changeHandler?.()
    expect(exposed?.resolvedTheme.value).toBe('light')

    wrapper.unmount()
    window.matchMedia = original
  })

  it('removes the media-query listener on unmount without throwing', () => {
    const wrapper = mount(Host)
    expect(() => wrapper.unmount()).not.toThrow()
  })
})
