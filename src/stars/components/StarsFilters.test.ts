import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mount } from '@vue/test-utils'
import { setUiLocale } from '../composables/useStarsStore'
import { resetStateForTests } from '../composables/useStarsStore/resetStateForTests'
import StarsFilters from './StarsFilters.vue'

const clickOptionByText = async (text: string): Promise<void> => {
  const option = Array.from(
    document.querySelectorAll('.stars-select__option'),
  ).find((el) => el.textContent?.trim() === text)
  option?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('StarsFilters', () => {
  beforeEach(() => {
    setUiLocale('en')
  })

  afterEach(() => {
    document.body.innerHTML = ''
    resetStateForTests()
  })

  it('renders the four field labels', () => {
    const wrapper = mount(StarsFilters, { attachTo: document.body })
    const labels = wrapper.findAll('.stars-filters__label').map((l) => l.text())
    expect(labels.length).toBe(4)
    wrapper.unmount()
  })

  it('prepends an "all" option and formats license/year entries with counts', async () => {
    const wrapper = mount(StarsFilters, {
      attachTo: document.body,
      props: {
        licenseOptions: [{ name: 'MIT', count: 5 }],
        yearOptions: [{ year: '2026', count: 2 }],
      },
    })
    const triggers = wrapper.findAll('.stars-select__trigger')
    await triggers[0]?.trigger('click')
    const licenseOptionTexts = Array.from(
      document.querySelectorAll('.stars-select__option'),
    ).map((el) => el.textContent?.trim())
    expect(licenseOptionTexts).toContain('MIT（5）')
    wrapper.unmount()
  })

  it('re-emits update:license when a license option is picked', async () => {
    const wrapper = mount(StarsFilters, {
      attachTo: document.body,
      props: { licenseOptions: [{ name: 'MIT', count: 5 }] },
    })
    const triggers = wrapper.findAll('.stars-select__trigger')
    await triggers[0]?.trigger('click')
    await clickOptionByText('MIT（5）')
    expect(wrapper.emitted('update:license')).toEqual([['MIT']])
    wrapper.unmount()
  })

  it('re-emits update:type/update:sort when their options are picked', async () => {
    const wrapper = mount(StarsFilters, { attachTo: document.body })
    const triggers = wrapper.findAll('.stars-select__trigger')

    await triggers[2]?.trigger('click')
    await clickOptionByText('Forks')
    expect(wrapper.emitted('update:type')).toBeTruthy()

    await triggers[3]?.trigger('click')
    await clickOptionByText('Most stars')
    expect(wrapper.emitted('update:sort')).toBeTruthy()
    wrapper.unmount()
  })

  it('reflects the current type/sort/license/starredYear values in each trigger label', () => {
    const wrapper = mount(StarsFilters, {
      attachTo: document.body,
      props: {
        type: 'forks',
        sort: 'most_stars',
        license: 'MIT',
        starredYear: '2026',
        licenseOptions: [{ name: 'MIT', count: 5 }],
        yearOptions: [{ year: '2026', count: 2 }],
      },
    })
    const triggerTexts = wrapper
      .findAll('.stars-select__trigger .stars-select__value')
      .map((el) => el.text())
    expect(triggerTexts).toEqual([
      'MIT（5）',
      '2026（2）',
      'Forks',
      'Most stars',
    ])
    wrapper.unmount()
  })
})
