import { afterEach, describe, expect, it } from 'bun:test'
import { bootstrap } from './bootstrap'
import { resetStateForTests } from './resetStateForTests'
import { loading, payload, sort, viewMode } from './state'

const mockFetch = (url: string) => {
  if (url.includes('site.json')) {
    return new Response(JSON.stringify({ owner: 'thoroc' }), { status: 200 })
  }
  if (url.includes('stars.json')) {
    return new Response(JSON.stringify({ items: [] }), { status: 200 })
  }
  return new Response('', { status: 404 })
}

describe('bootstrap', () => {
  afterEach(() => {
    resetStateForTests()
    delete (globalThis as { fetch?: typeof fetch }).fetch
  })

  it('loads data and site meta, then flips loading off', async () => {
    window.history.replaceState({}, '', '/')
    globalThis.fetch = (async (url: string) =>
      mockFetch(url)) as unknown as typeof fetch

    await bootstrap()

    expect(loading.value).toBe(false)
    expect(payload.value).toEqual({ items: [] })
  })

  it('reuses the same in-flight promise for concurrent calls', async () => {
    window.history.replaceState({}, '', '/')
    let fetchCount = 0
    globalThis.fetch = (async (url: string) => {
      fetchCount += 1
      return mockFetch(url)
    }) as unknown as typeof fetch

    await Promise.all([bootstrap(), bootstrap()])
    // 2 endpoints (site.json + stars.json) fetched exactly once each.
    expect(fetchCount).toBe(2)
  })

  it('applies a configured default sort when no sort query param is present', async () => {
    window.history.replaceState({}, '', '/')
    globalThis.fetch = (async (url: string) => {
      if (url.includes('stars.json')) {
        return new Response(
          JSON.stringify({ items: [], ui: { defaultSort: 'stars' } }),
          { status: 200 },
        )
      }
      return mockFetch(url)
    }) as unknown as typeof fetch

    await bootstrap()
    expect(sort.value).toBe('most_stars')
  })

  it('ensures the galaxy layout when the view mode is galaxy', async () => {
    window.history.replaceState({}, '', '/?stars-view=galaxy')
    let galaxyLayoutFetched = false
    globalThis.fetch = (async (url: string) => {
      if (url.includes('galaxy.json')) {
        galaxyLayoutFetched = true
        return new Response('', { status: 404 })
      }
      return mockFetch(url)
    }) as unknown as typeof fetch

    await bootstrap()
    expect(viewMode.value).toBe('galaxy')
    expect(galaxyLayoutFetched).toBe(true)
  })
})
