import * as d3 from 'd3'

import { useConfigStore } from '@/stores/config'
import type { ConfigMetadata, Homology } from '@/types'

export const fetchHomologies = async () => {
  const config = useConfigStore()
  const data = await d3.json<Homology[]>(
    `${config.apiUrl}geneSet/homologies.json`
  )

  return data!.map(({ id, members, alignment_length, ...rest }) => {
    const homology: Homology = {
      id,
      members,
      alignment_length,
      metadata: {},
    }

    // Parse configured metadata.
    config.homology.homologyMetadata.forEach(
      (configMetadata: ConfigMetadata) => {
        homology.metadata[configMetadata.column] =
          rest.metadata[configMetadata.column]
      }
    )

    return homology
  })
}
