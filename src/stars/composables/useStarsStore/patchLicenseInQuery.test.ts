import { afterEach, describe, expect, it } from 'bun:test'
import { patchLicenseInQuery } from './patchLicenseInQuery'
import { resetStateForTests } from './resetStateForTests'
import { license } from './state'

describe('patchLicenseInQuery', () => {
  afterEach(resetStateForTests)

  it('sets a given license value', () => {
    window.history.replaceState({}, '', '/')
    patchLicenseInQuery('MIT')
    expect(license.value).toBe('MIT')
  })

  it('normalizes a falsy or "all" value to "all"', () => {
    window.history.replaceState({}, '', '/')
    patchLicenseInQuery(undefined)
    expect(license.value).toBe('all')
  })
})
