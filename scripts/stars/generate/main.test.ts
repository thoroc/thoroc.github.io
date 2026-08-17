import { describe, expect, it, mock } from 'bun:test'
import { main } from './main'
import type { GenerateDeps } from './types'

const baseDeps = (overrides: Partial<GenerateDeps> = {}): GenerateDeps => ({
  fetchStars: mock(async () => [{ full_name: 'owner/repo' }]),
  computeGalaxyLayoutForItems: mock(async () => ({
    version: 3,
    anchorId: null,
    positions: [],
  })),
  writeStarsJson: mock(() => undefined),
  writeGalaxyJson: mock(() => undefined),
  writeSiteJson: mock(() => undefined),
  now: () => new Date('2026-01-02T00:00:00Z'),
  log: mock(() => undefined),
  warn: mock(() => undefined),
  error: mock(() => undefined),
  exit: mock(() => undefined),
  ...overrides,
})

describe('main', () => {
  it('fetches, computes, and writes all three data files', async () => {
    const deps = baseDeps()
    await main(deps)
    expect(deps.fetchStars).toHaveBeenCalledTimes(1)
    expect(deps.writeStarsJson).toHaveBeenCalledTimes(1)
    expect(deps.writeGalaxyJson).toHaveBeenCalledTimes(1)
    expect(deps.writeSiteJson).toHaveBeenCalledTimes(1)
    expect(deps.exit).not.toHaveBeenCalled()
  })

  it('falls back to a null galaxy layout when precompute fails, without aborting', async () => {
    const deps = baseDeps({
      computeGalaxyLayoutForItems: mock(async () => {
        throw new Error('layout boom')
      }),
    })
    await main(deps)
    expect(deps.warn).toHaveBeenCalledTimes(1)
    expect(deps.writeGalaxyJson).toHaveBeenCalledWith(null)
    expect(deps.exit).not.toHaveBeenCalled()
  })

  it('reports an error and exits non-zero when fetching fails', async () => {
    const deps = baseDeps({
      fetchStars: mock(async () => {
        throw new Error('network boom')
      }),
    })
    await main(deps)
    expect(deps.error).toHaveBeenCalledWith(
      'Failed to generate stars data:',
      'network boom',
    )
    expect(deps.exit).toHaveBeenCalledWith(1)
  })

  it('reports a non-Error rejection using its raw value', async () => {
    const deps = baseDeps({
      fetchStars: mock(async () => {
        throw 'boom'
      }),
    })
    await main(deps)
    expect(deps.error).toHaveBeenCalledWith(
      'Failed to generate stars data:',
      'boom',
    )
  })

  it('uses the real Date-based clock when no now() is injected', async () => {
    const { now, ...deps } = baseDeps()
    await main(deps)
    expect(deps.writeStarsJson).toHaveBeenCalledTimes(1)
  })
})
