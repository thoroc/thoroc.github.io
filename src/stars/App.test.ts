import { afterEach, describe, expect, it } from 'bun:test'
import { flushPromises, mount } from '@vue/test-utils'
import App from './App.vue'
import { useStarsStore } from './composables/useStarsStore'
import { resetStateForTests } from './composables/useStarsStore/resetStateForTests'

const mockFetch = (url: string) => {
  if (url.includes('site.json')) {
    return new Response(
      JSON.stringify({ owner: 'thoroc', repoName: 'stars' }),
      {
        status: 200,
      },
    )
  }
  if (url.includes('stars.json')) {
    return new Response(JSON.stringify({ items: [] }), { status: 200 })
  }
  return new Response('', { status: 404 })
}

describe('App', () => {
  afterEach(() => {
    resetStateForTests()
    delete (globalThis as { fetch?: typeof fetch }).fetch
  })

  it('bootstraps the store and renders the header/brand', async () => {
    globalThis.fetch = (async (url: string) =>
      mockFetch(url)) as unknown as typeof fetch
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.find('.stars-app__brand').exists()).toBe(true)
    expect(wrapper.find('header.stars-app__header').exists()).toBe(true)
  })

  it('sets document.title from the resolved page title', async () => {
    globalThis.fetch = (async (url: string) =>
      mockFetch(url)) as unknown as typeof fetch
    mount(App)
    await flushPromises()
    expect(document.title.length).toBeGreaterThan(0)
  })

  it('switches the UI language via the language buttons', async () => {
    globalThis.fetch = (async (url: string) =>
      mockFetch(url)) as unknown as typeof fetch
    const wrapper = mount(App)
    await flushPromises()
    const store = useStarsStore()
    const [, enBtn] = wrapper.findAll('.stars-app__lang-btn')
    await enBtn?.trigger('click')
    expect(store.uiLocale).toBe('en')
  })

  it('toggles the sidebar collapsed state', async () => {
    globalThis.fetch = (async (url: string) =>
      mockFetch(url)) as unknown as typeof fetch
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.find('.stars-app__sidebar').exists()).toBe(true)
    await wrapper.find('.stars-app__sidebar-toggle').trigger('click')
    expect(wrapper.find('.stars-app__sidebar').exists()).toBe(false)
    expect(wrapper.find('.stars-app__sidebar-reopen').exists()).toBe(true)
  })

  it('clears filters and does not navigate when the brand link is clicked', async () => {
    globalThis.fetch = (async (url: string) =>
      mockFetch(url)) as unknown as typeof fetch
    const wrapper = mount(App)
    await flushPromises()
    const store = useStarsStore()
    store.qApplied = 'vue'
    await wrapper.find('.stars-app__brand').trigger('click')
    expect(store.qApplied).toBe('')
  })
})
