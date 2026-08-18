import { describe, expect, it, mock } from 'bun:test'
import type { RawGithubRepo } from './types'
import { writeStarsJson } from './writeStarsJson'

describe('writeStarsJson', () => {
  it('creates the data dir and writes the normalized+stats payload', () => {
    const mkdirSync = mock(() => undefined)
    const writeFileSync = mock((_path: string, _data: string) => undefined)
    const stars: RawGithubRepo[] = [
      {
        full_name: 'owner/repo',
        language: 'TypeScript',
        stargazers_count: 5,
        starred_at: '2026-01-01T00:00:00Z',
      },
    ]

    writeStarsJson(stars, '2026-01-02T00:00:00Z', { mkdirSync, writeFileSync })

    expect(mkdirSync).toHaveBeenCalledTimes(1)
    expect(writeFileSync).toHaveBeenCalledTimes(1)
    const [, payload] = writeFileSync.mock.calls[0] as [string, string]
    const parsed = JSON.parse(payload)
    expect(parsed.generatedAt).toBe('2026-01-02T00:00:00Z')
    expect(parsed.total).toBe(1)
    expect(parsed.items).toHaveLength(1)
    expect(parsed.items[0].id).toBe('owner-repo')
    expect(parsed.ui.siteName).toBe('Stars')
  })
})
