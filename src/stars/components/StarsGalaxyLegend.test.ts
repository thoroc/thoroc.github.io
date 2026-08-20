import { afterEach, describe, expect, it } from 'bun:test'
import { mount } from '@vue/test-utils'
import { setUiLocale } from '../composables/useStarsStore'
import { resetStateForTests } from '../composables/useStarsStore/resetStateForTests'
import { OTHER_LANGUAGE_KEY } from '../utils/other-language'
import StarsGalaxyLegend from './StarsGalaxyLegend.vue'

describe('StarsGalaxyLegend', () => {
  afterEach(resetStateForTests)

  it('renders nothing when there are no items or tiers', () => {
    const wrapper = mount(StarsGalaxyLegend)
    expect(wrapper.find('.stars-galaxy-legend').exists()).toBe(false)
  })

  it('renders language and star-tier blocks', () => {
    const wrapper = mount(StarsGalaxyLegend, {
      props: {
        items: [{ name: 'TypeScript', count: 5 }],
        starTiers: [{ key: '10k+', min: 10000, count: 3 }],
      },
    })
    expect(wrapper.text()).toContain('TypeScript')
    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('3')
  })

  it('emits select-lang and select-tier on click', async () => {
    const wrapper = mount(StarsGalaxyLegend, {
      props: {
        items: [{ name: 'Rust', count: 2 }],
        starTiers: [{ key: '1k+', min: 1000, count: 4 }],
      },
    })
    const buttons = wrapper.findAll('.stars-galaxy-legend__btn')
    await buttons[0]?.trigger('click')
    await buttons[1]?.trigger('click')
    expect(wrapper.emitted('select-tier')).toEqual([['1k+']])
    expect(wrapper.emitted('select-lang')).toEqual([['Rust']])
  })

  it('shows the clear button only when a filter is active, and emits clear-filter', async () => {
    const wrapper = mount(StarsGalaxyLegend, {
      props: {
        items: [{ name: 'Go', count: 1 }],
        activeFilter: { langs: ['Go'], tiers: [] },
      },
    })
    const clearBtn = wrapper.find('.stars-galaxy-legend__clear')
    expect(clearBtn.exists()).toBe(true)
    await clearBtn.trigger('click')
    expect(wrapper.emitted('clear-filter')).toBeTruthy()
  })

  it('marks the active language/tier button as pressed', () => {
    const wrapper = mount(StarsGalaxyLegend, {
      props: {
        items: [{ name: 'Go', count: 1 }],
        activeFilter: { langs: ['Go'], tiers: [] },
      },
    })
    expect(
      wrapper.find('.stars-galaxy-legend__btn').attributes('aria-pressed'),
    ).toBe('true')
  })

  it('translates the "other" language bucket to the localized label', () => {
    setUiLocale('en')
    const wrapper = mount(StarsGalaxyLegend, {
      props: { items: [{ name: OTHER_LANGUAGE_KEY, count: 1 }] },
    })
    expect(wrapper.text()).toContain('Other')
    expect(wrapper.text()).not.toContain(OTHER_LANGUAGE_KEY)
  })
})
