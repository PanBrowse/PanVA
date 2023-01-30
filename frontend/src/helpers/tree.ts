import type { TreeNode } from '@/types'
import { flatten } from 'lodash'

export const leafNodes = ({ name, children }: TreeNode): string[] => {
  if (children && children.length !== 0) {
    return flatten(children.map(leafNodes))
  }

  return [name]
}
