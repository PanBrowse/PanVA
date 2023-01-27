import { chain } from 'lodash'

export const groupCounts = (counts: Record<string, number>) => {
  return chain(counts)
    .pickBy()
    .map((count, label) => `${label}: ${count}`)
    .join(', ')
    .value()
}
