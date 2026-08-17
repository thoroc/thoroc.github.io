import { afterEach, describe, expect, it } from 'bun:test'
import { resetStateForTests } from './resetStateForTests'
import { selectGalaxyItem } from './selectGalaxyItem'
import { galaxyFocus, galaxySelected } from './state'
import type { StarsRepoItem } from './types'

const makeItem = (id: string): StarsRepoItem => ({
  id,
  fullName: `owner/${id}`,
  language: 'Rust',
  license: 'MIT',
  fork: false,
  stars: 1,
  starredAt: '2026-01-01',
  pushedAt: '2026-01-01',
})

describe('selectGalaxyItem', () => {
  afterEach(resetStateForTests)

  it('selects the item and focuses its id', () => {
    window.history.replaceState({}, '', '/')
    const item = makeItem('a')
    selectGalaxyItem(item)
    expect(galaxySelected.value).toEqual(item)
    expect(galaxyFocus.value).toBe('a')
  })

  it('does nothing for an item without an id', () => {
    window.history.replaceState({}, '', '/')
    selectGalaxyItem({ ...makeItem('a'), id: undefined })
    expect(galaxySelected.value).toBeNull()
  })

  it('does nothing for a null/undefined item', () => {
    window.history.replaceState({}, '', '/')
    selectGalaxyItem(null)
    expect(galaxySelected.value).toBeNull()
  })
})
