import { describe, expect, it } from 'bun:test'
import { repoStarTierKey } from './repoStarTierKey'

describe('repoStarTierKey', () => {
  it('maps star counts to the correct tier', () => {
    expect(repoStarTierKey(60000)).toBe('50k+')
    expect(repoStarTierKey(15000)).toBe('10k+')
    expect(repoStarTierKey(1500)).toBe('1k+')
    expect(repoStarTierKey(5)).toBe('<1k')
    expect(repoStarTierKey(null)).toBe('<1k')
  })
})
