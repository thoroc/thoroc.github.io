import { describe, expect, it } from 'bun:test'
import { mount } from '@vue/test-utils'
import StarsGalaxyControls from './StarsGalaxyControls.vue'

describe('StarsGalaxyControls', () => {
  it('renders the always-present toolbar buttons', () => {
    const wrapper = mount(StarsGalaxyControls)
    const buttons = wrapper.findAll('button')
    // zoom-in, zoom-out, reset, focus-center, fullscreen, auto-rotate, legend
    expect(buttons.length).toBe(7)
  })

  it('hides focus-center/fullscreen when their show props are false', () => {
    const wrapper = mount(StarsGalaxyControls, {
      props: { showFocusCenter: false, showFullscreen: false },
    })
    expect(wrapper.findAll('button').length).toBe(5)
  })

  it('shows focus-owner when showFocusOwner is true', () => {
    const wrapper = mount(StarsGalaxyControls, {
      props: { showFocusOwner: true },
    })
    expect(wrapper.findAll('button').length).toBe(8)
  })

  it.each([
    ['zoom-in', 0],
    ['zoom-out', 1],
    ['reset', 2],
    ['focus-center', 3],
  ])('emits %s when its button is clicked', async (eventName, index) => {
    const wrapper = mount(StarsGalaxyControls)
    await wrapper.findAll('button')[index]?.trigger('click')
    expect(wrapper.emitted(eventName)).toBeTruthy()
  })

  it('emits toggle-auto-rotate and toggle-legend from the trailing buttons', async () => {
    const wrapper = mount(StarsGalaxyControls)
    const buttons = wrapper.findAll('button')
    await buttons[buttons.length - 2]?.trigger('click')
    await buttons[buttons.length - 1]?.trigger('click')
    expect(wrapper.emitted('toggle-auto-rotate')).toBeTruthy()
    expect(wrapper.emitted('toggle-legend')).toBeTruthy()
  })

  it('toggles the fullscreen button active state via isFullscreen', () => {
    const wrapper = mount(StarsGalaxyControls, {
      props: { isFullscreen: true },
    })
    const fullscreenBtn = wrapper.findAll('button')[4]
    expect(fullscreenBtn?.attributes('aria-pressed')).toBe('true')
  })
})
