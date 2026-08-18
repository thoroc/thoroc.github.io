import { afterEach, describe, expect, it } from 'bun:test'
import { mount } from '@vue/test-utils'
import StarsMobileFiltersSheet from './StarsMobileFiltersSheet.vue'

describe('StarsMobileFiltersSheet', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('is hidden when closed', () => {
    const wrapper = mount(StarsMobileFiltersSheet, {
      props: { open: false },
      attachTo: document.body,
    })
    const sheet = document.querySelector('.stars-mobile-sheet') as HTMLElement
    expect(sheet.style.display).toBe('none')
    wrapper.unmount()
  })

  it('is visible when open and locks body scroll', async () => {
    // The open→body-overflow sync is a watch(), not immediate — it only
    // fires on a change, matching the original source's exact behavior.
    const wrapper = mount(StarsMobileFiltersSheet, {
      props: { open: false },
      attachTo: document.body,
    })
    await wrapper.setProps({ open: true })
    const sheet = document.querySelector('.stars-mobile-sheet') as HTMLElement
    expect(sheet.style.display).not.toBe('none')
    expect(document.body.style.overflow).toBe('hidden')
    wrapper.unmount()
  })

  it('emits close when the backdrop is clicked', async () => {
    const wrapper = mount(StarsMobileFiltersSheet, {
      props: { open: true },
      attachTo: document.body,
    })
    document
      .querySelector('.stars-mobile-sheet__backdrop')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('close')).toBeTruthy()
    wrapper.unmount()
  })

  it('emits close when the close button is clicked', async () => {
    const wrapper = mount(StarsMobileFiltersSheet, {
      props: { open: true },
      attachTo: document.body,
    })
    document
      .querySelector('.stars-mobile-sheet__close')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('close')).toBeTruthy()
    wrapper.unmount()
  })

  it('emits close on Escape only while open', async () => {
    const wrapper = mount(StarsMobileFiltersSheet, {
      props: { open: false },
      attachTo: document.body,
    })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('close')).toBeFalsy()

    await wrapper.setProps({ open: true })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('close')).toBeTruthy()
    wrapper.unmount()
  })

  it('resets body overflow on unmount', async () => {
    const wrapper = mount(StarsMobileFiltersSheet, {
      props: { open: false },
      attachTo: document.body,
    })
    await wrapper.setProps({ open: true })
    expect(document.body.style.overflow).toBe('hidden')
    wrapper.unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
