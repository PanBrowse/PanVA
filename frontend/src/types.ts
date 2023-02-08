/**
 * Common.
 */
export type mRNAid = string
export type Nucleotide = 'A' | 'C' | 'G' | 'T' | 'a' | 'c' | 'g' | 't' | '-'
export type Range = [number, number]
export type DataIndexCollapsed = number | Group
export type TreeOption = 'dendroDefault' | 'dendroCustom' | 'coreSNP'
export type FilterPosition =
  | 'all'
  | 'variable'
  | 'informative'
  | 'pheno_specific'

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
  field: 'dendroDefault' | 'dendroCustom' | 'coreSNP' | 'mrnaId'
}

type SortingPheno = {
  field: 'pheno'
  pheno: string
}

type SortingPosition = {
  field: 'position'
  position: number
}

export type Sorting = SortingCommon | SortingPheno | SortingPosition

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
export type Homology = {
  homology_id: number
  name: string
  members: number
  gene_length: number
  class: string
  variable_sites_nuc: boolean
  informative_sites_nuc: boolean
  variable_sites_prot: boolean
  informative_sites_prot: boolean
  pheno_specific_changes_nuc: boolean
  pheno_specific_changes_prot: boolean
}

export type VariablePosition = {
  informative: boolean | null
  pheno_specific: boolean | null
  A: number
  C: number
  G: number
  T: number
  gap: number
  conservation: number
}

export type TreeNode = {
  name: string
  children?: TreeNode[]
  // Not used in Dendrogram, but used in coreSNP.
  branch_length?: number
}

/**
 * Phenotype columns.
 */
export type PhenoColumnCSVParser<T> = (value?: string) => T

type PhenoColumnBase = {
  field: string
  label: string
}

export type PhenoColumnBooleanData = boolean | null
export type PhenoColumnBoolean = PhenoColumnBase & {
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

export type PhenoColumnCategoricalData = string
export type PhenoColumnCategorical = PhenoColumnBase & {
  type: 'categorical'
  width: number
}

export type PhenoColumnQuantitativeData = number | null
export type PhenoColumnQuantitative = PhenoColumnBase & {
  type: 'quantitative'
  maxValue?: number
  width: number
}

export type PhenoColumn =
  | PhenoColumnBoolean
  | PhenoColumnCategorical
  | PhenoColumnQuantitative

export type PhenoColumnType = PhenoColumn['type']
export type PhenoColumnData =
  | PhenoColumnBooleanData
  | PhenoColumnCategoricalData
  | PhenoColumnQuantitativeData

export type Pheno = Record<string, PhenoColumnData> & {
  mRNA_id: mRNAid
}

/**
 * Raw API data.
 */
export type AlignmentCSVColumns =
  | 'mRNA_id'
  | 'genome_nr'
  | 'position'
  | 'nucleotide'

export type PhenoCSVColumns = 'mRNA_id'

export type VariablePositionCSVColumns =
  | 'position'
  | 'informative'
  | 'pheno_specific'
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
export type Config = {
  title?: string // Default constants.DEFAULT_TITLE
  apiUrl?: string // Default: '/'
  defaultHomologyId?: number // Default: First homology in homologies.
  phenoColumns?: PhenoColumn[] // Default: []
}
