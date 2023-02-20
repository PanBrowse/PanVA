import { parse_newick } from 'biojs-io-newick'
import * as d3 from 'd3'

import {
  parseNumber,
  parseMetadataBoolean,
  parseMetadataCategorical,
  parseString,
  parseBool,
  parseOptionalNumber,
} from '@/helpers/parse'
import type {
  AlignmentCSVColumns,
  TreeNode,
  Homology,
  mRNAid,
  Nucleotide,
  Metadata,
  MetadataCSVColumns,
  VariablePosition,
  VariablePositionCSVColumns,
  ConfigFilter,
  ConfigMetadata,
} from '@/types'
import { useConfigStore } from '@/stores/config'

export const fetchHomologies = async () => {
  const config = useConfigStore()
  const data = await d3.json<Homology[]>(`${config.apiUrl}homologies.json`)
  if (data === undefined) {
    throw new Error('Received empty homologies.')
  }
  return data
}

export const fetchCoreSNP = async () => {
  const config = useConfigStore()
  const data = await d3.text(`${config.apiUrl}core_snp.txt`)
  return parse_newick(data)
}

// Temporary type that also holds data needed for sorting,
// but that is removed before aligned positions are stored.
export type FetchedAlignments = {
  mRNA_id: mRNAid
  genome_nr: number
  position: number
  nucleotide: Nucleotide
}

export const fetchAlignments = async (homologyId: number) => {
  const config = useConfigStore()
  return await d3.csv<FetchedAlignments, AlignmentCSVColumns>(
    `${config.apiUrl}${homologyId}/alignments.csv`,
    ({ genome_nr, mRNA_id, nucleotide, position }) => ({
      genome_nr: parseNumber(genome_nr),
      mRNA_id: parseString(mRNA_id),
      nucleotide: parseString(nucleotide) as Nucleotide,
      position: parseNumber(position),
    })
  )
}

export const fetchDendrogramDefault = async (homologyId: number) => {
  const config = useConfigStore()
  const data = await d3.json<TreeNode>(
    `${config.apiUrl}${homologyId}/dendrogram.json`
  )
  if (data === undefined) {
    throw new Error('Received empty dendrogram.')
  }
  return data
}

export const fetchDendrogramCustom = async (
  homologyId: number,
  positions: number[]
) => {
  const config = useConfigStore()
  const data = await d3.json<TreeNode>(
    `${config.apiUrl}${homologyId}/dendrogram.json`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ positions }),
    }
  )
  if (data === undefined) {
    throw new Error('Received empty dendrogram.')
  }
  return data
}

// Temporary type that also holds data needed for sorting,
// but that is removed before metadata is stored.
export type FetchedMetadata = {
  mrnaId: mRNAid
  metadata: Metadata
}

export const fetchMetadata = async (homologyId: number) => {
  const config = useConfigStore()

  return await d3.csv<FetchedMetadata, MetadataCSVColumns | string>(
    `${config.apiUrl}${homologyId}/metadata.csv`,
    ({ mRNA_id, ...rest }) => {
      // Common columns.
      const data: FetchedMetadata = {
        mrnaId: parseString(mRNA_id),
        metadata: {},
      }

      // Dataset specific columns.
      config.metadata.forEach((metadataConfig: ConfigMetadata) => {
        const { column, type } = metadataConfig

        if (type === 'categorical') {
          data.metadata[column] = parseMetadataCategorical(rest[column])
        }

        if (type === 'boolean') {
          data.metadata[column] = parseMetadataBoolean(
            rest[column],
            metadataConfig.values
          )
        }

        if (type === 'quantitative') {
          data.metadata[column] = parseOptionalNumber(rest[column])
        }
      })

      return data
    }
  )
}

// Temporary type that also holds data needed for sorting,
// but that is removed before variable positions are stored.
type FetchedVariablePositions = VariablePosition & {
  position: number
}

export const fetchVariablePositions = async (homologyId: number) => {
  const config = useConfigStore()

  return await d3.csv<
    FetchedVariablePositions,
    VariablePositionCSVColumns | string
  >(
    `${config.apiUrl}${homologyId}/variable.csv`,
    ({
      informative,
      position,
      A: As,
      C: Cs,
      G: Gs,
      T: Ts,
      gap: Gaps,
      ...rest
    }) => {
      const A = parseNumber(As)
      const C = parseNumber(Cs)
      const G = parseNumber(Gs)
      const T = parseNumber(Ts)
      const gap = parseNumber(Gaps)

      const conservation = Math.max(A, C, G, T, gap)

      // Common columns.
      const data: FetchedVariablePositions = {
        position: parseNumber(position),
        A,
        C,
        G,
        T,
        gap,
        conservation,
        properties: {
          informative: parseBool(informative),
        },
      }

      // Configured additional columns.
      config.filters.forEach((filter: ConfigFilter) => {
        const { column } = filter
        data.properties[column] = parseBool(rest[column])
      })

      return data
    }
  )
}
