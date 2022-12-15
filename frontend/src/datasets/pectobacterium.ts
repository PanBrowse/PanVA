export const title = 'PanVA: Pectobacterium'
export const defaultHomologyId = 13803671

export type PhenoCSVColumns = 'species' | 'strain_name' | 'virulence'

export const phenoTypes = [
  {
    type: 'boolean',
    sortMethod: 'categorical',
    label: 'Virulence',
    field: 'virulence',
  },
]

export const parseVirulence = (value?: string) => {
  if (value === 'virulent') return true
  if (value === 'avirulent') return false
  return null
}
