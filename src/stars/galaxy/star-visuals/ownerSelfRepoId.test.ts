import { describe, expect, it } from 'bun:test'
import { ownerSelfRepoId } from './ownerSelfRepoId'

describe('ownerSelfRepoId', () => {
  it('builds an id when repo name matches the owner', () => {
    expect(ownerSelfRepoId('Torvalds', 'torvalds')).toBe('torvalds-torvalds')
  })

  it('defaults the repo name to the owner', () => {
    expect(ownerSelfRepoId('torvalds')).toBe('torvalds-torvalds')
  })

  it('returns empty when the repo name differs from the owner', () => {
    expect(ownerSelfRepoId('torvalds', 'linux')).toBe('')
  })

  it('returns empty for a missing owner', () => {
    expect(ownerSelfRepoId('')).toBe('')
  })
})
