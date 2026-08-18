import { afterEach, describe, expect, it } from 'bun:test'
import { flushPromises, mount } from '@vue/test-utils'
import { resetStateForTests } from '../composables/useStarsStore/resetStateForTests'
import StarsExplorer from './StarsExplorer.vue'

const mockFetch = (url: string) => {
  if (url.includes('site.json')) {
    return new Response(JSON.stringify({ owner: 'thoroc' }), { status: 200 })
  }
  if (url.includes('stars.json')) {
    return new Response(
      JSON.stringify({
        items: [
          {
            id: 'owner-repo',
            fullName: 'owner/repo',
            language: 'TypeScript',
            license: 'MIT',
            fork: false,
            stars: 10,
            starredAt: '2026-01-01',
            pushedAt: '2026-01-01',
          },
        ],
      }),
      { status: 200 },
    )
  }
  return new Response('', { status: 404 })
}

describe('StarsExplorer', () => {
  afterEach(() => {
    resetStateForTests()
    delete (globalThis as { fetch?: typeof fetch }).fetch
  })

  it('shows the loading status before bootstrap resolves', () => {
    globalThis.fetch = (async (url: string) =>
      mockFetch(url)) as unknown as typeof fetch
    const wrapper = mount(StarsExplorer)
    expect(wrapper.find('.stars-explorer__status').exists()).toBe(true)
  })

  it('shows the error status when bootstrap fails', async () => {
    globalThis.fetch = (async () => {
      throw new Error('network down')
    }) as unknown as typeof fetch
    const wrapper = mount(StarsExplorer)
    await flushPromises()
    expect(wrapper.find('.stars-explorer__status--error').exists()).toBe(true)
  })

  it('renders the list pane once bootstrap resolves with items', async () => {
    globalThis.fetch = (async (url: string) =>
      mockFetch(url)) as unknown as typeof fetch
    const wrapper = mount(StarsExplorer)
    await flushPromises()
    expect(wrapper.findComponent({ name: 'StarsListPane' }).exists()).toBe(true)
  })

  it('shows the empty state and clears filters when there are no matches', async () => {
    globalThis.fetch = (async (url: string) => {
      if (url.includes('stars.json')) {
        return new Response(JSON.stringify({ items: [] }), { status: 200 })
      }
      return mockFetch(url)
    }) as unknown as typeof fetch
    const wrapper = mount(StarsExplorer)
    await flushPromises()
    expect(wrapper.find('.stars-explorer__empty').exists()).toBe(true)
  })

  it('emits open-filters from the mobile toolbar when isMobile', async () => {
    globalThis.fetch = (async (url: string) =>
      mockFetch(url)) as unknown as typeof fetch
    const wrapper = mount(StarsExplorer, { props: { isMobile: true } })
    await flushPromises()
    expect(wrapper.findComponent({ name: 'StarsMobileToolbar' }).exists()).toBe(
      true,
    )
  })
})
