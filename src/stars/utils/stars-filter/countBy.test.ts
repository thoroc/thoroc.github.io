import { describe, expect, it } from 'bun:test'
import { countBy } from './countBy'

describe('countBy', () => {
  it('counts items by key and sorts by count desc', () => {
    const result = countBy(['a', 'b', 'a', 'a', 'b'], (x) => x)
    expect(result).toEqual([
      { name: 'a', count: 3 },
      { name: 'b', count: 2 },
    ])
  })

  it('breaks ties with localeCompare on the key', () => {
    const result = countBy(['b', 'a'], (x) => x)
    expect(result).toEqual([
      { name: 'a', count: 1 },
      { name: 'b', count: 1 },
    ])
  })

  it('returns an empty array for empty input', () => {
    expect(countBy([], (x) => x)).toEqual([])
  })
})
