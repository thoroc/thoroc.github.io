import { afterEach, describe, expect, it } from 'bun:test'
import { loadData } from './loadData'
import { resetStateForTests } from './resetStateForTests'
import {
  error,
  localeConfig,
  payload,
  searchConfig,
  showLanguage,
  showLicense,
  showStarsCount,
  sort,
  virtualRowHeight,
} from './state'

describe('loadData', () => {
  afterEach(() => {
    resetStateForTests()
    delete (globalThis as { fetch?: typeof fetch }).fetch
  })

  it('populates payload and derived ui settings from a successful fetch', async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          items: [],
          ui: {
            showLanguage: false,
            showStarsCount: false,
            showLicense: false,
            virtualRowHeight: 200,
            defaultSort: 'stars',
            defaultUiLocale: 'en',
            searchDebounceMs: 500,
          },
        }),
        { status: 200 },
      )) as unknown as typeof fetch

    await loadData()

    expect(error.value).toBe('')
    expect(showLanguage.value).toBe(false)
    expect(showStarsCount.value).toBe(false)
    expect(showLicense.value).toBe(false)
    expect(virtualRowHeight.value).toBe(200)
    expect(sort.value).toBe('most_stars')
    expect(localeConfig.configured).toBe('en')
    expect(searchConfig.debounceMs).toBe(500)
  })

  it('defaults ui settings when the payload has no ui block', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ items: [] }), {
        status: 200,
      })) as unknown as typeof fetch

    await loadData()

    expect(showLanguage.value).toBe(true)
    expect(showStarsCount.value).toBe(true)
    expect(showLicense.value).toBe(true)
    expect(virtualRowHeight.value).toBe(140)
  })

  it('sets an error message on a non-ok response', async () => {
    globalThis.fetch = (async () =>
      new Response('', { status: 500 })) as unknown as typeof fetch
    await loadData()
    expect(error.value).toContain('500')
    expect(payload.value).toBeNull()
  })

  it('sets a fallback error message for a non-Error rejection', async () => {
    globalThis.fetch = (async () => {
      throw 'boom'
    }) as unknown as typeof fetch
    await loadData()
    expect(error.value).toBe('Error')
  })
})
