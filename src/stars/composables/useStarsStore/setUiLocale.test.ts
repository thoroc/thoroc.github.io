import { afterEach, describe, expect, it } from 'bun:test'
import { resetStateForTests } from './resetStateForTests'
import { setUiLocale } from './setUiLocale'
import { uiLocale } from './state'

describe('setUiLocale', () => {
  afterEach(resetStateForTests)

  it('sets the locale to "en" and removes ?lang', () => {
    window.history.replaceState({}, '', '/?lang=fr')
    setUiLocale('en')
    expect(uiLocale.value).toBe('en')
    expect(new URLSearchParams(window.location.search).has('lang')).toBe(false)
  })

  it('sets the locale to "fr" and adds ?lang=fr', () => {
    window.history.replaceState({}, '', '/')
    setUiLocale('fr')
    expect(uiLocale.value).toBe('fr')
    expect(new URLSearchParams(window.location.search).get('lang')).toBe('fr')
  })

  it('normalizes any other value to "fr" and adds ?lang=fr', () => {
    window.history.replaceState({}, '', '/')
    setUiLocale('zh-CN')
    expect(uiLocale.value).toBe('fr')
    expect(new URLSearchParams(window.location.search).get('lang')).toBe('fr')
  })

  it('does nothing when window is undefined', () => {
    const original = globalThis.window
    // @ts-expect-error -- simulating a non-browser environment
    globalThis.window = undefined
    expect(() => setUiLocale('en')).not.toThrow()
    globalThis.window = original
  })
})
