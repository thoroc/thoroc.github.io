import { afterEach, describe, expect, it } from 'bun:test'
import { closeGalaxyDetail } from './closeGalaxyDetail'
import { resetStateForTests } from './resetStateForTests'
import { galaxyFocus, galaxySelected } from './state'
import type { StarsRepoItem } from './types'

describe('closeGalaxyDetail', () => {
  afterEach(resetStateForTests)

  it('clears the selection and focus', () => {
    window.history.replaceState({}, '', '/')
    galaxySelected.value = { fullName: 'a/b' } as StarsRepoItem
    galaxyFocus.value = 'a'
    closeGalaxyDetail()
    expect(galaxySelected.value).toBeNull()
    expect(galaxyFocus.value).toBe('')
  })
})
