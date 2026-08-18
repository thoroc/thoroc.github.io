import { afterEach, describe, expect, it } from 'bun:test'
import { mount } from '@vue/test-utils'
import { resetStateForTests } from '../composables/useStarsStore/resetStateForTests'
import { payload } from '../composables/useStarsStore/state'
import StarsStatsBar from './StarsStatsBar.vue'

const STATS = {
  totals: { total: 10, languages: 2, licenses: 1 },
  topLanguages: [{ name: 'TypeScript', count: 6 }],
  topLicenses: [{ name: 'MIT', count: 5 }],
  starredByYear: [{ year: '2026', count: 10 }],
}

describe('StarsStatsBar', () => {
  afterEach(() => {
    resetStateForTests()
    document.body.style.overflow = ''
    sessionStorage.clear()
  })

  it('renders nothing when there are no stats', () => {
    const wrapper = mount(StarsStatsBar)
    expect(wrapper.find('.stars-stats').exists()).toBe(false)
  })

  it('renders the totals chips when stats are present', () => {
    payload.value = { stats: STATS }
    const wrapper = mount(StarsStatsBar)
    expect(wrapper.text()).toContain('10')
  })

  it('starts collapsed by default and expands on toggle', async () => {
    payload.value = { stats: STATS }
    const wrapper = mount(StarsStatsBar)
    expect(wrapper.find('.stars-stats').classes()).toContain('is-collapsed')
    await wrapper.find('.stars-stats__toggle').trigger('click')
    expect(wrapper.find('.stars-stats').classes()).not.toContain('is-collapsed')
  })

  it('persists the expanded state to sessionStorage', async () => {
    payload.value = { stats: STATS }
    const wrapper = mount(StarsStatsBar)
    await wrapper.find('.stars-stats__toggle').trigger('click')
    expect(sessionStorage.getItem('stars-stats-expanded')).toBe('1')
  })

  it('restores the expanded state from sessionStorage on mount', () => {
    sessionStorage.setItem('stars-stats-expanded', '1')
    payload.value = { stats: STATS }
    const wrapper = mount(StarsStatsBar)
    expect(
      wrapper.find('.stars-stats__toggle').attributes('aria-expanded'),
    ).toBe('true')
  })

  it('always shows collapsed on mobile regardless of the stored preference', () => {
    payload.value = { stats: STATS }
    const wrapper = mount(StarsStatsBar, { props: { isMobile: true } })
    expect(wrapper.find('.stars-stats').classes()).toContain('is-collapsed')
  })
})
