import { onUnmounted, watch } from 'vue'
import {
  CHROME_SELECTORS,
  FALLBACK_TOP_PX,
  GAP_PX,
  MOBILE_SHEET_TOP_VAR,
} from './constants'
import type { OpenSource } from './types'

const measureSheetTopInset = (): void => {
  let bottom = 0
  for (const selector of CHROME_SELECTORS) {
    const el = document.querySelector(selector)
    if (!el) continue
    const { bottom: b, height } = el.getBoundingClientRect()
    if (height > 0 && b > bottom) bottom = b
  }
  const top = bottom > 0 ? bottom + GAP_PX : FALLBACK_TOP_PX
  document.documentElement.style.setProperty(
    MOBILE_SHEET_TOP_VAR,
    `${Math.round(top)}px`,
  )
}

const clearSheetTopInset = (): void => {
  document.documentElement.style.removeProperty(MOBILE_SHEET_TOP_VAR)
}

export const useMobileSheetInset = (openSource: OpenSource): void => {
  let resizeObserver: ResizeObserver | null = null

  const isOpen = (): boolean => {
    const v = typeof openSource === 'function' ? openSource() : openSource.value
    return Boolean(v)
  }

  const onLayoutChange = (): void => {
    if (isOpen()) measureSheetTopInset()
  }

  const observeChrome = (): void => {
    resizeObserver?.disconnect()
    if (typeof ResizeObserver === 'undefined') return
    resizeObserver = new ResizeObserver(onLayoutChange)
    for (const selector of CHROME_SELECTORS) {
      const el = document.querySelector(selector)
      if (el) resizeObserver.observe(el)
    }
  }

  const bindListeners = (): void => {
    window.addEventListener('resize', onLayoutChange)
    window.visualViewport?.addEventListener('resize', onLayoutChange)
    window.visualViewport?.addEventListener('scroll', onLayoutChange)
    observeChrome()
  }

  const unbindListeners = (): void => {
    window.removeEventListener('resize', onLayoutChange)
    window.visualViewport?.removeEventListener('resize', onLayoutChange)
    window.visualViewport?.removeEventListener('scroll', onLayoutChange)
    resizeObserver?.disconnect()
    resizeObserver = null
  }

  watch(
    openSource,
    (open) => {
      unbindListeners()
      if (open) {
        requestAnimationFrame(() => {
          measureSheetTopInset()
          bindListeners()
        })
      } else {
        clearSheetTopInset()
      }
    },
    { flush: 'post' },
  )

  onUnmounted(() => {
    unbindListeners()
    clearSheetTopInset()
  })
}
