import { pushRecencyScore } from './pushRecencyScore'

export const activityFactor = (pushedAt: string | undefined): number =>
  pushRecencyScore(pushedAt)
