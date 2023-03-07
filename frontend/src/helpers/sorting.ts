import type {
  MetadataBoolean,
  MetadataCategorical,
  MetadataQuantitative,
  Sorting,
} from '@/types'
import snc from 'string-natural-compare'

export const sortingPayload = (sorting: Sorting) => {
  if (sorting.name === 'metadata') return sorting.column
  if (sorting.name === 'position') return sorting.position
  if (sorting.name === 'tree') return sorting.tree
  return undefined
}

export const naturalCompare = (a: string, b: string) =>
  snc(a, b, { caseInsensitive: true })

export const naturalSort = (arr: string[]) => {
  const copy = [...arr]
  copy.sort(naturalCompare)
  return copy
}

export const numberCompare = (a: number, b: number) => a - b

export const metadataCategoricalCompare = (
  a: MetadataCategorical,
  b: MetadataCategorical
) => naturalCompare(a, b)

export const metadataQuantitativeCompare = (
  a: MetadataQuantitative,
  b: MetadataQuantitative
) => {
  if (a === b) return 0
  if (a === null) return 1
  if (b === null) return -1
  return a > b ? 1 : -1
}

export const metadataBooleanCompare = (
  a: MetadataBoolean,
  b: MetadataBoolean
) => {
  if (a === b) return 0
  if (a === null) return 1
  if (b === null) return -1
  return a && !b ? 1 : -1
}

export const metadataCategoricalArrayCompare = (
  a: MetadataCategorical | MetadataCategorical[],
  b: MetadataCategorical | MetadataCategorical[]
) => {
  const aValue = Array.isArray(a) ? a[0] || '' : a
  const bValue = Array.isArray(b) ? b[0] || '' : b
  return naturalCompare(aValue, bValue)
}
