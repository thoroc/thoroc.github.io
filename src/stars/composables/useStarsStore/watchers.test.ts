import { afterEach, describe, expect, it } from 'bun:test'
import { nextTick } from 'vue'
import { resetStateForTests } from './resetStateForTests'
import {
  language,
  qApplied,
  qInput,
  searchConfig,
  starredYear,
  type,
} from './state'
// Side-effect import: registers the watchers under test.
import './watchers'

const waitMs = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('store watchers', () => {
  afterEach(resetStateForTests)

  it('debounces qInput changes into qApplied', async () => {
    window.history.replaceState({}, '', '/')
    searchConfig.debounceMs = 5
    qInput.value = 'vue'
    await nextTick()
    await waitMs(20)
    expect(qApplied.value).toBe('vue')
  })

  it('syncs the URL when type/sort/license/starredYear change', async () => {
    window.history.replaceState({}, '', '/')
    starredYear.value = '2026'
    await nextTick()
    expect(new URLSearchParams(window.location.search).get('stars-year')).toBe(
      '2026',
    )
  })

  it('syncs the URL when language changes', async () => {
    window.history.replaceState({}, '', '/')
    language.value = 'Rust'
    await nextTick()
    expect(new URLSearchParams(window.location.search).get('stars-lang')).toBe(
      'Rust',
    )
  })

  it('persists filter state to sessionStorage on a tracked change', async () => {
    window.history.replaceState({}, '', '/')
    type.value = 'sources'
    await nextTick()
    const saved = sessionStorage.getItem('stars-filters')
    expect(saved).not.toBeNull()
    expect(JSON.parse(saved as string).type).toBe('sources')
  })
})
