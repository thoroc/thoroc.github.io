import { describe, expect, it } from 'bun:test'
import { normalizeLicense } from './normalizeLicense'
import type { RawGithubRepo } from './types'

const repo = (overrides: Partial<RawGithubRepo> = {}): RawGithubRepo => ({
  full_name: 'owner/repo',
  ...overrides,
})

describe('normalizeLicense', () => {
  it('returns nulls when the repo has no license', () => {
    expect(normalizeLicense(repo())).toEqual({
      license: null,
      licenseUrl: null,
    })
  })

  it('prefers a valid SPDX id as the label', () => {
    const result = normalizeLicense(
      repo({ license: { spdx_id: 'MIT', name: 'MIT License' } }),
    )
    expect(result.license).toBe('MIT')
  })

  it('ignores NOASSERTION and falls back to name, then key', () => {
    expect(
      normalizeLicense(
        repo({ license: { spdx_id: 'NOASSERTION', name: 'Custom' } }),
      ).license,
    ).toBe('Custom')
    expect(
      normalizeLicense(
        repo({ license: { spdx_id: 'NOASSERTION', key: 'other' } }),
      ).license,
    ).toBe('other')
  })

  it('returns nulls when no usable label can be derived', () => {
    expect(
      normalizeLicense(repo({ license: { spdx_id: 'NOASSERTION' } })),
    ).toEqual({
      license: null,
      licenseUrl: null,
    })
  })

  it('prefers html_url, then url, then a derived GitHub LICENSE link', () => {
    expect(
      normalizeLicense(
        repo({ license: { name: 'MIT', html_url: 'https://html' } }),
      ).licenseUrl,
    ).toBe('https://html')
    expect(
      normalizeLicense(repo({ license: { name: 'MIT', url: 'https://api' } }))
        .licenseUrl,
    ).toBe('https://api')
    expect(
      normalizeLicense(repo({ license: { name: 'MIT' } })).licenseUrl,
    ).toBe('https://github.com/owner/repo/blob/HEAD/LICENSE')
  })

  it('returns a null licenseUrl when full_name is missing and no url is set', () => {
    expect(
      normalizeLicense({ full_name: '', license: { name: 'MIT' } }).licenseUrl,
    ).toBeNull()
  })
})
