import type { CellTheme, Range, Sorting } from '@/types'

export const DEFAULT_SORTING: Sorting = {
  name: 'tree',
  tree: 'dendroDefault',
}

export const DEFAULT_TITLE = 'PanVA'

export const DEFAULT_SELECTED_REGION: Range = [1, 40]

export const CELL_SIZE = 10

export const TRANSITION_TIME = 2000

export const METADATA_GAP = 8

// When there are more groups, the colors will be cycled.
export const GROUP_COLORS = [
  '#38c7a6',
  '#766aaf',
  '#ff7f00',
  '#226f54',
  '#fb9a99',
  '#1f78b4',
  '#b15928',
  '#fbdb5a',
]

export const DEFAULT_METADATA_BOOLEAN_LABELS = {
  true: 'Yes',
  false: 'No',
  null: 'Unknown',
}

export const ANNOTATIONS_GRADIENT_COLORS = ['#f759ab', '#597ef7']

export const EMPTY_CELL_COLOR = '#f0f0f0'

// Different themes for coloring the nucleotide cells.
// The order of the colors is `ACGTacgt-`.
export const CELL_THEMES: Record<string, CellTheme> = {
  default: {
    name: 'Default',
    colors: {
      A: '#c7ceea',
      C: '#dcbed4',
      G: '#d2dcc5',
      T: '#c5b8a6',

      a: '#c7ceea',
      c: '#dcbed4',
      g: '#d2dcc5',
      t: '#c5b8a6',

      gap: '#ffffff',
    },
  },
  default2: {
    name: 'Alternative',
    colors: {
      A: '#89b2ff',
      C: '#8fca85',
      G: '#fdcffe',
      T: '#f99372',

      a: '#89b2ff',
      c: '#8fca85',
      g: '#fdcffe',
      t: '#f99372',

      gap: '#ffffff',
    },
  },
  clustal: {
    name: 'Clustal',
    colors: {
      A: '#fb8072',
      C: '#80b1d3',
      G: '#fdb462',
      T: '#b3de69',

      a: '#fb8072',
      c: '#80b1d3',
      g: '#fdb462',
      t: '#b3de69',

      gap: '#ffffff',
    },
  },
  'cg-at': {
    name: 'CG vs AT',
    colors: {
      A: '#e29eb6',
      C: '#dfd266',
      G: '#dfd266',
      T: '#e29eb6',

      a: '#e29eb6',
      c: '#dfd266',
      g: '#dfd266',
      t: '#e29eb6',

      gap: '#ffffff',
    },
  },
  'pur-pyr': {
    name: 'Purine vs Pyrimidine',
    colors: {
      A: '#a463ce',
      C: '#9fd0cb',
      G: '#a463ce',
      T: '#9fd0cb',

      a: '#a463ce',
      c: '#9fd0cb',
      g: '#a463ce',
      t: '#9fd0cb',

      gap: '#ffffff',
    },
  },
}
