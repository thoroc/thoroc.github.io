import { afterEach, describe, expect, it } from 'bun:test'
import { mount } from '@vue/test-utils'
import type { StarsRepoItem } from '../composables/useStarsStore'
import StarsGalaxyDetail from './StarsGalaxyDetail.vue'

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

describe('StarsGalaxyDetail', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders a StarCard for the given item', () => {
    const wrapper = mount(StarsGalaxyDetail, { props: { item: makeItem() } })
    expect(wrapper.text()).toContain('owner/repo')
  })

  it('emits close and locate from their respective buttons', async () => {
    const wrapper = mount(StarsGalaxyDetail, { props: { item: makeItem() } })
    await wrapper.find('.stars-galaxy-detail__locate').trigger('click')
    await wrapper.find('.stars-galaxy-detail__close').trigger('click')
    expect(wrapper.emitted('locate')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('toggles detailExpanded when the toggle button is clicked', async () => {
    const wrapper = mount(StarsGalaxyDetail, { props: { item: makeItem() } })
    const toggle = wrapper.find('.stars-galaxy-detail__toggle')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
  })

  it('resets detailExpanded when the item prop changes', async () => {
    const wrapper = mount(StarsGalaxyDetail, { props: { item: makeItem() } })
    await wrapper.find('.stars-galaxy-detail__toggle').trigger('click')
    expect(
      wrapper.find('.stars-galaxy-detail__toggle').attributes('aria-expanded'),
    ).toBe('true')
    await wrapper.setProps({
      item: makeItem({ id: 'other-repo', fullName: 'other/repo' }),
    })
    expect(
      wrapper.find('.stars-galaxy-detail__toggle').attributes('aria-expanded'),
    ).toBe('false')
  })

  it('closes on Escape and emits locate on "l", but ignores keys while typing', async () => {
    const wrapper = mount(StarsGalaxyDetail, {
      props: { item: makeItem() },
      attachTo: document.body,
    })

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'l' }))
    expect(wrapper.emitted('locate')).toBeFalsy()
    input.remove()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'l' }))
    expect(wrapper.emitted('locate')).toBeTruthy()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('close')).toBeTruthy()

    wrapper.unmount()
  })

  it('applies the mobile modifier class when isMobile is true', () => {
    const wrapper = mount(StarsGalaxyDetail, {
      props: { item: makeItem(), isMobile: true },
    })
    expect(wrapper.find('.stars-galaxy-detail--mobile').exists()).toBe(true)
  })
})
