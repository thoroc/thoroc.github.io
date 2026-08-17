import { TOPIC_TAG_RE } from './constants'

/** 解析搜索框：支持 `#vue` / `vite #electron`（多标签为 AND） */
export const parseSearchQuery = (
  q: string,
): { text: string; topics: string[] } => {
  const raw = (q || '').trim()
  const topics: string[] = []
  const seen = new Set<string>()
  let match = TOPIC_TAG_RE.exec(raw)
  while (match !== null) {
    const topic = (match[1] as string).toLowerCase()
    if (!seen.has(topic)) {
      seen.add(topic)
      topics.push(topic)
    }
    match = TOPIC_TAG_RE.exec(raw)
  }
  const text = raw
    .replace(/(?:^|\s)#[a-z0-9][a-z0-9-]*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return { text, topics }
}
