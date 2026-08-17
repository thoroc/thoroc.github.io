import { afterEach, describe, expect, it } from 'bun:test'
import { fetchStars } from './fetchStars'

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status })

describe('fetchStars', () => {
  afterEach(() => {
    delete (globalThis as { fetch?: typeof fetch }).fetch
  })

  it('fetches and flattens a single page of starred repos', async () => {
    globalThis.fetch = (async () =>
      jsonResponse([
        { repo: { full_name: 'owner/a' }, starred_at: '2026-01-01T00:00:00Z' },
      ])) as unknown as typeof fetch

    const stars = await fetchStars('owner')
    expect(stars).toEqual([
      { full_name: 'owner/a', starred_at: '2026-01-01T00:00:00Z' },
    ])
  })

  it('paginates until a short page is returned', async () => {
    let call = 0
    globalThis.fetch = (async () => {
      call += 1
      if (call === 1) {
        const page = Array.from({ length: 100 }, (_, i) => ({
          repo: { full_name: `owner/repo-${i}` },
          starred_at: null,
        }))
        return jsonResponse(page)
      }
      return jsonResponse([
        { repo: { full_name: 'owner/last' }, starred_at: null },
      ])
    }) as unknown as typeof fetch

    const stars = await fetchStars('owner')
    expect(stars).toHaveLength(101)
  })

  it('stops when a page returns an empty array', async () => {
    globalThis.fetch = (async () => jsonResponse([])) as unknown as typeof fetch
    const stars = await fetchStars('owner')
    expect(stars).toEqual([])
  })

  it('throws a formatted error on a non-ok response', async () => {
    globalThis.fetch = (async () =>
      jsonResponse({ message: 'Not Found' }, 404)) as unknown as typeof fetch
    await expect(fetchStars('owner')).rejects.toThrow('Not Found')
  })

  it('throws a generic HTTP error when the error body cannot be parsed', async () => {
    globalThis.fetch = (async () =>
      new Response('not json', { status: 500 })) as unknown as typeof fetch
    await expect(fetchStars('owner')).rejects.toThrow('HTTP 500')
  })
})
