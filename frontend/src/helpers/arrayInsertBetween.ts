export const arrayInsertBetween = <T, E>(arr: T[], sep: E): (T | E)[] =>
  arr.flatMap((x) => [sep, x]).slice(1)
