import type { Sorting } from '@/types'
import snc from 'string-natural-compare'

export const sortingPayload = (sorting: Sorting) => {
  if (sorting.field === 'pheno') return sorting.pheno
  if (sorting.field === 'position') return sorting.position
  return undefined
}

const naturalCompare = (a: string, b: string) =>
  snc(a, b, { caseInsensitive: true })

export const naturalSort = (arr: string[]) => {
  const copy = [...arr]
  copy.sort(naturalCompare)
  return copy
}
