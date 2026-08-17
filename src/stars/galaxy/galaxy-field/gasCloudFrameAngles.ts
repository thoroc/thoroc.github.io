import { galaxyFrameAngles } from './galaxyFrameAngles'
import type { FrameAngles } from './types'

/** 与星系盘面共面，使气体云覆盖星点分布范围 */
export const gasCloudFrameAngles = (lang: string): FrameAngles =>
  galaxyFrameAngles(lang)
