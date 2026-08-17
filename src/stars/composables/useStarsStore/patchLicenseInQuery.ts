import { patchQueryParam } from './patchQueryParam'
import { license } from './state'

export const patchLicenseInQuery = (
  licenseValue: string | null | undefined,
): void => {
  license.value = !licenseValue || licenseValue === 'all' ? 'all' : licenseValue
  patchQueryParam('stars-license', license)
}
