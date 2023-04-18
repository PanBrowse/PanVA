import * as d3 from 'd3'

import {
  parseBool,
  parseMetadata,
  parseNumber,
  parseString,
} from '@/helpers/parse'
import { useConfigStore } from '@/stores/config'
import type {
  ConfigMetadata,
  GroupInfo,
  Homology,
  SequenceMetrics,
} from '@/types'

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
  return await d3.csv<SequenceMetrics, string>(
    `${config.apiUrl}geneSet/sequences.csv`,
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
      gene_density_per_Mbp,
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

export const fetchGroupInfo = async () => {
  const config = useConfigStore()
  return await d3.csv<GroupInfo, string>(
    `${config.apiUrl}geneSet/group_info.csv`,
    ({
      homology_id,
      gene_id,
      gene_name,
      mRNA_id,
      mRNA_name,
      genome_number,
      sequence_number,
      mRNA_start_position,
      mRNA_end_position,
      gene_start_position,
      gene_end_position,
      chromosome,
      strand,
      gene_length_nuc,
      mRNA_length_nuc,
      cds_length_nuc,
      protein_length_AA,
      phasing_chromosome,
    }) => {
      const data: GroupInfo = {
        homology_id: parseNumber(homology_id),
        gene_id: parseString(gene_id),
        gene_name: parseString(gene_name),
        mRNA_id: parseString(mRNA_id),
        mRNA_name: parseString(mRNA_name),
        genome_number: parseNumber(genome_number),
        sequence_number: parseNumber(sequence_number),
        mRNA_start_position: parseNumber(mRNA_start_position),
        mRNA_end_position: parseNumber(mRNA_end_position),
        gene_start_position: parseNumber(gene_start_position),
        gene_end_position: parseNumber(gene_end_position),
        chromosome: parseString(chromosome),
        strand: parseString(strand),
        gene_length_nuc: parseNumber(gene_length_nuc),
        mRNA_length_nuc: parseNumber(mRNA_length_nuc),
        cds_length_nuc: parseNumber(cds_length_nuc),
        protein_length_AA: parseNumber(protein_length_AA),
        phasing_chromosome: parseString(phasing_chromosome),
      }

      return data
    }
  )
}

export const fetchClusteringOrder = async (method) => {
  const config = useConfigStore()

  const data = await d3.json(
    `${config.apiUrl}geneSet/clustering.json`,

    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ method }),
    }
  )

  return data
}
