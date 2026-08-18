import { afterEach, describe, expect, it } from 'bun:test'
import { mount } from '@vue/test-utils'
import { resetStateForTests } from '../composables/useStarsStore/resetStateForTests'
import {
  language,
  license,
  qApplied,
  starredYear,
  type,
} from '../composables/useStarsStore/state'
import StarsActiveFilters from './StarsActiveFilters.vue'

describe('StarsActiveFilters', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/')
    resetStateForTests()
  })

  it('renders nothing when no filters are active', () => {
    const wrapper = mount(StarsActiveFilters)
    expect(wrapper.find('.stars-active-filters').exists()).toBe(false)
  })

  it('renders a chip for each active filter', () => {
    qApplied.value = 'vue'
    language.value = 'Rust'
    license.value = 'MIT'
    starredYear.value = '2026'
    type.value = 'forks'
    const wrapper = mount(StarsActiveFilters)
    const chips = wrapper.findAll('.stars-active-filters__chip')
    expect(chips.length).toBe(5)
  })

  it('clears the search filter when its chip is clicked', async () => {
    window.history.replaceState({}, '', '/')
    qApplied.value = 'vue'
    const wrapper = mount(StarsActiveFilters)
    await wrapper.find('.stars-active-filters__chip').trigger('click')
    expect(qApplied.value).toBe('')
  })

  it('clears the language filter via patchLanguageInQuery when its chip is clicked', async () => {
    window.history.replaceState({}, '', '/')
    language.value = 'Rust'
    const wrapper = mount(StarsActiveFilters)
    await wrapper.find('.stars-active-filters__chip').trigger('click')
    expect(language.value).toBe('all')
  })
})
