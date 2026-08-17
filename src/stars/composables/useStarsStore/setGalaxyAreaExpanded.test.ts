import { afterEach, describe, expect, it } from 'bun:test'
import { resetStateForTests } from './resetStateForTests'
import { setGalaxyAreaExpanded } from './setGalaxyAreaExpanded'
import { galaxyAreaExpanded } from './state'

describe('setGalaxyAreaExpanded', () => {
  afterEach(resetStateForTests)

  it('sets the expanded flag from a truthy value', () => {
    window.history.replaceState({}, '', '/')
    setGalaxyAreaExpanded(true)
    expect(galaxyAreaExpanded.value).toBe(true)
  })

  it('coerces a falsy value to false', () => {
    window.history.replaceState({}, '', '/')
    setGalaxyAreaExpanded(undefined)
    expect(galaxyAreaExpanded.value).toBe(false)
  })
})
