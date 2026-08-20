import { OTHER_LANGUAGE_KEY } from '../other-language'
import { itemTopicKeys } from './itemTopicKeys'
import { parseSearchQuery } from './parseSearchQuery'
import type { FilterOptions, StarItem } from './types'

const byDate = (a: StarItem, b: StarItem, field: 'pushedAt' | 'starredAt') =>
  new Date(b[field] || 0).getTime() - new Date(a[field] || 0).getTime()

export const filterAndSortStars = (
  items: StarItem[],
  { q, language, license, starredYear, type, sort }: FilterOptions,
): StarItem[] => {
  let list = items.slice()
  const { text, topics } = parseSearchQuery(q)

  if (topics.length) {
    list = list.filter((item) => {
      const keys = itemTopicKeys(item)
      return topics.every((topic) => keys.includes(topic))
    })
  }

  if (text) {
    const query = text.toLowerCase()
    list = list.filter(
      (item) =>
        item.fullName.toLowerCase().includes(query) ||
        (item.description || '').toLowerCase().includes(query) ||
        itemTopicKeys(item).some((topic) => topic.includes(query)),
    )
  }

  if (language && language !== 'all') {
    if (language === OTHER_LANGUAGE_KEY) {
      list = list.filter((item) => !item.language)
    } else {
      list = list.filter((item) => item.language === language)
    }
  }

  if (license && license !== 'all') {
    list = list.filter((item) => item.license === license)
  }

  if (starredYear && starredYear !== 'all') {
    list = list.filter((item) => (item.starredAt || '').startsWith(starredYear))
  }

  if (type === 'sources') list = list.filter((item) => !item.fork)
  else if (type === 'forks') list = list.filter((item) => item.fork)

  if (sort === 'most_stars') {
    list.sort((a, b) => b.stars - a.stars)
  } else if (sort === 'recently_active') {
    list.sort((a, b) => byDate(a, b, 'pushedAt'))
  } else {
    list.sort((a, b) => byDate(a, b, 'starredAt'))
  }

  return list
}
