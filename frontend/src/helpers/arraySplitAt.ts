export const arraySplitAt = <T>(arr: T[], index: number): [T[], T[]] => {
  const head = arr.slice(0, index)
  const tail = arr.slice(index)
  return [head, tail]
}
