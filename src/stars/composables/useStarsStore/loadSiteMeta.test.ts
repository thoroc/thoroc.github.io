import { afterEach, describe, expect, it } from 'bun:test'
import { loadSiteMeta } from './loadSiteMeta'
import { resetStateForTests } from './resetStateForTests'
import { siteMeta } from './state'

describe('loadSiteMeta', () => {
  afterEach(() => {
    resetStateForTests()
    delete (globalThis as { fetch?: typeof fetch }).fetch
  })

  it('sets siteMeta from a successful fetch', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ owner: 'thoroc' }), {
        status: 200,
      })) as unknown as typeof fetch
    await loadSiteMeta()
    expect(siteMeta.value).toEqual({ owner: 'thoroc' })
  })

  it('sets siteMeta to null on a non-ok response', async () => {
    globalThis.fetch = (async () =>
      new Response('', { status: 404 })) as unknown as typeof fetch
    await loadSiteMeta()
    expect(siteMeta.value).toBeNull()
  })

  it('sets siteMeta to null when fetch rejects', async () => {
    globalThis.fetch = (async () => {
      throw new Error('network error')
    }) as unknown as typeof fetch
    await loadSiteMeta()
    expect(siteMeta.value).toBeNull()
  })
})
