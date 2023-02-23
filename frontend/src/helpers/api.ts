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
  AnnotationCSVColumns,
  Annotation,
} from '@/types'
import { useConfigStore } from '@/stores/config'
import { constant, times, values } from 'lodash'

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

// Temporary type that also holds data needed for sorting,
// but that is removed before variable positions are stored.
type FetchedAnnotations = {
  mRNA_id: mRNAid
  position: number
  features: Record<string, boolean>
}

export const fetchAnnotations = async (
  homologyId: number,
  geneLength: number
) => {
  const config = useConfigStore()

  // No annotations configured, no need to fetch data.
  if (config.annotations.length === 0) return []

  try {
    const data = await d3.csv<
      FetchedAnnotations,
      AnnotationCSVColumns | string
    >(
      `${config.apiUrl}${homologyId}/annotations.csv`,
      ({ mRNA_id, position, ...rest }) => {
        // Common columns.
        const data: FetchedAnnotations = {
          mRNA_id: parseString(mRNA_id),
          position: parseNumber(position),
          features: {},
        }

        // Configured additional columns.
        config.annotations.forEach((filter: ConfigFilter) => {
          const { column } = filter
          data.features[column] = parseBool(rest[column])
        })

        return data
      }
    )

    // Default to all configured columns false.
    // The annotations.csv file should not be sparse, but we allow it.
    const emptyAnnotation = Object.fromEntries(
      config.annotations.map(({ column }) => [column, false])
    )

    const result: Record<mRNAid, Annotation> = {}
    data.forEach(({ mRNA_id, position, features }) => {
      const annotation = result[mRNA_id] || {
        mRNA_id,
        features: times(geneLength, constant(emptyAnnotation)),
      }
      annotation.features[position - 1] = features
      result[mRNA_id] = annotation
    })

    return values(result)
  } catch (error) {
    // Instead of failing on errors (such as file not found), we simply
    // return no annotations, but do display the error in console.
    console.error(error)
    return []
  }
}

export const fetchCoreSNP = async () => {
  const config = useConfigStore()
  const data = await d3.text(`${config.apiUrl}core_snp.txt`)
  return parse_newick(data)
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

export const fetchHomologies = async () => {
  const config = useConfigStore()
  const data = await d3.json<Homology[]>(`${config.apiUrl}homologies.json`)
  if (data === undefined) {
    throw new Error('Received empty homologies.')
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

export const fetchVariablePositions = async (
  homologyId: number,
  geneLength: number
) => {
  const config = useConfigStore()

  const data = await d3.csv<
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

  const result: (VariablePosition | null)[] = times(geneLength, constant(null))
  data.forEach(({ position, ...varPos }) => {
    result[position - 1] = varPos
  })

  return result
}
