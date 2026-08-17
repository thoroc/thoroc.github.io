import { hashUnit } from '../hash'
import type { GasClump, GasClumpField } from './types'

export const pickGasClump = (h: number, field: GasClumpField): GasClump => {
  const clumps = field.clumps
  let target = hashUnit(h, 0) * field.weightSum
  for (let i = 0; i < clumps.length; i += 1) {
    const clump = clumps[i] as GasClump
    target -= clump.weight
    if (target <= 0) return clump
  }
  return clumps[clumps.length - 1] as GasClump
}
