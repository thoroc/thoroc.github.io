import { COSMIC_UNIVERSE } from '../constants'
import { hashStr, hashUnit } from '../hash'

export const isIntergalacticRepo = (repoId: string): boolean =>
  hashUnit(hashStr(repoId), 0) < COSMIC_UNIVERSE.INTERGALACTIC_RATIO
