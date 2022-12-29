import { parseString } from '@/helpers/parse'
import type { PhenoColumn, Sorting } from '@/types'

export const title = 'PanVA: Pectobacterium'
export const defaultHomologyId = 13803671

// This should match the sorting of the data returned by the API.
export const defaultSorting: Sorting = {
  field: 'dendro',
}

export const phenoColumns: PhenoColumn[] = [
  {
    type: 'boolean',
    field: 'virulence',
    label: 'Virulence',
    parser(value?: string) {
      if (value === 'virulent') return true
      if (value === 'avirulent') return false
      return null
    },
  },
  {
    type: 'categorical',
    field: 'species',
    label: 'Species',
    width: 80,
    parser: parseString,
  },
  {
    type: 'categorical',
    field: 'strain_name',
    label: 'Strain',
    width: 120,
    parser: parseString,
  },
]
