import { afterEach, describe, expect, it } from 'bun:test'
import {
  filtered,
  galaxyLayout,
  galaxyVirtualIndexMap,
  generatedAt,
  hasActiveFilters,
  items,
  languageOptions,
  licenseOptions,
  owner,
  pageTitle,
  repoName,
  stats,
  total,
  yearOptions,
} from './computed'
import { resetStateForTests } from './resetStateForTests'
import {
  DEFAULT_SITE_TITLE,
  galaxyLayoutPayload,
  language,
  payload,
  qApplied,
  siteMeta,
} from './state'
import type { StarsRepoItem } from './types'

const makeItem = (overrides: Partial<StarsRepoItem> = {}): StarsRepoItem => ({
  fullName: 'owner/repo',
  language: 'Rust',
  license: 'MIT',
  fork: false,
  stars: 10,
  starredAt: '2026-01-01',
  pushedAt: '2026-01-01',
  ...overrides,
})

describe('computed', () => {
  afterEach(resetStateForTests)

  it('items defaults to an empty array with no payload', () => {
    expect(items.value).toEqual([])
  })

  it('items reads from the payload', () => {
    payload.value = { items: [makeItem()] }
    expect(items.value).toHaveLength(1)
  })

  it('total prefers the payload total, falling back to items length', () => {
    payload.value = { items: [makeItem(), makeItem()] }
    expect(total.value).toBe(2)
    payload.value = { items: [makeItem()], total: 99 }
    expect(total.value).toBe(99)
  })

  it('owner/repoName/generatedAt prefer payload, then siteMeta', () => {
    siteMeta.value = {
      owner: 'meta-owner',
      repoName: 'meta-repo',
      generatedAt: 'meta-date',
    }
    expect(owner.value).toBe('meta-owner')
    expect(repoName.value).toBe('meta-repo')
    expect(generatedAt.value).toBe('meta-date')

    payload.value = {
      owner: 'payload-owner',
      repoName: 'payload-repo',
      generatedAt: 'payload-date',
    }
    expect(owner.value).toBe('payload-owner')
    expect(repoName.value).toBe('payload-repo')
    expect(generatedAt.value).toBe('payload-date')
  })

  it('repoName defaults to "stars" with no payload or siteMeta', () => {
    expect(repoName.value).toBe('stars')
  })

  it('pageTitle prefers siteMeta.title, then payload.ui.siteName', () => {
    siteMeta.value = { title: 'From Meta' }
    expect(pageTitle.value).toBe('From Meta')

    siteMeta.value = null
    payload.value = { ui: { siteName: 'From Payload' } }
    expect(pageTitle.value).toBe('From Payload')
  })

  it('pageTitle falls back to the cached title when no live title is set', () => {
    sessionStorage.setItem('stars-page-title', 'Cached Title')
    // `pageTitle` is a memoized computed — force it to re-evaluate by
    // actually changing one of its tracked deps (payload), since toggling
    // sessionStorage alone (an untracked read inside the computed) does not
    // invalidate Vue's cache.
    payload.value = { items: [] }
    payload.value = null
    expect(pageTitle.value).toBe('Cached Title')
  })

  it('pageTitle falls back to DEFAULT_SITE_TITLE with nothing else set', () => {
    sessionStorage.clear()
    payload.value = { items: [] }
    payload.value = null
    expect(pageTitle.value).toBe(DEFAULT_SITE_TITLE)
  })

  it('stats reads from the payload, defaulting to null', () => {
    expect(stats.value).toBeNull()
    const fixtureStats = {
      totals: { total: 5, languages: 1, licenses: 1 },
      topLanguages: [],
      topLicenses: [],
      starredByYear: [],
    }
    payload.value = { stats: fixtureStats }
    expect(stats.value).toEqual(fixtureStats)
  })

  it('galaxyLayout mirrors the galaxyLayoutPayload ref', () => {
    const layout = { version: 1, anchorId: null, positions: [1, 2, 3] }
    galaxyLayoutPayload.value = layout
    expect(galaxyLayout.value).toEqual(layout)
  })

  it('galaxyVirtualIndexMap maps each virtual star to an index', () => {
    payload.value = { items: [makeItem({ id: 'a', fullName: 'owner/a' })] }
    expect(galaxyVirtualIndexMap.value.size).toBeGreaterThan(0)
  })

  it('languageOptions/licenseOptions/yearOptions ignore their own filter', () => {
    payload.value = {
      items: [makeItem({ language: 'Rust' }), makeItem({ language: 'Python' })],
    }
    language.value = 'Rust'
    expect(languageOptions.value.length).toBeGreaterThanOrEqual(2)
    expect(licenseOptions.value.length).toBeGreaterThanOrEqual(1)
    expect(yearOptions.value.length).toBeGreaterThanOrEqual(1)
  })

  it('filtered applies the current filter state', () => {
    payload.value = {
      items: [
        makeItem({ language: 'Rust', fullName: 'owner/rust-repo' }),
        makeItem({ language: 'Python', fullName: 'owner/py-repo' }),
      ],
    }
    language.value = 'Rust'
    expect(filtered.value).toHaveLength(1)
    expect(filtered.value[0]?.language).toBe('Rust')
  })

  it('hasActiveFilters is true only when a filter deviates from its default', () => {
    expect(hasActiveFilters.value).toBe(false)
    qApplied.value = 'vue'
    expect(hasActiveFilters.value).toBe(true)
  })
})
