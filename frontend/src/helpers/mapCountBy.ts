import { identity } from 'lodash'

export const mapCountBy = <T>(
  collection: T[],
  iteratee: (value: T) => any = identity
) => {
  const map = new Map()

  // Fill map with an array of indices per unique value.
  collection.forEach((value) => {
    const val = iteratee(value)
    const count = map.get(val) || 0
    map.set(value, count + 1)
  })

  return map
}
