export type Rgb = [number, number, number]

export const hexToRgb = (hex: string): Rgb => {
  const raw = String(hex || '#6e7681').replace('#', '')
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw.padEnd(6, '0').slice(0, 6)
  const n = Number.parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
