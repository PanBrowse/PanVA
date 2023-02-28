export const formatNumber = (
  value: number | null,
  decimals = 0,
  suffix = ''
) => {
  if (value === null) return ''

  let str = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
  }).format(value)

  if (suffix) {
    str += suffix
  }

  return str
}
