import { afterEach, describe, expect, it } from 'bun:test'
import { mount } from '@vue/test-utils'
import { resetStateForTests } from '../composables/useStarsStore/resetStateForTests'
import { error, loading } from '../composables/useStarsStore/state'
import StarsSidebarFilters from './StarsSidebarFilters.vue'

describe('StarsSidebarFilters', () => {
  afterEach(resetStateForTests)

  it('does not render StarsFilters while loading', () => {
    const wrapper = mount(StarsSidebarFilters)
    expect(wrapper.findComponent({ name: 'StarsFilters' }).exists()).toBe(false)
  })

  it('does not render StarsFilters when there is an error', () => {
    loading.value = false
    error.value = 'boom'
    const wrapper = mount(StarsSidebarFilters)
    expect(wrapper.findComponent({ name: 'StarsFilters' }).exists()).toBe(false)
  })

  it('renders StarsFilters once loaded without error', () => {
    loading.value = false
    const wrapper = mount(StarsSidebarFilters)
    expect(wrapper.findComponent({ name: 'StarsFilters' }).exists()).toBe(true)
  })
})
