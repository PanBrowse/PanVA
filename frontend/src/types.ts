/**
 * Common.
 */
export type mRNAid = string
export type Nucleotide = 'A' | 'C' | 'G' | 'T' | 'a' | 'c' | 'g' | 't' | '-'
export type Range = [number, number]
export type DataIndexCollapsed = number | Group
export type TreeOption = 'dendroDefault' | 'dendroCustom' | 'coreSNP'
export type FilterPosition = 'all' | 'variable' | 'informative' | string

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
  message: string
  isFatal?: boolean
}

/**
 * Sorting.
 */
type SortingCommon = {
  name: 'dendroDefault' | 'dendroCustom' | 'coreSNP' | 'mrnaId'
}

type SortingMetadata = {
  name: 'metadata'
  field: string
}

type SortingPosition = {
  name: 'position'
  position: number
}

export type Sorting = SortingCommon | SortingMetadata | SortingPosition

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
}

/**
 * Data structures.
 */

export type HomologyMetadata = {
  label: string
  value: string | boolean
}

export type Homology = {
  homology_id: number
  members: number
  alignment_length: number
  name?: string
  metadata?: HomologyMetadata[]
}

export type VariablePosition = {
  A: number
  C: number
  G: number
  T: number
  gap: number
  conservation: number

  // Includes `informative`, but also contains data for configured filters.
  properties: Record<string, boolean | null>
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

export type Metadata = Record<
  string,
  MetadataBoolean | MetadataCategorical | MetadataQuantitative
>

/**
 * Raw API data.
 */
export type AlignmentCSVColumns =
  | 'mRNA_id'
  | 'genome_nr'
  | 'position'
  | 'nucleotide'

export type MetadataCSVColumns = 'mRNA_id'

export type VariablePositionCSVColumns =
  | 'position'
  | 'informative'
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

type ConfigMetadataBase = {
  field: string
  label: string
}

export type ConfigMetadataBoolean = ConfigMetadataBase & {
  type: 'boolean'
  values?: {
    true: string
    false: string
  }
  labels: {
    true: string
    false: string
    null: string
  }
}

export type ConfigMetadataCategorical = ConfigMetadataBase & {
  type: 'categorical'
  width: number
}

export type ConfigMetadataQuantitative = ConfigMetadataBase & {
  type: 'quantitative'
  decimals?: number
  suffix?: string
  maxValue?: number
  width: number
}

export type ConfigMetadata =
  | ConfigMetadataBoolean
  | ConfigMetadataCategorical
  | ConfigMetadataQuantitative

export type ConfigFilter = {
  field: string
  label: string
}

export type Config = {
  title?: string // Default constants.DEFAULT_TITLE
  apiUrl?: string // Default: '/'
  defaultHomologyId?: number // Default: First homology in homologies.
  metadata?: ConfigMetadata[] // Default: []
  filters?: ConfigFilter[] // Default: []
}
