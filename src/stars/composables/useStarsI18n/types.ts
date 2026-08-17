import type { ComputedRef } from 'vue'
import type { Translator } from '../../i18n'

export interface StarsI18n {
  locale: ComputedRef<string>
  t: ComputedRef<Translator>
  basePath: ComputedRef<string>
}
