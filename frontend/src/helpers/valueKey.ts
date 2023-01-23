import { isGroup } from './isGroup'

export const valueKey = (d: any): string => {
  if (isGroup(d)) {
    return `group-${d.id}`
  }
  return `${d}`
}
