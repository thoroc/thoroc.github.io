import { describe, expect, it } from 'bun:test'
import { buildYearOptions } from './buildYearOptions'

describe('buildYearOptions', () => {
  it('groups by the starredAt year, sorted descending', () => {
    const result = buildYearOptions([
      { starredAt: '2024-01-01' },
      { starredAt: '2026-01-01' },
      { starredAt: '2024-06-01' },
    ])
    expect(result).toEqual([
      { year: '2026', count: 1 },
      { year: '2024', count: 2 },
    ])
  })

  it('skips items without a starredAt', () => {
    expect(buildYearOptions([{ starredAt: '' }])).toEqual([])
  })
})
