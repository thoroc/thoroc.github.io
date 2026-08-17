import { afterEach, describe, expect, it } from 'bun:test'
import { resetStateForTests } from './resetStateForTests'
import { galaxyAreaExpanded } from './state'
import { toggleGalaxyAreaExpanded } from './toggleGalaxyAreaExpanded'

describe('toggleGalaxyAreaExpanded', () => {
  afterEach(resetStateForTests)

  it('flips the expanded flag', () => {
    window.history.replaceState({}, '', '/')
    galaxyAreaExpanded.value = false
    toggleGalaxyAreaExpanded()
    expect(galaxyAreaExpanded.value).toBe(true)
    toggleGalaxyAreaExpanded()
    expect(galaxyAreaExpanded.value).toBe(false)
  })
})
