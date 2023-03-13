import Ajv from 'ajv'
import { parse_newick } from 'biojs-io-newick'
import * as d3 from 'd3'
import { constant, times, values } from 'lodash'

import {
  parseBool,
  parseMetadataBoolean,
  parseMetadataCategorical,
  parseNumber,
  parseOptionalNumber,
  parseString,
} from '@/helpers/parse'
import { useConfigStore } from '@/stores/config'
import type {
  AlignmentCSVColumns,
  Annotation,
  AnnotationCSVColumns,
  ConfigAnnotation,
  ConfigMetadata,
  Homology,
  Metadata,
  mRNAid,
  Nucleotide,
  SequenceMetadataCSVColumns,
  Tree,
  TreeNode,
  VariablePosition,
  VariablePositionCSVColumns,
} from '@/types'

// @ts-ignore
import schema from '../schema.homologies.json'

const parseMetadata = (configMetadata: ConfigMetadata, value?: string) => {
  const { type } = configMetadata

  if (type === 'boolean') {
    return parseMetadataBoolean(value, configMetadata.values)
  }

  if (type === 'quantitative') {
    return parseOptionalNumber(value)
  }

  return parseMetadataCategorical(value)
}

// Temporary type that also holds data needed for sorting,
// but that is removed before aligned positions are stored.
export type FetchedAlignments = {
  mRNA_id: mRNAid
  genome_nr: number
  position: number
  nucleotide: Nucleotide
  metadata: Metadata
}

export const fetchAlignments = async (homologyId: string) => {
  const config = useConfigStore()
  return await d3.csv<FetchedAlignments, AlignmentCSVColumns | string>(
    `${config.apiUrl}${homologyId}/alignments.csv`,
    ({ genome_nr, mRNA_id, nucleotide, position, ...rest }) => {
      const data: FetchedAlignments = {
        genome_nr: parseNumber(genome_nr),
        mRNA_id: parseString(mRNA_id),
        nucleotide: parseString(nucleotide) as Nucleotide,
        position: parseNumber(position),
        metadata: {},
      }

      // Parse configured metadata.
      config.homology.alignmentMetadata.forEach(
        (configMetadata: ConfigMetadata) => {
          data.metadata[configMetadata.column] = parseMetadata(
            configMetadata,
            rest[configMetadata.column]
          )
        }
      )

      return data
    }
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
  homologyId: string,
  geneLength: number
) => {
  const config = useConfigStore()

  // No annotations configured, no need to fetch data.
  if (config.homology.annotations.length === 0) return []

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
        config.homology.annotations.forEach((annotation: ConfigAnnotation) => {
          const { column } = annotation
          data.features[column] = parseBool(rest[column])
        })

        return data
      }
    )

    // Default to all configured columns false.
    // The annotations.csv file should not be sparse, but we allow it.
    const emptyAnnotation = Object.fromEntries(
      config.homology.annotations.map(({ column }) => [column, false])
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
  } catch (err) {
    // Instead of failing on errors (such as file not found), we simply
    // return no annotations.
    const error = err as Error
    // Only log unexpected errors.
    if (!error.message?.startsWith('404 ')) {
      console.error(error)
    }
    return []
  }
}

export const fetchDendrogramCustom = async (
  homologyId: string,
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

export const fetchDendrogramDefault = async (homologyId: string) => {
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

  // Validate content of data.
  const ajv = new Ajv()
  const validate = ajv.compile(schema)
  const isValid = validate(data)

  if (!isValid) {
    console.error(validate.errors)
    throw new Error('Invalid homologies file found.')
  }

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

// Temporary type that also holds data needed for sorting,
// but that is removed before metadata is stored.
export type FetchedSequenceMetadata = {
  mrnaId: mRNAid
  metadata: Metadata
}

export const fetchSequenceMetadata = async (homologyId: string) => {
  const config = useConfigStore()

  return await d3.csv<
    FetchedSequenceMetadata,
    SequenceMetadataCSVColumns | string
  >(`${config.apiUrl}${homologyId}/metadata.csv`, ({ mRNA_id, ...rest }) => {
    // Common columns.
    const data: FetchedSequenceMetadata = {
      mrnaId: parseString(mRNA_id),
      metadata: {},
    }

    // Parse configured metadata.
    config.homology.sequenceMetadata.forEach(
      (configMetadata: ConfigMetadata) => {
        data.metadata[configMetadata.column] = parseMetadata(
          configMetadata,
          rest[configMetadata.column]
        )
      }
    )

    return data
  })
}

export const fetchTrees = async () => {
  const config = useConfigStore()
  const trees: Tree[] = []

  const promises = config.homology.trees.map(async ({ filename, label }) => {
    const data = await d3.text(`${config.apiUrl}${filename}`)
    const root = parse_newick(data)
    const tree: Tree = {
      name: filename,
      label,
      root,
    }
    return tree
  })

  await Promise.allSettled(promises).then((results) =>
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        trees.push(result.value)
      }
    })
  )

  return trees
}

// Temporary type that also holds data needed for sorting,
// but that is removed before variable positions are stored.
type FetchedVariablePositions = VariablePosition & {
  position: number
}

export const fetchVariablePositions = async (
  homologyId: string,
  geneLength: number
) => {
  const config = useConfigStore()

  const data = await d3.csv<
    FetchedVariablePositions,
    VariablePositionCSVColumns | string
  >(
    `${config.apiUrl}${homologyId}/variable.csv`,
    ({ position, A: As, C: Cs, G: Gs, T: Ts, gap: Gaps, ...rest }) => {
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
        metadata: {},
      }

      // Parse configured metadata.
      config.homology.variableMetadata.forEach(
        (configMetadata: ConfigMetadata) => {
          data.metadata[configMetadata.column] = parseMetadata(
            configMetadata,
            rest[configMetadata.column]
          )
        }
      )

      return data
    }
  )

  const result: (VariablePosition | null)[] = times(geneLength, constant(null))
  data.forEach(({ position, ...varPos }) => {
    result[position - 1] = varPos
  })

  return result
}
