import { describe, expect, it } from 'bun:test'
import { currentPathname } from './currentPathname'

describe('currentPathname', () => {
  it('returns the current window pathname', () => {
    window.history.replaceState({}, '', '/some/path')
    expect(currentPathname()).toBe('/some/path')
    window.history.replaceState({}, '', '/')
  })

  it('defaults to "/" for an empty pathname', () => {
    expect(currentPathname()).toBe('/')
  })
})
