import { afterEach, describe, expect, it } from 'bun:test'
import { mount } from '@vue/test-utils'
import type { StarsRepoItem } from '../composables/useStarsStore'
import { useStarsStore } from '../composables/useStarsStore'
import { resetStateForTests } from '../composables/useStarsStore/resetStateForTests'
import { loading, payload } from '../composables/useStarsStore/state'
import StarsSidebarLangNav from './StarsSidebarLangNav.vue'

const makeItem = (overrides: Partial<StarsRepoItem> = {}): StarsRepoItem => ({
  id: 'owner-repo',
  fullName: 'owner/repo',
  language: 'TypeScript',
  license: 'MIT',
  fork: false,
  stars: 10,
  starredAt: '2026-01-01',
  pushedAt: '2026-01-01',
  ...overrides,
})

describe('StarsSidebarLangNav', () => {
  afterEach(resetStateForTests)

  it('does not render while loading', () => {
    const wrapper = mount(StarsSidebarLangNav)
    expect(wrapper.find('.stars-sidebar-lang-wrap').exists()).toBe(false)
  })

  it('renders an "all" link with the total count', () => {
    loading.value = false
    payload.value = { items: [makeItem(), makeItem({ language: 'Rust' })] }
    const wrapper = mount(StarsSidebarLangNav)
    const allLink = wrapper.find('.stars-sidebar-lang__all')
    expect(allLink.find('.stars-sidebar-lang__count').text()).toBe('2')
  })

  it('renders one link per distinct language with its count', () => {
    loading.value = false
    payload.value = {
      items: [
        makeItem({ language: 'TypeScript' }),
        makeItem({ language: 'TypeScript' }),
        makeItem({ language: 'Rust' }),
      ],
    }
    const wrapper = mount(StarsSidebarLangNav)
    const links = wrapper.findAll(
      '.stars-sidebar-lang .stars-sidebar-lang__link',
    )
    expect(links.length).toBe(2)
  })

  it('marks the currently selected language as active', () => {
    loading.value = false
    payload.value = { items: [makeItem({ language: 'Rust' })] }
    useStarsStore().language = 'Rust'
    const wrapper = mount(StarsSidebarLangNav)
    expect(wrapper.find('.stars-sidebar-lang__link.is-active').exists()).toBe(
      true,
    )
  })

  it('patches the language query param when a language is clicked', async () => {
    window.history.replaceState({}, '', '/')
    loading.value = false
    payload.value = { items: [makeItem({ language: 'Rust' })] }
    const wrapper = mount(StarsSidebarLangNav)
    const links = wrapper.findAll(
      '.stars-sidebar-lang .stars-sidebar-lang__link',
    )
    await links[0]?.trigger('click')
    expect(new URLSearchParams(window.location.search).get('stars-lang')).toBe(
      'Rust',
    )
  })

  it('clears the language filter when "all" is clicked', async () => {
    window.history.replaceState({}, '', '/?stars-lang=Rust')
    loading.value = false
    payload.value = { items: [makeItem({ language: 'Rust' })] }
    const wrapper = mount(StarsSidebarLangNav)
    await wrapper.find('.stars-sidebar-lang__all').trigger('click')
    expect(new URLSearchParams(window.location.search).has('stars-lang')).toBe(
      false,
    )
  })
})
