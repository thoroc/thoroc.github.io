import { langColor } from '../../utils/lang-colors'
import { hexToRgb, type Rgb } from './hexToRgb'

export const repoLangRgb = (language: string | null | undefined): Rgb => {
  const hex = langColor(language || '其他')
  const [r, g, b] = hexToRgb(hex)
  return [r / 255, g / 255, b / 255]
}
