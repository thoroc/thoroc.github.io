import { afterEach, describe, expect, it } from 'bun:test'
import { mount } from '@vue/test-utils'
import type { StarsRepoItem } from '../composables/useStarsStore'
import { resetStateForTests } from '../composables/useStarsStore/resetStateForTests'
import { payload } from '../composables/useStarsStore/state'
import StarsStatsCharts from './StarsStatsCharts.vue'

const makeItem = (overrides: Partial<StarsRepoItem> = {}): StarsRepoItem => ({
  id: 'owner-repo',
  fullName: 'owner/repo',
  language: 'TypeScript',
  license: 'MIT',
  fork: false,
  stars: 10,
  starredAt: '2026',
  pushedAt: '2026-01-01',
  ...overrides,
})

const STATS = {
  totals: { total: 2, languages: 2, licenses: 1 },
  topLanguages: [
    { name: 'TypeScript', count: 1 },
    { name: 'Rust', count: 1 },
  ],
  topLicenses: [{ name: 'MIT', count: 2 }],
  starredByYear: [{ year: '2026', count: 2 }],
}

describe('StarsStatsCharts', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/')
    resetStateForTests()
  })

  it('renders nothing when there are no stats', () => {
    const wrapper = mount(StarsStatsCharts)
    expect(wrapper.find('.stars-stats__body').exists()).toBe(false)
  })

  it('renders a bar per top language/license and a column per year', () => {
    payload.value = {
      items: [
        makeItem({ language: 'TypeScript' }),
        makeItem({ id: 'b', language: 'Rust' }),
      ],
      stats: STATS,
    }
    const wrapper = mount(StarsStatsCharts)
    expect(
      wrapper.findAll('.stars-stats__block')[0]?.findAll('li').length,
    ).toBe(2)
    expect(wrapper.findAll('.stars-stats__year-col').length).toBe(1)
  })

  it('patches the language query when a language bar is clicked', async () => {
    payload.value = {
      items: [makeItem({ language: 'TypeScript' })],
      stats: STATS,
    }
    const wrapper = mount(StarsStatsCharts)
    await wrapper.find('.stars-stats__bar-btn').trigger('click')
    expect(new URLSearchParams(window.location.search).get('stars-lang')).toBe(
      'TypeScript',
    )
  })

  it('toggles a filter off when clicking its already-active bar', async () => {
    window.history.replaceState({}, '', '/?stars-lang=TypeScript')
    payload.value = {
      items: [makeItem({ language: 'TypeScript' })],
      stats: STATS,
    }
    const { useStarsStore } = await import('../composables/useStarsStore')
    useStarsStore().language = 'TypeScript'
    const wrapper = mount(StarsStatsCharts)
    await wrapper.find('.stars-stats__bar-btn').trigger('click')
    expect(new URLSearchParams(window.location.search).has('stars-lang')).toBe(
      false,
    )
  })

  it('shows filtered/total counts once an active filter narrows the pool', async () => {
    payload.value = {
      items: [
        makeItem({ language: 'TypeScript', fork: false }),
        makeItem({ id: 'b', language: 'TypeScript', fork: true }),
      ],
      stats: {
        ...STATS,
        topLanguages: [{ name: 'TypeScript', count: 2 }],
      },
    }
    const { useStarsStore } = await import('../composables/useStarsStore')
    useStarsStore().type = 'forks'
    const wrapper = mount(StarsStatsCharts)
    expect(wrapper.find('.stars-stats__bar-count').text()).toContain('1')
    expect(wrapper.find('.stars-stats__bar-count').text()).toContain('2')
  })
})
