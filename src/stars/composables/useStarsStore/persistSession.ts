import {
  language,
  license,
  qApplied,
  STARS_FILTERS_SESSION_KEY,
  sort,
  starredYear,
  type,
} from './state'

export const persistSession = (): void => {
  try {
    sessionStorage.setItem(
      STARS_FILTERS_SESSION_KEY,
      JSON.stringify({
        q: qApplied.value,
        language: language.value,
        license: license.value,
        starredYear: starredYear.value,
        type: type.value,
        sort: sort.value,
      }),
    )
  } catch {
    /* ignore */
  }
}
