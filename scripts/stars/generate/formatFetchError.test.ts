import { describe, expect, it } from 'bun:test'
import { formatFetchError } from './formatFetchError'

describe('formatFetchError', () => {
  it('uses the body message when present', () => {
    expect(formatFetchError(500, { message: 'boom' })).toBe('boom')
  })

  it('falls back to an HTTP status message when no body message', () => {
    expect(formatFetchError(404, null)).toBe('HTTP 404')
  })

  it('appends a rate-limit hint for a 403 rate-limit message', () => {
    const result = formatFetchError(403, { message: 'API rate limit exceeded' })
    expect(result).toContain('API rate limit exceeded')
    expect(result).toContain('GITHUB_TOKEN')
  })

  it('does not append the rate-limit hint for a non-rate-limit 403', () => {
    const result = formatFetchError(403, { message: 'Forbidden' })
    expect(result).toBe('Forbidden')
  })
})
