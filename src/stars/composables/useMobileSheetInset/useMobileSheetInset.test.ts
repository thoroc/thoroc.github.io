import { afterEach, describe, expect, it } from 'bun:test'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { MOBILE_SHEET_TOP_VAR } from './constants'
import type { OpenSource } from './types'
import { useMobileSheetInset } from './useMobileSheetInset'

const waitFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))

/** The composable's watch runs on Vue's post-flush microtask, then schedules
 * its own rAF from inside that callback — waiting on both, in order, is
 * required to observe the resulting DOM mutation. */
const waitForPostFlushRaf = async () => {
  await nextTick()
  await waitFrame()
}

const makeHost = (openSource: OpenSource) =>
  defineComponent({
    setup() {
      useMobileSheetInset(openSource)
      return () => h('div')
    },
  })

const readTopVar = () =>
  document.documentElement.style.getPropertyValue(MOBILE_SHEET_TOP_VAR)

describe('useMobileSheetInset', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty(MOBILE_SHEET_TOP_VAR)
  })

  it('does nothing while it stays closed', async () => {
    const open = ref(false)
    mount(makeHost(open))
    await waitFrame()
    expect(readTopVar()).toBe('')
  })

  it('sets the top inset var to the fallback when opened with no chrome elements', async () => {
    const open = ref(false)
    mount(makeHost(open))
    open.value = true
    await waitForPostFlushRaf()
    expect(readTopVar()).toBe('112px')
  })

  it('sets the top inset var from the tallest chrome element plus the gap', async () => {
    const el = document.createElement('div')
    el.className = 'stars-mobile-toolbar'
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ bottom: 50, height: 20 }),
    })
    document.body.appendChild(el)

    const open = ref(false)
    mount(makeHost(open))
    open.value = true
    await waitForPostFlushRaf()
    expect(readTopVar()).toBe('58px')

    document.body.removeChild(el)
  })

  it('clears the inset var when toggled back closed', async () => {
    const open = ref(false)
    mount(makeHost(open))
    open.value = true
    await waitForPostFlushRaf()
    expect(readTopVar()).not.toBe('')

    open.value = false
    await waitForPostFlushRaf()
    expect(readTopVar()).toBe('')
  })

  it('re-measures on window resize while open', async () => {
    const open = ref(false)
    mount(makeHost(open))
    open.value = true
    await waitForPostFlushRaf()
    document.documentElement.style.removeProperty(MOBILE_SHEET_TOP_VAR)

    window.dispatchEvent(new Event('resize'))
    expect(readTopVar()).toBe('112px')
  })

  it('clears the inset var and unbinds listeners on unmount', async () => {
    const open = ref(false)
    const wrapper = mount(makeHost(open))
    open.value = true
    await waitForPostFlushRaf()
    expect(readTopVar()).not.toBe('')

    wrapper.unmount()
    expect(readTopVar()).toBe('')
  })

  it('supports a function-form openSource backed by a reactive ref', async () => {
    const flag = ref(false)
    mount(makeHost(() => flag.value))
    flag.value = true
    await waitForPostFlushRaf()
    expect(readTopVar()).not.toBe('')
  })

  it('skips ResizeObserver setup when it is unavailable', async () => {
    const original = globalThis.ResizeObserver
    // @ts-expect-error -- simulating an environment without ResizeObserver
    globalThis.ResizeObserver = undefined

    const open = ref(false)
    mount(makeHost(open))
    open.value = true
    await waitForPostFlushRaf()
    expect(readTopVar()).not.toBe('')

    globalThis.ResizeObserver = original
  })
})
