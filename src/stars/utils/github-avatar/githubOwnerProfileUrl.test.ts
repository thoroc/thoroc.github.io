import { describe, expect, it } from 'bun:test'
import { githubOwnerProfileUrl } from './githubOwnerProfileUrl'

describe('githubOwnerProfileUrl', () => {
  it('returns an empty string for a falsy or blank owner', () => {
    expect(githubOwnerProfileUrl('')).toBe('')
    expect(githubOwnerProfileUrl('   ')).toBe('')
  })

  it('builds a github.com profile URL, trimmed and encoded', () => {
    expect(githubOwnerProfileUrl('  thoroc  ')).toBe(
      'https://github.com/thoroc',
    )
    expect(githubOwnerProfileUrl('my org')).toBe('https://github.com/my%20org')
  })
})
