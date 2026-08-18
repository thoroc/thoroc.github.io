import type { GalaxyLayout } from '../../../src/stars/galaxy/layout-payload'

export interface RawGithubLicense {
  spdx_id?: string | null
  name?: string | null
  key?: string | null
  html_url?: string | null
  url?: string | null
}

export interface RawGithubRepo {
  full_name: string
  description?: string | null
  language?: string | null
  license?: RawGithubLicense | null
  stargazers_count?: number
  starred_at?: string
  created_at?: string
  pushed_at?: string
  updated_at?: string
  homepage?: string | null
  forks_count?: number
  subscribers_count?: number
  watchers_count?: number
  topics?: string[]
  fork?: boolean
  is_template?: boolean
}

export interface RawStarredEntry {
  repo?: RawGithubRepo
  starred_at?: string
  [key: string]: unknown
}

export interface LicenseInfo {
  license: string | null
  licenseUrl: string | null
}

export interface NormalizedStarItem {
  id: string
  fullName: string
  description: string
  language: string | null
  license: string | null
  licenseUrl: string | null
  stars: number
  starredAt: string
  createdAt: string
  pushedAt: string
  homepage: string | null
  forksCount: number
  watchersCount: number
  topics: string[]
  fork: boolean
  isTemplate: boolean
}

export interface CompactStarItem {
  id: string
  fullName: string
  stars: number
  starredAt: string
  fork: boolean
  description?: string
  language?: string
  license?: string
  licenseUrl?: string
  createdAt?: string
  pushedAt?: string
  homepage?: string
  forksCount?: number
  watchersCount?: number
  topics?: string[]
}

export interface StatsBucket {
  name: string
  count: number
}

export interface StarredByYear {
  year: string
  count: number
}

export interface StarBucket {
  key: 'under1k' | 'from1k' | 'from10k' | 'from50k'
  count: number
}

export interface WriteJsonDeps {
  mkdirSync?: (path: string, options: { recursive: true }) => unknown
  writeFileSync?: (
    path: string,
    data: string,
    encoding?: BufferEncoding,
  ) => void
}

export interface GenerateDeps {
  fetchStars?: (owner: string) => Promise<RawGithubRepo[]>
  computeGalaxyLayoutForItems?: (
    items: NormalizedStarItem[],
  ) => Promise<GalaxyLayout | null>
  writeStarsJson?: (stars: RawGithubRepo[], generatedAt: string) => void
  writeGalaxyJson?: (galaxy: GalaxyLayout | null) => void
  writeSiteJson?: (generatedAt: string) => void
  now?: () => Date
  log?: (...args: unknown[]) => void
  warn?: (...args: unknown[]) => void
  error?: (...args: unknown[]) => void
  exit?: (code: number) => void
}

export interface StatsPayload {
  totals: {
    total: number
    languages: number
    licenses: number
    withLicense: number
    forks: number
    templates: number
  }
  topLanguages: StatsBucket[]
  topLicenses: StatsBucket[]
  licenses: StatsBucket[]
  starredByYear: StarredByYear[]
  starBuckets: StarBucket[]
}
