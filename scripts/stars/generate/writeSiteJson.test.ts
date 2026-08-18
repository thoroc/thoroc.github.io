import { describe, expect, it, mock } from 'bun:test'
import { writeSiteJson } from './writeSiteJson'

describe('writeSiteJson', () => {
  it('writes the site metadata as pretty-printed JSON', () => {
    const mkdirSync = mock(() => undefined)
    const writeFileSync = mock((_path: string, _data: string) => undefined)
    writeSiteJson('2026-01-02T00:00:00Z', { mkdirSync, writeFileSync })
    expect(mkdirSync).toHaveBeenCalledTimes(1)
    const [, payload] = writeFileSync.mock.calls[0] as [string, string]
    expect(JSON.parse(payload)).toEqual({
      owner: 'thoroc',
      title: 'Stars',
      generatedAt: '2026-01-02T00:00:00Z',
    })
  })
})
