export const parseBool = (val?: string): boolean => val === 'True'

export const parseOptionalBool = (val?: string): boolean | null =>
  val ? parseBool(val) : null

export const parseNumber = (val?: string): number => {
  if (val) return parseInt(val)
  return 0
}

export const parseString = (val?: string): string => val || ''
