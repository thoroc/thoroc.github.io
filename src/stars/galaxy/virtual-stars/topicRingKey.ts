export const topicRingKey = (lang: string, topic: string): string =>
  `${lang}\0${topic}`
