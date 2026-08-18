import { afterEach, describe, expect, test } from 'bun:test'
import { mount } from '@vue/test-utils'
import { useStarsStore } from '../composables/useStarsStore'
import { resetStateForTests } from '../composables/useStarsStore/resetStateForTests'
import StarsViewToggle from './StarsViewToggle.vue'

describe('StarsViewToggle', () => {
  afterEach(resetStateForTests)

  test('renders both view-mode buttons', () => {
    const wrapper = mount(StarsViewToggle)
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(2)
  })

  test('marks the list button active by default', () => {
    const wrapper = mount(StarsViewToggle)
    const [listBtn] = wrapper.findAll('button')
    expect(listBtn?.attributes('aria-pressed')).toBe('true')
  })

  test('switching to list mode calls store.setViewMode', async () => {
    const store = useStarsStore()
    store.viewMode = 'galaxy'
    const wrapper = mount(StarsViewToggle)
    const [listBtn] = wrapper.findAll('button')
    await listBtn?.trigger('click')
    expect(store.viewMode).toBe('list')
  })

  test('disables the galaxy button when WebGL is unavailable (as in this test env)', () => {
    const wrapper = mount(StarsViewToggle)
    const [, galaxyBtn] = wrapper.findAll('button')
    expect(galaxyBtn?.attributes('disabled')).toBeDefined()
  })

  test('clicking the disabled galaxy button does not change the view mode', async () => {
    const store = useStarsStore()
    const wrapper = mount(StarsViewToggle)
    const [, galaxyBtn] = wrapper.findAll('button')
    await galaxyBtn?.trigger('click')
    expect(store.viewMode).toBe('list')
  })
})
