export interface StarItem {
  fullName: string
  description?: string
  topics?: string[]
  language: string | null
  license: string | null
  fork: boolean
  stars: number
  starredAt: string
  pushedAt: string
}

export interface FilterOptions {
  q: string
  language: string
  license: string
  starredYear: string
  type: string
  sort: string
}

export interface CountOption {
  name: string
  count: number
}

export interface YearOption {
  year: string
  count: number
}

export type ChartDimension = 'language' | 'license' | 'starredYear'
