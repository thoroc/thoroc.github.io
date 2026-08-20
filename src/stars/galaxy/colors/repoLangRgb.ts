import { langColor } from '../../utils/lang-colors'
import { OTHER_LANGUAGE_KEY } from '../../utils/other-language'
import { hexToRgb, type Rgb } from './hexToRgb'

export const repoLangRgb = (language: string | null | undefined): Rgb => {
  const hex = langColor(language || OTHER_LANGUAGE_KEY)
  const [r, g, b] = hexToRgb(hex)
  return [r / 255, g / 255, b / 255]
}
