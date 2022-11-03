export const parseBool = (val?: string): boolean => val === 'True'

export const parseOptionalBool = (val?: string): boolean | null =>
  val ? parseBool(val) : null
