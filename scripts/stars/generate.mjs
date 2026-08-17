import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', '..', 'public', 'stars', 'data')
const STARS_JSON_PATH = path.join(DATA_DIR, 'stars.json')
const GALAXY_JSON_PATH = path.join(DATA_DIR, 'galaxy.json')
const SITE_JSON_PATH = path.join(DATA_DIR, 'site.json')

const OWNER = process.env.OWNER || 'thoroc'
const TOKEN = process.env.GITHUB_TOKEN
const MAX_ITEMS = Number(process.env.MAX_ITEMS) || 0
const SITE_NAME = 'Stars'
const DEFAULT_UI_LOCALE = 'en'
const DEFAULT_SORT = 'recently_starred'

const STAR_MEDIA_TYPE = 'application/vnd.github.v3.star+json'

function formatFetchError(status, body) {
  const message = body?.message || `HTTP ${status}`
  if (status === 403 && /rate limit/i.test(message)) {
    return `${message}\n   Set GITHUB_TOKEN and retry (authenticated limit is ~5000 requests/hour).`
  }
  return message
}

function reportFetchProgress(page, count, { done = false } = {}) {
  const msg = done
    ? `Fetched ${count} starred repos`
    : `Fetching page ${page}… (${count} so far)`
  console.log(msg)
}

async function fetchStars(owner) {
  const stars = []
  let page = 1

  while (true) {
    const url = new URL(`https://api.github.com/users/${owner}/starred`)
    url.searchParams.set('per_page', '100')
    url.searchParams.set('page', String(page))

    const res = await fetch(url, {
      headers: {
        Accept: STAR_MEDIA_TYPE,
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
    })

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(formatFetchError(res.status, body))
    }

    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) break

    for (const item of data) {
      const repo = item.repo || item
      stars.push({ ...repo, starred_at: item.starred_at || null })
    }

    reportFetchProgress(page, stars.length)

    if (MAX_ITEMS > 0 && stars.length >= MAX_ITEMS) break
    if (data.length < 100) break
    page += 1
  }

  reportFetchProgress(page, stars.length, { done: true })

  return MAX_ITEMS > 0 ? stars.slice(0, MAX_ITEMS) : stars
}

function repoAnchor(fullName) {
  return fullName.toLowerCase().replace(/\//g, '-')
}

function normalizeLicense(repo) {
  const lic = repo.license
  if (!lic) return { license: null, licenseUrl: null }
  const spdx = lic.spdx_id && lic.spdx_id !== 'NOASSERTION' ? lic.spdx_id : null
  const label = spdx || lic.name || lic.key || null
  if (!label) return { license: null, licenseUrl: null }
  const licenseUrl =
    lic.html_url ||
    lic.url ||
    (repo.full_name
      ? `https://github.com/${repo.full_name}/blob/HEAD/LICENSE`
      : null)
  return { license: label, licenseUrl }
}

function normalizeTopics(repo) {
  if (!Array.isArray(repo.topics)) return []
  return repo.topics
    .filter((t) => typeof t === 'string' && t.trim())
    .map((t) => t.trim())
}

function normalizeStarItem(repo) {
  const { license, licenseUrl } = normalizeLicense(repo)
  return {
    id: repoAnchor(repo.full_name),
    fullName: repo.full_name,
    description: repo.description || '',
    language: repo.language || null,
    license,
    licenseUrl,
    stars: repo.stargazers_count || 0,
    starredAt: repo.starred_at || '',
    createdAt: repo.created_at || '',
    pushedAt: repo.pushed_at || repo.updated_at || '',
    homepage:
      typeof repo.homepage === 'string' ? repo.homepage.trim() || null : null,
    forksCount: Number(repo.forks_count) || 0,
    watchersCount: Number(repo.subscribers_count ?? repo.watchers_count) || 0,
    topics: normalizeTopics(repo),
    fork: !!repo.fork,
    isTemplate: !!repo.is_template,
  }
}

function compactStarItem(item) {
  const out = {
    id: item.id,
    fullName: item.fullName,
    stars: item.stars,
    starredAt: item.starredAt,
    fork: item.fork,
  }
  if (item.description) out.description = item.description
  if (item.language) out.language = item.language
  if (item.license) out.license = item.license
  if (item.licenseUrl) out.licenseUrl = item.licenseUrl
  if (item.createdAt) out.createdAt = item.createdAt
  if (item.pushedAt) out.pushedAt = item.pushedAt
  if (item.homepage) out.homepage = item.homepage
  if (item.forksCount) out.forksCount = item.forksCount
  if (item.watchersCount) out.watchersCount = item.watchersCount
  if (item.topics?.length) out.topics = item.topics
  return out
}

function computeStats(items) {
  const lang = new Map()
  const lic = new Map()
  const years = new Map()
  const starBuckets = { under1k: 0, from1k: 0, from10k: 0, from50k: 0 }
  let forks = 0
  let templates = 0
  let withLicense = 0

  for (const it of items) {
    const langKey = it.language || 'Other'
    lang.set(langKey, (lang.get(langKey) || 0) + 1)
    if (it.license) {
      lic.set(it.license, (lic.get(it.license) || 0) + 1)
      withLicense += 1
    }
    const y = (it.starredAt || '').slice(0, 4)
    if (y) years.set(y, (years.get(y) || 0) + 1)
    if (it.fork) forks += 1
    if (it.isTemplate) templates += 1
    const s = it.stars || 0
    if (s < 1000) starBuckets.under1k += 1
    else if (s < 10000) starBuckets.from1k += 1
    else if (s < 50000) starBuckets.from10k += 1
    else starBuckets.from50k += 1
  }

  const sortDesc = (entries) =>
    [...entries]
      .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
      .map(([name, count]) => ({ name, count }))

  const starredByYear = [...years.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([year, count]) => ({ year, count }))

  return {
    totals: {
      total: items.length,
      languages: lang.size,
      licenses: lic.size,
      withLicense,
      forks,
      templates,
    },
    topLanguages: sortDesc(lang).slice(0, 5),
    topLicenses: sortDesc(lic).slice(0, 5),
    licenses: sortDesc(lic),
    starredByYear,
    starBuckets: [
      { key: 'under1k', count: starBuckets.under1k },
      { key: 'from1k', count: starBuckets.from1k },
      { key: 'from10k', count: starBuckets.from10k },
      { key: 'from50k', count: starBuckets.from50k },
    ],
  }
}

function writeStarsJson(stars, generatedAt) {
  const normalized = stars.map(normalizeStarItem)
  const items = normalized.map(compactStarItem)
  const payload = {
    generatedAt,
    owner: OWNER,
    total: items.length,
    stats: computeStats(normalized),
    ui: {
      siteName: SITE_NAME,
      defaultSort: DEFAULT_SORT,
      defaultUiLocale: DEFAULT_UI_LOCALE,
      virtualRowHeight: 140,
      searchDebounceMs: 300,
      showLanguage: true,
      showStarsCount: true,
      showLicense: true,
    },
    items,
  }
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(STARS_JSON_PATH, JSON.stringify(payload), 'utf8')
}

function writeGalaxyJson(galaxy) {
  if (!galaxy) return
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(GALAXY_JSON_PATH, JSON.stringify(galaxy), 'utf8')
}

function writeSiteJson(generatedAt) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(
    SITE_JSON_PATH,
    JSON.stringify({ owner: OWNER, title: SITE_NAME, generatedAt }, null, 2),
    'utf8',
  )
}

async function computeGalaxyLayoutForItems(items) {
  if (!items.length) return null
  const { computeGalaxyLayout } = await import('./compute-galaxy-layout.mjs')
  return computeGalaxyLayout(items)
}

async function main() {
  console.log(`Fetching starred repos for @${OWNER}…`)
  try {
    const stars = await fetchStars(OWNER)
    const generatedAt = new Date().toISOString()
    const items = stars.map(normalizeStarItem)

    let galaxy = null
    try {
      galaxy = await computeGalaxyLayoutForItems(items)
    } catch (layoutError) {
      console.warn(
        'Galaxy layout precompute failed, client will fall back to runtime layout:',
        layoutError,
      )
    }

    writeStarsJson(stars, generatedAt)
    writeGalaxyJson(galaxy)
    writeSiteJson(generatedAt)
    console.log(
      `Wrote public/stars/data/{stars,galaxy,site}.json (${stars.length} repos)`,
    )
  } catch (error) {
    console.error('Failed to generate stars data:', error.message || error)
    process.exit(1)
  }
}

await main()
