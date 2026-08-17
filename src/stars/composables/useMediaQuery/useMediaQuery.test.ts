import { describe, expect, it } from 'bun:test'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { useMediaQuery } from './useMediaQuery'

const makeHost = (query: string) =>
  defineComponent({
    setup() {
      const matches = useMediaQuery(query)
      return () => h('div', String(matches.value))
    },
  })

describe('useMediaQuery', () => {
  it('reflects the initial match state after mount', () => {
    const wrapper = mount(makeHost('(max-width: 768px)'))
    expect(['true', 'false']).toContain(wrapper.text())
  })

  it('updates reactively when the media query change event fires', async () => {
    const query = '(max-width: 768px)'
    const fakeMql = Object.assign(new EventTarget(), {
      matches: false,
      media: query,
    }) as unknown as MediaQueryList
    const original = window.matchMedia
    window.matchMedia = (() => fakeMql) as typeof window.matchMedia

    const wrapper = mount(makeHost(query))
    ;(fakeMql as unknown as { matches: boolean }).matches = true
    fakeMql.dispatchEvent(new Event('change'))
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toBe('true')

    window.matchMedia = original
  })

  it('removes the change listener on unmount without throwing', () => {
    const wrapper = mount(makeHost('(max-width: 768px)'))
    expect(() => wrapper.unmount()).not.toThrow()
  })
})
