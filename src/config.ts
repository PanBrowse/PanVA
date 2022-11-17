import type { Range } from './types'

export const API_URL = `${import.meta.env.VITE_API_URL}`
export const DEFAULT_HOMOLOGY_ID = parseInt(
  `${import.meta.env.VITE_DEFAULT_HOMOLOGY_ID}`
)
export const TITLE = `${import.meta.env.VITE_TITLE}`
export const DEFAULT_SELECTED_REGION: Range = [1, 40]
