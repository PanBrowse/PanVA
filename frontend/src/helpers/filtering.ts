import type {
  MetadataFilter,
  MetadataValue,
  HomologyMetadataValue,
} from '@/types'

export const filterMetadata = (
  { operator, values }: MetadataFilter,
  value: MetadataValue | HomologyMetadataValue
) => {
  switch (operator) {
    case 'between':
      return value !== null && value >= values[0] && value <= values[1]
    case 'equals':
      return value !== null && value === values[0]
    case 'greater-than':
      return value !== null && value > values[0]
    case 'less-than':
      return value !== null && value < values[0]
    case 'greater-than-equal':
      return value !== null && value >= values[0]
    case 'less-than-equal':
      return value !== null && value <= values[0]
    case 'in':
      if (!Array.isArray(value)) return values.includes(`${value}`)
      return value.some((val) => values.includes(`${val}`))
    case 'not-in':
      if (!Array.isArray(value)) return !values.includes(`${value}`)
      return value.every((val) => !values.includes(`${val}`))
  }
}
