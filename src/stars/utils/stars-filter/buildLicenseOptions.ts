import { countBy } from './countBy'
import type { CountOption, StarItem } from './types'

export const buildLicenseOptions = (
  items: Array<Pick<StarItem, 'license'>>,
): CountOption[] => {
  return countBy(items, (item) => item.license).filter(
    (o): o is CountOption & { name: string } => Boolean(o.name),
  )
}
