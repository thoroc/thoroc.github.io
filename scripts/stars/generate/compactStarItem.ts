import type { CompactStarItem, NormalizedStarItem } from './types'

export const compactStarItem = (item: NormalizedStarItem): CompactStarItem => {
  const out: CompactStarItem = {
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
