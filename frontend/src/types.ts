import type { VNode } from 'vue'

/**
 * Common.
 */
export type mRNAid = string
export type Nucleotide = 'A' | 'C' | 'G' | 'T' | 'a' | 'c' | 'g' | 't' | '-'
export type Range = [number, number]
export type DataIndexCollapsed = number | Group
export type TreeOption = 'dendroDefault' | 'dendroCustom' | string
export type FilterPosition = 'all' | 'variable' | string

export type GroupReference = {
  type: 'group'
  id: number
}
export type DataReference = {
  type: 'data'
  dataIndex: number
}

export type Reference = GroupReference | DataReference

export type AppError = {
  message: string | VNode
  isFatal?: boolean
}

/**
 * Sorting.
 */
type SortingCommon = {
  name: 'mrnaId'
}

type SortingMetadata = {
  name: 'metadata'
  column: string
}

type SortingPosition = {
  name: 'position'
  position: number
}

type SortingTree = {
  name: 'tree'
  tree: string
}

export type Sorting =
  | SortingCommon
  | SortingMetadata
  | SortingPosition
  | SortingTree

/**
 * Filtering
 */
export type SequenceFilter = {
  type: ConfigMetadata['type']
  column: string
  operator:
    | 'in'
    | 'not-in'
    | 'equals'
    | 'between'
    | 'greater-than'
    | 'greater-than-equal'
    | 'less-than'
    | 'less-than-equal'
  values: (string | number)[]
}

/**
 * Grouping.
 */
export type Group = {
  id: number
  name: string
  color: string
  isCollapsed: boolean
  isColorized: boolean
  dataIndices: number[]
  // Will match `dataIndices.length`, unless `dataIndices` is filter by sequence filters.
  size: number
}

/**
 * Data structures.
 */

export type HomologyMetadata = {
  label: string
  value: string | string[] | boolean
}

export type Homology = {
  homology_id: number
  members: number
  alignment_length: number
  name?: string
  metadata?: HomologyMetadata[]
}

export type Alignment = {
  nucleotide: Nucleotide
  metadata: Metadata
}

export type Sequence = {
  metadata: Metadata
}

export type VariablePosition = {
  A: number
  C: number
  G: number
  T: number
  gap: number
  conservation: number
  metadata: Metadata
}

export type Annotation = {
  mRNA_id: mRNAid
  // Per position an object with a boolean for each configured annotation column.
  features: Record<string, boolean>[]
}

export type Tree = {
  name: string
  label: string
  root: TreeNode
}

export type TreeNode = {
  name: string
  children?: TreeNode[]
  // Not used in Dendrogram, but used in coreSNP.
  branch_length?: number
}

export type MetadataBoolean = boolean | null
export type MetadataCategorical = string
export type MetadataQuantitative = number | null

export type MetadataValue =
  | MetadataBoolean
  | MetadataCategorical
  | MetadataQuantitative
export type Metadata = Record<string, MetadataValue>

/**
 * Raw API data.
 */
export type AlignmentCSVColumns =
  | 'mRNA_id'
  | 'genome_nr'
  | 'position'
  | 'nucleotide'

export type AnnotationCSVColumns = 'mRNA_id' | 'position'

export type SequenceMetadataCSVColumns = 'mRNA_id'

export type VariablePositionCSVColumns =
  | 'position'
  | 'A'
  | 'C'
  | 'G'
  | 'T'
  | 'gap'

export type CellTheme = {
  name: string
  // ACGTacgt-, so 9 elements.
  colors: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string
  ]
}

/**
 * Configuration.
 *
 * When making changes, be sure to update the config validator by running:
 *   npm run generate:config-validator
 */

export type ConfigAnnotation = {
  column: string
  label: string
}

type ConfigMetadataBase = {
  column: string
  label: string
}

export type ConfigMetadataBoolean = ConfigMetadataBase & {
  type: 'boolean'
  labels?: {
    true: string
    false: string
    null: string
  }
  values?: {
    true: string
    false: string
  }
}

export type ConfigMetadataCategorical = ConfigMetadataBase & {
  type: 'categorical'
  width?: number
}

export type ConfigMetadataQuantitative = ConfigMetadataBase & {
  type: 'quantitative'
  decimals?: number
  maxValue?: number
  suffix?: string
  width?: number
}

export type ConfigMetadata =
  | ConfigMetadataBoolean
  | ConfigMetadataCategorical
  | ConfigMetadataQuantitative

export type ConfigTree = {
  filename: string
  label: string
}

export type Config = {
  alignmentMetadata?: ConfigMetadata[] // Default: []
  annotations?: ConfigAnnotation[] // Default: []
  apiUrl?: string // Default: '/'
  defaultHomologyId?: number // Default: First homology in homologies.
  defaultSequenceMetadataColumns?: string[] // Default: []
  variableMetadata?: ConfigMetadata[] // Default: []
  sequenceMetadata?: ConfigMetadata[] // Default: []
  title?: string // Default `constants.DEFAULT_TITLE`
  trees?: ConfigTree[] // Default: []
}
