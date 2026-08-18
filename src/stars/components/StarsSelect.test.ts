import { afterEach, describe, expect, it } from 'bun:test'
import { mount } from '@vue/test-utils'
import StarsSelect from './StarsSelect.vue'

const OPTIONS = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
]

describe('StarsSelect', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows the label of the currently selected option', () => {
    const wrapper = mount(StarsSelect, {
      props: { modelValue: 'b', options: OPTIONS },
      attachTo: document.body,
    })
    expect(wrapper.find('.stars-select__value').text()).toBe('Option B')
    wrapper.unmount()
  })

  it('falls back to the raw value when no option matches', () => {
    const wrapper = mount(StarsSelect, {
      props: { modelValue: 'unknown', options: OPTIONS },
      attachTo: document.body,
    })
    expect(wrapper.find('.stars-select__value').text()).toBe('unknown')
    wrapper.unmount()
  })

  it('opens the option panel on trigger click and closes on option pick', async () => {
    const wrapper = mount(StarsSelect, {
      props: { modelValue: 'a', options: OPTIONS },
      attachTo: document.body,
    })
    await wrapper.find('.stars-select__trigger').trigger('click')
    expect(wrapper.attributes('class')).toContain('is-open')

    const optionEls = document.querySelectorAll('.stars-select__option')
    expect(optionEls.length).toBe(2)
    ;(optionEls[1] as HTMLElement).dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    )
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
    wrapper.unmount()
  })

  it('closes when Escape is pressed', async () => {
    const wrapper = mount(StarsSelect, {
      props: { modelValue: 'a', options: OPTIONS },
      attachTo: document.body,
    })
    await wrapper.find('.stars-select__trigger').trigger('click')
    expect(wrapper.attributes('class')).toContain('is-open')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.attributes('class')).not.toContain('is-open')
    wrapper.unmount()
  })

  it('closes when clicking outside the trigger/panel', async () => {
    const wrapper = mount(StarsSelect, {
      props: { modelValue: 'a', options: OPTIONS },
      attachTo: document.body,
    })
    await wrapper.find('.stars-select__trigger').trigger('click')
    expect(wrapper.attributes('class')).toContain('is-open')
    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    )
    await wrapper.vm.$nextTick()
    expect(wrapper.attributes('class')).not.toContain('is-open')
    wrapper.unmount()
  })
})
