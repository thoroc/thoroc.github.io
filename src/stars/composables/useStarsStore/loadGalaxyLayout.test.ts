import { afterEach, describe, expect, it } from 'bun:test'
import { GALAXY_LAYOUT_VERSION } from '../../galaxy/layout-payload'
import { loadGalaxyLayout } from './loadGalaxyLayout'
import { resetStateForTests } from './resetStateForTests'
import { galaxyLayoutPayload } from './state'

describe('loadGalaxyLayout', () => {
  afterEach(() => {
    resetStateForTests()
    delete (globalThis as { fetch?: typeof fetch }).fetch
  })

  it('stores and returns a valid remote layout', async () => {
    const layout = {
      version: GALAXY_LAYOUT_VERSION,
      anchorId: null,
      positions: [1, 2, 3],
    }
    globalThis.fetch = (async () =>
      new Response(JSON.stringify(layout), {
        status: 200,
      })) as unknown as typeof fetch
    const result = await loadGalaxyLayout()
    expect(result).toEqual(layout)
    expect(galaxyLayoutPayload.value).toEqual(layout)
  })

  it('returns null and leaves state untouched for an invalid layout', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ version: 0 }), {
        status: 200,
      })) as unknown as typeof fetch
    const result = await loadGalaxyLayout()
    expect(result).toBeNull()
    expect(galaxyLayoutPayload.value).toBeNull()
  })

  it('returns null on a non-ok response', async () => {
    globalThis.fetch = (async () =>
      new Response('', { status: 500 })) as unknown as typeof fetch
    expect(await loadGalaxyLayout()).toBeNull()
  })

  it('returns null when fetch rejects', async () => {
    globalThis.fetch = (async () => {
      throw new Error('network error')
    }) as unknown as typeof fetch
    expect(await loadGalaxyLayout()).toBeNull()
  })
})
