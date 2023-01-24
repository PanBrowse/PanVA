import { range } from 'lodash'

export const arrayRange = (
  start: number,
  end: number // Inclusive
): number[] => {
  if (start <= end) {
    return range(start, end + 1)
  }
  return range(end, start + 1)
}
