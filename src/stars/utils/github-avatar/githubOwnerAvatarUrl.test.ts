import { describe, expect, it } from 'bun:test'
import { githubOwnerAvatarUrl } from './githubOwnerAvatarUrl'

describe('githubOwnerAvatarUrl', () => {
  it('returns an empty string for a falsy or blank owner', () => {
    expect(githubOwnerAvatarUrl('')).toBe('')
    expect(githubOwnerAvatarUrl('   ')).toBe('')
  })

  it('builds a CDN URL with the default size', () => {
    expect(githubOwnerAvatarUrl('thoroc')).toBe(
      'https://avatars.githubusercontent.com/thoroc?s=80&v=4',
    )
  })

  it('trims the owner and URL-encodes it', () => {
    expect(githubOwnerAvatarUrl('  my org  ')).toBe(
      'https://avatars.githubusercontent.com/my%20org?s=80&v=4',
    )
  })

  it('clamps size to [16, 512]', () => {
    expect(githubOwnerAvatarUrl('thoroc', 4)).toContain('s=16')
    expect(githubOwnerAvatarUrl('thoroc', 9999)).toContain('s=512')
  })

  it('falls back to 80 for a non-numeric size', () => {
    expect(githubOwnerAvatarUrl('thoroc', Number.NaN)).toContain('s=80')
  })
})
