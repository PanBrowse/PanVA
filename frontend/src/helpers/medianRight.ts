/**
 * Median value of an array. Returns the rightmost median value in an array with even length.
 */
export const medianRight = <T = any>(arr: T[]) =>
  arr[Math.floor(arr.length / 2)]
