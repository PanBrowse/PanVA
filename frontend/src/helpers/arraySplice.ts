export const arraySplice = <T>(
  arr: T[],
  start: number,
  deleteCount: number,
  ...addItem: T[]
): T[] => {
  const result = []

  if (start > 0) {
    result.push(...arr.slice(0, start))
  }

  result.push(...addItem)

  const len = result.length - addItem.length
  const count = deleteCount <= 0 ? len : len + deleteCount

  if (arr[count]) {
    result.push(...arr.slice(count))
  }

  return result
}
