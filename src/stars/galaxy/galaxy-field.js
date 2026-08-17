import { COSMIC_UNIVERSE, R_MAX, R_MIN } from './constants.js'
import { gauss3, hashSeed, hashStr, hashUnit } from './hash.js'

export function layoutLanguageKey(item, layout) {
  const lang = item.language || '其他'
  return layout.langKeys.has(lang) ? lang : '其他'
}

/** 语言星系 hub：兼容 motion/gas，返回密度场吸引子中心 */
export function buildLanguageGalaxyHubs(layout) {
  const field = buildCosmicLanguageField(layout, 1)
  /** @type {Map<string, [number, number, number]>} */
  const hubs = new Map()
  for (const [lang, kernel] of field.kernels) {
    hubs.set(lang, [kernel.cx, kernel.cy, kernel.cz])
  }
  return hubs
}

/** 语言高斯核 σ（仓数越多略大，但上限受控避免独占） */
export function galaxyRadiusForLanguage(lang, layout, totalRepos) {
  const span = R_MAX - R_MIN
  const count = layout.langCounts?.get(lang) ?? 1
  const share = count / Math.max(totalRepos, 1)
  const {
    KERNEL_SIGMA_FRAC,
    KERNEL_SIGMA_POWER,
    GALAXY_BASE_FRAC,
    GALAXY_SIZE_POWER,
  } = COSMIC_UNIVERSE
  const sigmaFrac = KERNEL_SIGMA_FRAC ?? GALAXY_BASE_FRAC
  const sigmaPow = KERNEL_SIGMA_POWER ?? GALAXY_SIZE_POWER
  return span * sigmaFrac * (0.68 + share ** sigmaPow * 0.48)
}

/**
 * 单一宇宙密度场：每个语言一个重叠高斯吸引子
 * @returns {{ kernels: Map<string, { cx: number, cy: number, cz: number, sigma: number, frame: object, lang: string }>, span: number, coreR: number }}
 */
export function buildCosmicLanguageField(layout, totalRepos = 1) {
  const langs = layout.languages || []
  const span = R_MAX - R_MIN
  const { ATTRACTOR_CORE_FRAC, HUB_RADIUS_FRAC } = COSMIC_UNIVERSE
  const coreR = span * (ATTRACTOR_CORE_FRAC ?? HUB_RADIUS_FRAC ?? 0.36)
  /** @type {Map<string, { cx: number, cy: number, cz: number, sigma: number, frame: ReturnType<typeof galaxyFrameAngles>, lang: string }>} */
  const kernels = new Map()

  for (const lang of langs) {
    const h = hashStr(`field-attractor:${lang}`)
    const u = hashUnit(h, 1)
    const v = hashUnit(h, 2)
    const w = hashUnit(h, 3)
    const theta = Math.PI * 2 * u
    const phi = Math.acos(Math.max(-1, Math.min(1, 2 * v - 1)))
    const radial = coreR * Math.cbrt(w) * (0.35 + hashUnit(h, 4) * 0.65)
    const cx = radial * Math.sin(phi) * Math.cos(theta)
    const cy = radial * Math.cos(phi)
    const cz = radial * Math.sin(phi) * Math.sin(theta)
    kernels.set(lang, {
      cx,
      cy,
      cz,
      sigma: galaxyRadiusForLanguage(lang, layout, totalRepos),
      frame: galaxyFrameAngles(lang),
      lang,
    })
  }

  return { kernels, span, coreR }
}

function pickSecondaryKernel(h, lang, kernels) {
  const langs = [...kernels.keys()]
  if (langs.length < 2) return null
  const idx = Math.floor(hashUnit(h, 16) * langs.length) % langs.length
  let secLang = langs[idx]
  if (secLang === lang) secLang = langs[(idx + 1) % langs.length]
  return kernels.get(secLang) ?? null
}

/** 在语言高斯核内采样（取向随核 frame 旋转） */
function sampleLanguageKernel(h, kernel) {
  const { cx, cy, cz, sigma, frame, lang } = kernel
  const [lx, ly, lz] = sampleGalaxyLocal(h, lang, sigma)
  const [rx, ry, rz] = rotateGalaxyLocal(
    lx,
    ly,
    lz,
    frame.tiltX,
    frame.tiltZ,
    frame.tiltY,
  )
  return [cx + rx, cy + ry, cz + rz]
}

/** 场星：在整个宇宙球均匀采样 */
export function sampleCosmicVoid(h, span) {
  const { INTERGALACTIC_SPREAD } = COSMIC_UNIVERSE
  const u = hashUnit(h, 10)
  const v = hashUnit(h, 11)
  const w = hashUnit(h, 12)
  const theta = Math.PI * 2 * u
  const phi = Math.acos(Math.max(-1, Math.min(1, 2 * v - 1)))
  const r =
    span * INTERGALACTIC_SPREAD * Math.cbrt(w) * (0.48 + hashUnit(h, 13) * 0.52)
  let x = r * Math.sin(phi) * Math.cos(theta)
  let y = r * Math.cos(phi)
  let z = r * Math.sin(phi) * Math.sin(theta)
  const jitter = span * 0.035
  x +=
    gauss3(hashSeed(h, 'ig1'), hashSeed(h, 'ig2'), hashSeed(h, 'ig3')) * jitter
  y +=
    gauss3(hashSeed(h, 'ig4'), hashSeed(h, 'ig5'), hashSeed(h, 'ig6')) *
    jitter *
    0.82
  z +=
    gauss3(hashSeed(h, 'ig7'), hashSeed(h, 'ig8'), hashSeed(h, 'ig9')) * jitter
  return [x, y, z]
}

function applyFieldFilament(h, x, y, z, span) {
  const amp = span * (COSMIC_UNIVERSE.FIELD_FILAMENT ?? 0.04)
  const fx = hashUnit(h, 21) * Math.PI * 2
  const fy = hashUnit(h, 22) * Math.PI * 2
  return [
    x +
      Math.sin(fy + z * 0.028) *
        amp *
        gauss3(hashSeed(h, 'f1'), hashSeed(h, 'f2'), hashSeed(h, 'f3')),
    y +
      Math.cos(fx + x * 0.024) *
        amp *
        0.72 *
        gauss3(hashSeed(h, 'f4'), hashSeed(h, 'f5'), hashSeed(h, 'f6')),
    z +
      Math.sin(fx + y * 0.026) *
        amp *
        gauss3(hashSeed(h, 'f7'), hashSeed(h, 'f8'), hashSeed(h, 'f9')),
  ]
}

/** 密度场采样：主语言核 + 次核混合 + 丝状扰动 */
export function sampleCosmicFieldPosition(item, h, field, layout) {
  const lang = layoutLanguageKey(item, layout)
  const kernel = field.kernels.get(lang) ?? [...field.kernels.values()][0]
  if (!kernel) return [0, 0, 0]

  let pos = sampleLanguageKernel(h, kernel)

  const secondary = pickSecondaryKernel(h, lang, field.kernels)
  if (secondary) {
    const secPos = sampleLanguageKernel(hashSeed(h, 'blend'), secondary)
    const bleed = COSMIC_UNIVERSE.KERNEL_OVERLAP_BLEED ?? 0.14
    const mix = bleed * (0.45 + hashUnit(h, 17) * 0.55)
    pos = [
      pos[0] * (1 - mix) + secPos[0] * mix,
      pos[1] * (1 - mix) + secPos[1] * mix,
      pos[2] * (1 - mix) + secPos[2] * mix,
    ]
  }

  return applyFieldFilament(h, pos[0], pos[1], pos[2], field.span)
}

/** 具备气体云的语言星系：按仓数排名取前 N%（至少 1 个） */
export function qualifyingGasLanguages(layout) {
  const { GAS_LANG_TOP_PERCENT } = COSMIC_UNIVERSE
  const langs = layout.languages || []
  if (!langs.length) return []

  const ranked = langs
    .map((lang) => ({ lang, count: layout.langCounts?.get(lang) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.lang.localeCompare(b.lang))

  const topN = Math.max(1, Math.ceil(langs.length * GAS_LANG_TOP_PERCENT))
  return ranked.slice(0, topN).map((row) => row.lang)
}

/** 星系局部坐标系：近全向随机取向（三轴欧拉角） */
export function galaxyFrameAngles(lang) {
  const h = hashStr(`galaxy-frame:${lang}`)
  const spread = COSMIC_UNIVERSE.GALAXY_TILT_SPREAD
  return {
    tiltX: (hashUnit(h, 1) - 0.5) * spread * Math.PI,
    tiltY: hashUnit(h, 2) * Math.PI * 2,
    tiltZ: hashUnit(h, 3) * Math.PI * 2,
  }
}

export function rotateGalaxyLocal(x, y, z, tiltX, tiltZ, tiltY = 0) {
  if (tiltY) {
    const cy = Math.cos(tiltY)
    const sy = Math.sin(tiltY)
    const x0 = cy * x + sy * z
    const z0 = -sy * x + cy * z
    x = x0
    z = z0
  }
  const cx = Math.cos(tiltX)
  const sx = Math.sin(tiltX)
  const y1 = y * cx - z * sx
  const z1 = y * sx + z * cx
  const cz = Math.cos(tiltZ)
  const sz = Math.sin(tiltZ)
  const x2 = x * cz - z1 * sz
  const z2 = x * sz + z1 * cz
  return [x2, y1, z2]
}

/** 星系内摆位：三维椭球高斯云（Sérsic 式中心渐密），无旋臂/极坐标盘 */
function sampleGalaxyLocal(h, lang, galaxyR) {
  const { GALAXY_DISK_Y } = COSMIC_UNIVERSE
  const ax = galaxyR * (0.48 + hashUnit(h, 3) * 0.38)
  const ay = galaxyR * GALAXY_DISK_Y * (0.48 + hashUnit(h, 4) * 0.38)
  const az = galaxyR * (0.48 + hashUnit(h, 5) * 0.38)

  let lx =
    gauss3(hashSeed(h, 'lx1'), hashSeed(h, 'lx2'), hashSeed(h, 'lx3')) * ax
  let ly =
    gauss3(hashSeed(h, 'ly1'), hashSeed(h, 'ly2'), hashSeed(h, 'ly3')) * ay
  let lz =
    gauss3(hashSeed(h, 'lz1'), hashSeed(h, 'lz2'), hashSeed(h, 'lz3')) * az

  const r2 =
    (lx * lx) / (ax * ax) + (ly * ly) / (ay * ay) + (lz * lz) / (az * az)
  const bulge = Math.exp(-r2 * 1.35)
  const shrink = 0.52 + bulge * 0.48
  lx *= shrink
  ly *= shrink
  lz *= shrink

  const wisp = galaxyR * 0.04 * (1 - bulge * 0.6)
  lx += gauss3(hashSeed(h, 'w1'), hashSeed(h, 'w2'), hashSeed(h, 'w3')) * wisp
  ly +=
    gauss3(hashSeed(h, 'w4'), hashSeed(h, 'w5'), hashSeed(h, 'w6')) *
    wisp *
    0.85
  lz += gauss3(hashSeed(h, 'w7'), hashSeed(h, 'w8'), hashSeed(h, 'w9')) * wisp

  return [lx, ly, lz]
}

/** 与星系盘面共面，使气体云覆盖星点分布范围 */
export function gasCloudFrameAngles(lang) {
  return galaxyFrameAngles(lang)
}
