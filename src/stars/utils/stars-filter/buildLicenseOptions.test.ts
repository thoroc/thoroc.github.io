import { describe, expect, it } from 'bun:test'
import { buildLicenseOptions } from './buildLicenseOptions'

describe('buildLicenseOptions', () => {
  it('excludes items with a falsy license', () => {
    const result = buildLicenseOptions([
      { license: 'MIT' },
      { license: null },
      { license: '' },
    ])
    expect(result).toEqual([{ name: 'MIT', count: 1 }])
  })
})
