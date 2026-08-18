import { describe, expect, it } from 'bun:test'
import { sortStatsBucketsDesc } from './sortStatsBucketsDesc'

describe('sortStatsBucketsDesc', () => {
  it('sorts by count descending', () => {
    expect(
      sortStatsBucketsDesc([
        ['a', 1],
        ['b', 3],
      ]),
    ).toEqual([
      { name: 'b', count: 3 },
      { name: 'a', count: 1 },
    ])
  })

  it('breaks ties by name ascending', () => {
    expect(
      sortStatsBucketsDesc([
        ['b', 1],
        ['a', 1],
      ]),
    ).toEqual([
      { name: 'a', count: 1 },
      { name: 'b', count: 1 },
    ])
  })
})
