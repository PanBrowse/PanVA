import type { PhenoColumnBoolean, PhenoColumnCategorical } from '@/types'

const isTrue = (val?: string) => {
  const v = val?.toLowerCase()
  return v === 'true' || v === 't' || v === 'yes' || v === 'y'
}

const isFalse = (val?: string) => {
  const v = val?.toLowerCase()
  return v === 'false' || v === 'f' || v === 'no' || v === 'n'
}

export const parseOptionalBool = (val?: string): boolean | null => {
  if (isTrue(val)) return true
  if (isFalse(val)) return false
  return null
}

export const parseBool = (val?: string): boolean => isTrue(val)

export const parseNumber = (val?: string): number => {
  if (val) return parseInt(val)
  return 0
}

export const parseString = (val?: string): string => val || ''

export const parsePhenoCategorical = (
  val: string | undefined,
  _column: PhenoColumnCategorical
) => parseString(val)

export const parsePhenoBoolean = (
  val: string | undefined,
  column: PhenoColumnBoolean
) => {
  if (column.values) {
    if (val === column.values.true) return true
    if (val === column.values.false) return false
    return null
  }

  return parseOptionalBool(val)
}
