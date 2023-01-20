export const arrayRange = <T>(
  arr: T[],
  start: number,
  end: number // Inclusive
): T[] => {
  if (start <= end) {
    return arr.slice(start, end + 1)
  }
  return arr.slice(end, start + 1)
}
