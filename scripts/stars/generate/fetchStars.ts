import { MAX_ITEMS, STAR_MEDIA_TYPE, TOKEN } from './constants'
import { formatFetchError } from './formatFetchError'
import { reportFetchProgress } from './reportFetchProgress'
import type { RawGithubRepo, RawStarredEntry } from './types'

export const fetchStars = async (owner: string): Promise<RawGithubRepo[]> => {
  const stars: RawGithubRepo[] = []
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

    const data: RawStarredEntry[] = await res.json()
    if (!Array.isArray(data) || data.length === 0) break

    for (const item of data) {
      const repo = (item.repo || item) as RawGithubRepo
      stars.push({ ...repo, starred_at: item.starred_at || undefined })
    }

    reportFetchProgress(page, stars.length)

    if (MAX_ITEMS > 0 && stars.length >= MAX_ITEMS) break
    if (data.length < 100) break
    page += 1
  }

  reportFetchProgress(page, stars.length, { done: true })

  return MAX_ITEMS > 0 ? stars.slice(0, MAX_ITEMS) : stars
}
