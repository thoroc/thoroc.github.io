import type { Ref } from 'vue'
import type {
  StarsColorThemePreference,
  StarsResolvedColorTheme,
} from '../../theme/color-theme'

export interface StarsTheme {
  preference: Ref<StarsColorThemePreference>
  resolvedTheme: Ref<StarsResolvedColorTheme>
  setColorTheme: (next: StarsColorThemePreference) => void
}
