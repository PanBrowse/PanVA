type mRNAid = string
type Nucleotide = 'A' | 'C' | 'G' | 'T' | 'a' | 'c' | 'g' | 't' | '-'
type Virulence = 'virulent' | 'avirulent' | '?'

type Homology = {
  homology_id: number
  members: number
  class: string
  variable_sites_nuc: boolean
  informative_sites_nuc: boolean
  variable_sites_prot: boolean
  informative_sites_prot: boolean
  pheno_specific_changes_nuc: boolean
  pheno_specific_changes_prot: boolean
}

type AlignedPosition = {
  index: number
  mRNA_id: mRNAid
  genome_nr: number
  position: number
  nucleotide: Nucleotide
  variable: boolean

  // Are only defined if `variable` is true.
  pheno_specific: boolean | null
  informative: boolean | null

  // Sent by API but unused by application.
  // virulence: Virulence | null
}

type VarPosCount = {
  position: number
  informative: boolean | null
  A: number
  C: number
  T: number
  G: number
  gap: number
  other: number
}

type Pheno = {
  mRNA_id: mRNAid
  species: string
  strain_name: string
  virulence: Virulence

  // Sent by API but unused by application.
  // genome_nr: number
  // pheno_node_id: number
}

type Dendro = {
  name: string
  children?: Dendro[]
}
