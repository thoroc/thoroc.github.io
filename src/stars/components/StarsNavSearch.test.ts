import { afterEach, describe, expect, it } from 'bun:test'
import { mount } from '@vue/test-utils'
import { resetStateForTests } from '../composables/useStarsStore/resetStateForTests'
import { qApplied, qInput } from '../composables/useStarsStore/state'
import StarsNavSearch from './StarsNavSearch.vue'

describe('StarsNavSearch', () => {
  afterEach(resetStateForTests)

  it('reflects store.qInput as the input value', () => {
    qInput.value = 'vue'
    const wrapper = mount(StarsNavSearch)
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe(
      'vue',
    )
  })

  it('updates store.qInput on input', async () => {
    const wrapper = mount(StarsNavSearch)
    const input = wrapper.find('input')
    await input.setValue('astro')
    expect(qInput.value).toBe('astro')
  })

  it('triggers the search on Enter', async () => {
    window.history.replaceState({}, '', '/')
    const wrapper = mount(StarsNavSearch)
    const input = wrapper.find('input')
    await input.setValue('vue')
    await input.trigger('keydown', { key: 'Enter' })
    expect(qApplied.value).toBe('vue')
  })

  it('does not trigger the search on other keys', async () => {
    window.history.replaceState({}, '', '/')
    const wrapper = mount(StarsNavSearch)
    const input = wrapper.find('input')
    await input.setValue('vue')
    await input.trigger('keydown', { key: 'a' })
    expect(qApplied.value).toBe('')
  })
})
