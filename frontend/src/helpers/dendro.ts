import type { Dendro } from '@/types'
import { flatten } from 'lodash'

export const leafNodes = ({ name, children }: Dendro): string[] => {
  if (children && children.length !== 0) {
    return flatten(children.map(leafNodes))
  }

  return [name]
}
