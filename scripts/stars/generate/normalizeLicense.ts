import type { LicenseInfo, RawGithubRepo } from './types'

export const normalizeLicense = (repo: RawGithubRepo): LicenseInfo => {
  const lic = repo.license
  if (!lic) return { license: null, licenseUrl: null }
  const spdx = lic.spdx_id && lic.spdx_id !== 'NOASSERTION' ? lic.spdx_id : null
  const label = spdx || lic.name || lic.key || null
  if (!label) return { license: null, licenseUrl: null }
  const licenseUrl =
    lic.html_url ||
    lic.url ||
    (repo.full_name
      ? `https://github.com/${repo.full_name}/blob/HEAD/LICENSE`
      : null)
  return { license: label, licenseUrl }
}
