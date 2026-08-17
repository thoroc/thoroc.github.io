import { describe, expect, it } from 'bun:test'
import { githubRepoUrl } from './githubRepoUrl'

describe('githubRepoUrl', () => {
  it('returns an empty string for a falsy or blank fullName', () => {
    expect(githubRepoUrl('')).toBe('')
    expect(githubRepoUrl('   ')).toBe('')
  })

  it('builds a github.com repo URL, trimmed', () => {
    expect(githubRepoUrl('  thoroc/thoroc.github.io  ')).toBe(
      'https://github.com/thoroc/thoroc.github.io',
    )
  })
})
