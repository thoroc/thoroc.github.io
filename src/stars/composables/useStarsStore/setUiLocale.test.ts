import { afterEach, describe, expect, it } from 'bun:test'
import { resetStateForTests } from './resetStateForTests'
import { setUiLocale } from './setUiLocale'
import { uiLocale } from './state'

describe('setUiLocale', () => {
  afterEach(resetStateForTests)

  it('sets the locale to "en" and adds ?lang=en', () => {
    window.history.replaceState({}, '', '/')
    setUiLocale('en')
    expect(uiLocale.value).toBe('en')
    expect(new URLSearchParams(window.location.search).get('lang')).toBe('en')
  })

  it('normalizes any non-"en" value to "zh-CN" and removes ?lang', () => {
    window.history.replaceState({}, '', '/?lang=en')
    setUiLocale('fr')
    expect(uiLocale.value).toBe('zh-CN')
    expect(new URLSearchParams(window.location.search).has('lang')).toBe(false)
  })

  it('does nothing when window is undefined', () => {
    const original = globalThis.window
    // @ts-expect-error -- simulating a non-browser environment
    globalThis.window = undefined
    expect(() => setUiLocale('en')).not.toThrow()
    globalThis.window = original
  })
})
