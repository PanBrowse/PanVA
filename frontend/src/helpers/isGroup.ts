import type { DataIndexCollapsed, Group } from '@/types'

export const isGroup = (value: DataIndexCollapsed): value is Group =>
  typeof value !== 'number'
