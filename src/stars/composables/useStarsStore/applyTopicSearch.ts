import { persistSession } from './persistSession'
import { scrollListToTop } from './scrollListToTop'
import { qApplied, qInput } from './state'
import { syncQuery } from './syncQuery'

/** 按 GitHub topic 筛选（搜索框写入 #topic） */
export const applyTopicSearch = (topic: string | null | undefined): void => {
  const name = String(topic || '')
    .trim()
    .toLowerCase()
  if (!name) return
  const next = `#${name}`
  qInput.value = next
  qApplied.value = next
  if (typeof window !== 'undefined') {
    syncQuery()
    persistSession()
    scrollListToTop()
  }
}
