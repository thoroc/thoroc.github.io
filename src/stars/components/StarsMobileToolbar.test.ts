import { afterEach, describe, expect, it } from 'bun:test'
import { mount } from '@vue/test-utils'
import { useStarsStore } from '../composables/useStarsStore'
import { resetStateForTests } from '../composables/useStarsStore/resetStateForTests'
import { language, loading, qApplied } from '../composables/useStarsStore/state'
import StarsMobileToolbar from './StarsMobileToolbar.vue'

describe('StarsMobileToolbar', () => {
  afterEach(() => {
    resetStateForTests()
    delete (globalThis as { fetch?: typeof fetch }).fetch
  })

  it('shows the plain "filters" label with no active filters', () => {
    const wrapper = mount(StarsMobileToolbar)
    expect(wrapper.find('.stars-mobile-toolbar__filters').text()).not.toMatch(
      /\d/,
    )
  })

  it('shows the active-filter count when a filter is applied', () => {
    language.value = 'Rust'
    qApplied.value = 'vue'
    const wrapper = mount(StarsMobileToolbar)
    expect(wrapper.find('.stars-mobile-toolbar__filters').text()).toContain('2')
  })

  it('emits open-filters when the filters button is clicked', async () => {
    const wrapper = mount(StarsMobileToolbar)
    await wrapper.find('.stars-mobile-toolbar__filters').trigger('click')
    expect(wrapper.emitted('open-filters')).toBeTruthy()
  })

  it('hides the match-count line while in galaxy view mode', async () => {
    window.history.replaceState({}, '', '/')
    loading.value = false
    globalThis.fetch = (async () =>
      new Response('', { status: 404 })) as unknown as typeof fetch
    const wrapper = mount(StarsMobileToolbar)
    expect(wrapper.find('.stars-mobile-toolbar__count').exists()).toBe(true)
    useStarsStore().setViewMode('galaxy')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.stars-mobile-toolbar__count').exists()).toBe(false)
  })
})
