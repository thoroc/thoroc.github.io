import { afterEach, describe, expect, it } from 'bun:test'
import { resetStateForTests } from './resetStateForTests'
import { useStarsStore } from './useStarsStore'

describe('useStarsStore', () => {
  afterEach(resetStateForTests)

  it('exposes reactive filter/view state and the expected methods', () => {
    const store = useStarsStore()
    expect(store.language).toBe('all')
    expect(store.viewMode).toBe('list')
    expect(typeof store.setViewMode).toBe('function')
    expect(typeof store.bootstrap).toBe('function')
    expect(typeof store.isDescExpanded).toBe('function')
  })

  it('exposes computed-backed getters reflecting the current payload', () => {
    const store = useStarsStore()
    expect(store.items).toEqual([])
    expect(store.total).toBe(0)
    expect(store.repoName).toBe('stars')
    expect(store.hasActiveFilters).toBe(false)
  })

  /**
   * Singleton-identity test (mandated by the Phase 3 exit criterion):
   * useStarsStore() must return a view over module-scope singleton state,
   * not fresh per-call state — a regression here would be invisible to
   * typecheck alone. Import the barrel twice (well, call it twice — the
   * module itself is only ever evaluated once by the JS module cache) and
   * confirm a mutation through one call site is observable through another.
   */
  it('shares singleton reactive state across separate useStarsStore() calls', () => {
    const storeA = useStarsStore()
    const storeB = useStarsStore()

    storeA.language = 'Rust'
    expect(storeB.language).toBe('Rust')

    storeB.qInput = 'vue'
    expect(storeA.qInput).toBe('vue')

    storeA.setUiLocale('en')
    expect(storeB.uiLocale).toBe('en')
  })

  it('shares singleton state with a fresh import of the barrel', async () => {
    const storeA = useStarsStore()
    storeA.language = 'Python'

    const { useStarsStore: useStarsStoreAgain } = await import('./index')
    const storeB = useStarsStoreAgain()
    expect(storeB.language).toBe('Python')
  })
})
