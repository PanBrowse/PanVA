import { difference, intersection } from 'lodash'

// Does `superset` contain all items of `subset`.
export const containsAll = <T = any>(superset: T[], subset: T[]) =>
  difference(subset, superset).length === 0

// Does `superset` contain any item of `subset`.
export const containsAny = <T = any>(superset: T[], subset: T[]) =>
  intersection(subset, superset).length !== 0
