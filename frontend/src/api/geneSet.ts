import * as d3 from 'd3'

import { useConfigStore } from '@/stores/config'
import {
  parseBool,
  parseMetadata,
  parseNumber,
  parseString,
} from '@/helpers/parse'
import type { ConfigMetadata, Homology, SequenceMetrics } from '@/types'

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

export const fetchSequences = async () => {
  const config = useConfigStore()
  return await d3.csv<SequenceMetrics, string>(`${config.apiUrl}geneSet/sequences.csv`,
    ({
      id,
      sequence_id,
      phasing_chromosome,
      phasing_id,
      genome_number,
      annotation_id,
      sequence_length,
      total_A,
      total_T,
      total_C,
      total_G,
      total_N,
      total_other,
      GC_content_percent,
      sequence_unknown_percent,
      gene_count,
      gene_length_total,
      gene_length_min,
      gene_length_max,
      gene_length_average,
      gene_length_median,
      gene_sequence_percent,
      gene_density_per_Mbp

    }) => {
      const data: SequenceMetrics = {
        id: parseNumber(id),
        sequence_id: parseString(sequence_id),
        phasing_chromosome: parseNumber(phasing_chromosome),
        phasing_id: parseString(phasing_id),
        genome_number: parseNumber(genome_number),
        annotation_id: parseString(annotation_id),
        sequence_length: parseNumber(sequence_length),
        total_A: parseNumber(total_A),
        total_T: parseNumber(total_T),
        total_C: parseNumber(total_C),
        total_G: parseNumber(total_G),
        total_N: parseNumber(total_N),
        total_other: parseNumber(total_other),
        GC_content_percent: parseNumber(GC_content_percent),
        sequence_unknown_percent: parseNumber(sequence_unknown_percent),
        gene_count: parseNumber(gene_count),
        gene_length_total: parseNumber(gene_length_total),
        gene_length_min: parseNumber(gene_length_min),
        gene_length_max: parseNumber(gene_length_max),
        gene_length_average: parseNumber(gene_length_average),
        gene_length_median: parseNumber(gene_length_median),
        gene_sequence_percent: parseNumber(gene_sequence_percent),
        gene_density_per_Mbp: parseNumber(gene_density_per_Mbp),
      }

      return data
    }
  )
}


