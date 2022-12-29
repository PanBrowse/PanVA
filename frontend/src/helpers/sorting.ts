import type { Sorting } from '@/types'

export const sortingPayload = (sorting: Sorting) => {
  if (sorting.field === 'pheno') return sorting.pheno
  if (sorting.field === 'position') return sorting.position
  return undefined
}
