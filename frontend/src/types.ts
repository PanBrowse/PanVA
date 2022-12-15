export type mRNAid = string
export type Nucleotide = 'A' | 'C' | 'G' | 'T' | 'a' | 'c' | 'g' | 't' | '-'
export type Range = [number, number]
export type Position = { x: number; y: number }

export type Homology = {
  homology_id: number
  name: string
  members: number
  class: string
  variable_sites_nuc: boolean
  informative_sites_nuc: boolean
  variable_sites_prot: boolean
  informative_sites_prot: boolean
  pheno_specific_changes_nuc: boolean
  pheno_specific_changes_prot: boolean
}

export type AlignedPosition = {
  index: number
  mRNA_id: mRNAid
  mRNA_index: number
  genome_nr: number
  position: number
  nucleotide: Nucleotide
  variable: boolean

  // Are only defined if `variable` is true.
  pheno_specific: boolean | null
  informative: boolean | null
}

export type VarPosCount = {
  position: number
  informative: boolean | null
  A: number
  C: number
  G: number
  T: number
  gap: number
  other: number
  conservation: number
}

export type Sequence = {
  mRNA_id: mRNAid
  nuc_trimmed_seq: string
  nuc_seq: string
  prot_trimmed_seq: string
  prot_seq: string
}

export type Pheno = {
  mRNA_id: mRNAid
  species: string
  strain_name: string
  virulence: boolean | null
}

export type Dendro = {
  name: string
  children?: Dendro[]
}

// Types for CSV data that is sent by the API.
export type AlignedPositionsCSVColumns =
  | 'index'
  | 'mRNA_id'
  | 'mRNA_index'
  | 'genome_nr'
  | 'position'
  | 'nucleotide'
  | 'variable'
  | 'pheno_specific'
  | 'informative'
  | 'virulence'

export type SequenceCSVColumns =
  | 'mRNA_id'
  | 'nuc_trimmed_seq'
  | 'nuc_seq'
  | 'prot_trimmed_seq'
  | 'prot_seq'

export type PhenoCSVColumns =
  | 'mRNA_id'
  | 'species'
  | 'strain_name'
  | 'virulence'
  | 'genome_nr'
  | 'pheno_node_id'

export type VarPosCountCSVColumns =
  | 'position'
  | 'informative'
  | 'A'
  | 'C'
  | 'G'
  | 'T'
  | 'gap'
  | 'other'
  | 'conservation'

export type Dataset = {
  defaultHomologyId: number
  title: string
}

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
