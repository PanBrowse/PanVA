/**
 * Applications.
 */

export type App = {
  id: string
  name: string
  description: string
}

export type AppError = {
  message: string
  isFatal?: boolean
}

/**
 * Common.
 */
export type mRNAid = string
export type Nucleotide =
  | 'A'
  | 'C'
  | 'G'
  | 'T'
  | 'R'
  | 'Y'
  | 'S'
  | 'W'
  | 'K'
  | 'M'
  | 'B'
  | 'D'
  | 'H'
  | 'V'
  | 'N'
  | 'a'
  | 'c'
  | 'g'
  | 't'
  | 'r'
  | 'y'
  | 's'
  | 'w'
  | 'k'
  | 'm'
  | 'b'
  | 'd'
  | 'h'
  | 'v'
  | 'n'
  | '-'
export type NucleotideSimplified = 'A' | 'C' | 'G' | 'T' | 'N' | '-'
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
export type MetadataFilter = {
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
// Exactly the same as `MetadataValue`, but we allow multiple `MetadataCategorical` as an array.
export type HomologyMetadataValue =
  | MetadataBoolean
  | MetadataCategorical
  | MetadataCategorical[]
  | MetadataQuantitative
export type HomologyMetadata = Record<string, HomologyMetadataValue>

export type Homology = {
  id: string
  members: number
  alignment_length: number
  metadata: HomologyMetadata
}

export type SequenceMetrics = {
  id: number
  sequence_id: string
  phasing_chromosome: number
  phasing_id: string
  genome_number: number
  annotation_id: string
  sequence_length: number
  total_A: number
  total_T: number
  total_C: number
  total_G: number
  total_N: number
  total_other: number
  GC_content_percent: number
  sequence_unknown_percent: number
  gene_count: number
  gene_length_total: number
  gene_length_min: number
  gene_length_max: number
  gene_length_average: number
  gene_length_median: number
  gene_sequence_percent: number
  gene_density_per_Mbp: number
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

export type ThemeCellColors = {
  A: string
  C: string
  G: string
  T: string
  N: string
  '-': string
  empty: string
  aggregate: string
}

export type Theme = {
  name: string
  cellColors: ThemeCellColors
  annotationColors: string[]
}

/**
 * Configuration.
 *
 * When making changes, be sure to update the config validator by running:
 *   npm run generate-validators
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
  apiUrl?: string // Default: '/'
  apps?: string[] // Default: ['homology']
  homology?: {
    alignmentMetadata?: ConfigMetadata[] // Default: []
    annotations?: ConfigAnnotation[] // Default: []
    defaultId?: string // Default: First homology in homologies.
    defaultSequenceMetadataColumns?: string[] // Default: []
    homologyMetadata?: ConfigMetadata[] // Default: []
    sequenceMetadata?: ConfigMetadata[] // Default: []
    trees?: ConfigTree[] // Default: []
    variableMetadata?: ConfigMetadata[] // Default: []
  }
  title?: string // Default `constants.DEFAULT_TITLE`
}

export type ConfigHomologies = Homology[]
