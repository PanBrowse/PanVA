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
  if (val !== undefined && val !== '') return parseInt(val)
  return 0
}

export const parseOptionalNumber = (val?: string): number | null => {
  if (val !== undefined && val !== '') return parseInt(val)
  return null
}

export const parseString = (val?: string): string => val || ''

export const parseMetadataCategorical = (val: string | undefined) =>
  parseString(val)

export const parseMetadataBoolean = (
  val: string | undefined,
  values?: {
    true: string
    false: string
  }
) => {
  if (values) {
    if (val === values.true) return true
    if (val === values.false) return false
    return null
  }

  return parseOptionalBool(val)
}
