import { afterEach, describe, expect, it } from 'bun:test'
import { GALAXY_LAYOUT_VERSION } from '../../galaxy/layout-payload'
import { ensureGalaxyLayout } from './ensureGalaxyLayout'
import { resetStateForTests } from './resetStateForTests'
import { galaxyLayoutPayload } from './state'

describe('ensureGalaxyLayout', () => {
  afterEach(() => {
    resetStateForTests()
    delete (globalThis as { fetch?: typeof fetch }).fetch
  })

  it('returns the cached layout without fetching when already valid', async () => {
    const layout = {
      version: GALAXY_LAYOUT_VERSION,
      anchorId: null,
      positions: [1, 2, 3],
    }
    galaxyLayoutPayload.value = layout
    let fetchCalled = false
    globalThis.fetch = (async () => {
      fetchCalled = true
      return new Response('', { status: 500 })
    }) as unknown as typeof fetch

    const result = await ensureGalaxyLayout()
    expect(result).toEqual(layout)
    expect(fetchCalled).toBe(false)
  })

  it('fetches and caches a fresh layout when none is cached', async () => {
    const layout = {
      version: GALAXY_LAYOUT_VERSION,
      anchorId: null,
      positions: [4, 5, 6],
    }
    globalThis.fetch = (async () =>
      new Response(JSON.stringify(layout), {
        status: 200,
      })) as unknown as typeof fetch

    const result = await ensureGalaxyLayout()
    expect(result).toEqual(layout)
  })

  it('coalesces concurrent calls into a single in-flight fetch', async () => {
    let fetchCount = 0
    globalThis.fetch = (async () => {
      fetchCount += 1
      return new Response(
        JSON.stringify({
          version: GALAXY_LAYOUT_VERSION,
          anchorId: null,
          positions: [1, 2, 3],
        }),
        { status: 200 },
      )
    }) as unknown as typeof fetch

    const [a, b] = await Promise.all([
      ensureGalaxyLayout(),
      ensureGalaxyLayout(),
    ])
    expect(a).toEqual(b)
    expect(fetchCount).toBe(1)
  })
})
