import type { Group } from '@/types'

export const groupName = (group: Group) => group.name || `Group ${group.id}`
