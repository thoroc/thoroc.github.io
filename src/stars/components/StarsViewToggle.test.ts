import { describe, expect, test } from 'bun:test'
import { mount } from '@vue/test-utils'
import StarsViewToggle from './StarsViewToggle.vue'

describe('StarsViewToggle', () => {
  test('renders both view-mode buttons', () => {
    const wrapper = mount(StarsViewToggle)
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(2)
  })
})
