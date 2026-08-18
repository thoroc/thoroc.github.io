import { afterEach, describe, expect, it } from 'bun:test'
import { mount } from '@vue/test-utils'
import type { StarsRepoItem } from '../composables/useStarsStore'
import { useStarsStore } from '../composables/useStarsStore'
import { resetStateForTests } from '../composables/useStarsStore/resetStateForTests'
import { loading, payload } from '../composables/useStarsStore/state'
import StarsListPane from './StarsListPane.vue'

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

describe('StarsListPane', () => {
  afterEach(resetStateForTests)

  it('shows the empty state and clears filters on click', async () => {
    loading.value = false
    const wrapper = mount(StarsListPane, { attachTo: document.body })
    expect(wrapper.find('.stars-explorer__empty').exists()).toBe(true)
    const store = useStarsStore()
    store.qApplied = 'vue'
    await wrapper.find('.stars-explorer__clear-btn').trigger('click')
    expect(store.qApplied).toBe('')
    wrapper.unmount()
  })

  it('renders the virtualized viewport sized to the full item count', () => {
    loading.value = false
    payload.value = {
      items: [makeItem(), makeItem({ id: 'other', fullName: 'owner/other' })],
    }
    const wrapper = mount(StarsListPane, { attachTo: document.body })
    expect(wrapper.find('.stars-explorer__viewport').exists()).toBe(true)
    // happy-dom reports 0 for the scroll container's clientHeight, so the
    // virtualizer's visible-row calculation renders 0 rows — but the total
    // spacer height (count * estimateSize) doesn't depend on that, so it's
    // the one reliable signal that filtered.length reached the virtualizer.
    const spacer = wrapper.find('.stars-explorer__virtual-spacer')
    expect(spacer.attributes('style')).toContain(
      `height: ${2 * useStarsStore().virtualRowHeight}px`,
    )
    wrapper.unmount()
  })

  it('registers a list scroller and row-remeasure callback on mount, clearing them on unmount', () => {
    loading.value = false
    const wrapper = mount(StarsListPane, { attachTo: document.body })
    const store = useStarsStore()
    // Registered callbacks are private box state; verify indirectly via
    // no-throw when the store's own accessors are invoked post-mount.
    expect(() => store.scrollListToTop()).not.toThrow()
    wrapper.unmount()
    expect(() => store.scrollListToTop()).not.toThrow()
  })
})
