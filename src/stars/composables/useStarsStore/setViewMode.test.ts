import { afterEach, describe, expect, it } from 'bun:test'
import { resetStateForTests } from './resetStateForTests'
import { setViewMode } from './setViewMode'
import { galaxySelected, viewMode } from './state'

describe('setViewMode', () => {
  afterEach(() => {
    resetStateForTests()
    delete (globalThis as { fetch?: typeof fetch }).fetch
  })

  it('switches to galaxy mode and triggers layout loading', () => {
    window.history.replaceState({}, '', '/')
    globalThis.fetch = (async () =>
      new Response('', { status: 404 })) as unknown as typeof fetch
    setViewMode('galaxy')
    expect(viewMode.value).toBe('galaxy')
  })

  it('switches to list mode and clears the galaxy selection', () => {
    window.history.replaceState({}, '', '/')
    galaxySelected.value = {
      fullName: 'a/b',
      language: null,
      license: null,
      fork: false,
      stars: 1,
      starredAt: '',
      pushedAt: '',
    }
    setViewMode('list')
    expect(viewMode.value).toBe('list')
    expect(galaxySelected.value).toBeNull()
  })

  it('defaults an unrecognized mode to "list"', () => {
    window.history.replaceState({}, '', '/')
    setViewMode('unknown')
    expect(viewMode.value).toBe('list')
  })
})
