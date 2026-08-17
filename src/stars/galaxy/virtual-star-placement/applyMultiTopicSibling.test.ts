import { describe, expect, it } from 'bun:test'
import { applyMultiTopicSibling } from './applyMultiTopicSibling'

describe('applyMultiTopicSibling', () => {
  it('does nothing when there is only one topic or no topic', () => {
    const positions = new Float32Array([1, 2, 3])
    applyMultiTopicSibling(
      { virtualKey: 'a', repoId: 'a', topic: 'cli' },
      [0, 0, 0],
      0,
      1,
      positions,
      0,
      1,
    )
    expect(positions).toEqual(new Float32Array([1, 2, 3]))

    applyMultiTopicSibling(
      { virtualKey: 'a', repoId: 'a' },
      [0, 0, 0],
      0,
      2,
      positions,
      0,
      1,
    )
    expect(positions).toEqual(new Float32Array([1, 2, 3]))
  })

  it('offsets the position when there are multiple topics for the repo', () => {
    const positions = new Float32Array([1, 2, 3])
    applyMultiTopicSibling(
      { virtualKey: 'a', repoId: 'a', topic: 'cli' },
      [0, 0, 0],
      0,
      2,
      positions,
      0,
      1,
    )
    expect(positions).not.toEqual(new Float32Array([1, 2, 3]))
  })
})
