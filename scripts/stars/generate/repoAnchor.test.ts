import { describe, expect, it } from 'bun:test'
import { repoAnchor } from './repoAnchor'

describe('repoAnchor', () => {
  it('lowercases and replaces slashes with dashes', () => {
    expect(repoAnchor('Owner/Repo-Name')).toBe('owner-repo-name')
  })

  it('replaces every slash in a nested-looking name', () => {
    expect(repoAnchor('a/b/c')).toBe('a-b-c')
  })
})
