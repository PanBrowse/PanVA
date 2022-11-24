export const zipEqual = <T1, T2>(a: T1[], b: T2[]): [T1, T2][] =>
  a.map((value, index) => [value, b[index]])
