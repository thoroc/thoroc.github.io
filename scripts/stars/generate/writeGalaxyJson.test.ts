import { describe, expect, it, mock } from 'bun:test'
import { writeGalaxyJson } from './writeGalaxyJson'

describe('writeGalaxyJson', () => {
  it('writes the galaxy layout as JSON', () => {
    const mkdirSync = mock(() => undefined)
    const writeFileSync = mock((_path: string, _data: string) => undefined)
    writeGalaxyJson(
      { version: 3, anchorId: null, positions: [] },
      { mkdirSync, writeFileSync },
    )
    expect(mkdirSync).toHaveBeenCalledTimes(1)
    expect(writeFileSync).toHaveBeenCalledTimes(1)
    const [, payload] = writeFileSync.mock.calls[0] as [string, string]
    expect(JSON.parse(payload)).toEqual({
      version: 3,
      anchorId: null,
      positions: [],
    })
  })

  it('does nothing when galaxy is null', () => {
    const mkdirSync = mock(() => undefined)
    const writeFileSync = mock(() => undefined)
    writeGalaxyJson(null, { mkdirSync, writeFileSync })
    expect(mkdirSync).not.toHaveBeenCalled()
    expect(writeFileSync).not.toHaveBeenCalled()
  })
})
