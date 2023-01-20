import type { CellTheme, Range, Sorting } from '@/types'

export const API_URL = `${import.meta.env.VITE_API_URL}`

export const DEFAULT_SORTING: Sorting = {
  field: 'dendro',
}

export const DEFAULT_SELECTED_REGION: Range = [1, 40]

export const CELL_SIZE = 10

export const TRANSITION_TIME = 2000

// When there are more groups, the colors will be cycled.
export const GROUP_COLORS = [
  '#b15928',
  '#fbdb5a',
  '#1f78b4',
  '#38c7a6',
  '#fb9a99',
  '#ff7f00',
  '#766aaf',
  '#226F54',
]

// Different themes for coloring the nucleotide cells.
// The order of the colors is `ACGTacgt-`.
export const CELL_THEMES: Record<string, CellTheme> = {
  default: {
    name: 'Default',
    colors: [
      '#c7ceea',
      '#dcbed4',
      '#d2dcc5',
      '#c5b8a6',

      '#c7ceea',
      '#dcbed4',
      '#d2dcc5',
      '#c5b8a6',

      '#f6ffff',
    ],
  },
  default2: {
    name: 'Alternative',
    colors: [
      '#89b2ff',
      '#8fca85',
      '#fdcffe',
      '#f99372',

      '#89b2ff',
      '#8fca85',
      '#fdcffe',
      '#f99372',

      '#f6ffff',
    ],
  },
  clustal: {
    name: 'Clustal',
    colors: [
      '#fb8072',
      '#80b1d3',
      '#fdb462',
      '#b3de69',

      '#fb8072',
      '#80b1d3',
      '#fdb462',
      '#b3de69',

      '#ffffff',
    ],
  },
  'cg-at': {
    name: 'CG vs AT',
    colors: [
      '#e29eb6',
      '#dfd266',
      '#dfd266',
      '#e29eb6',

      '#e29eb6',
      '#dfd266',
      '#dfd266',
      '#e29eb6',

      '#f6ffff',
    ],
  },
  'pur-pyr': {
    name: 'Purine vs Pyrimidine',
    colors: [
      '#a463ce',
      '#9fd0cb',
      '#a463ce',
      '#9fd0cb',

      '#a463ce',
      '#9fd0cb',
      '#a463ce',
      '#9fd0cb',

      '#f6ffff',
    ],
  },
}
