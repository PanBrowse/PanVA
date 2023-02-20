import type { Homology } from '@/types'

export const homologyName = ({ name, homology_id }: Homology): string =>
  name ? `${name} - ${homology_id}` : `${homology_id}`
