import type { App, Range, Sorting, Theme } from '@/types'

export const AVAILABLE_APPS: App[] = [
  {
    id: 'homology',
    name: 'Homology',
    description: 'Browse, filter and group aligned sequences.',
  },
  {
    id: 'geneSet',
    name: 'Gene sets',
    description: 'This is another app you are able to use.',
  },
]

export const DEFAULT_SORTING: Sorting = {
  name: 'tree',
  tree: 'dendroDefault',
}

export const DEFAULT_TITLE = 'PanVA'

export const DEFAULT_SELECTED_REGION: Range = [1, 40]

export const CELL_SIZE = 10

export const TRANSITION_TIME = 2000

export const TRANSITION_SEQUENCES_THRESHOLD = 1000

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

// Different themes for coloring the nucleotide cells.
export const THEMES: Record<string, Theme> = {
  clustal: {
    name: 'Clustal (default)',
    annotationColors: ['#f759ab', '#597ef7'],
    cellColors: {
      A: '#fb8072',
      C: '#80b1d3',
      G: '#fdb462',
      T: '#b3de69',
      N: '#f759ab',

      '-': '#ffffff',
      empty: '#f0f0f0',
      aggregate: '#595959',
    },
  },
  pastel: {
    name: 'Pastel',
    annotationColors: ['#f759ab', '#597ef7'],
    cellColors: {
      A: '#c7ceea',
      C: '#dcbed4',
      G: '#d2dcc5',
      T: '#c5b8a6',
      N: '#f759ab',

      '-': '#ffffff',
      empty: '#f0f0f0',
      aggregate: '#595959',
    },
  },
  alternative: {
    name: 'Alternative',
    annotationColors: ['#f759ab', '#597ef7'],
    cellColors: {
      A: '#89b2ff',
      C: '#8fca85',
      G: '#fdcffe',
      T: '#f99372',
      N: '#f759ab',

      '-': '#ffffff',
      empty: '#f0f0f0',
      aggregate: '#595959',
    },
  },
  'cg-at': {
    name: 'CG vs AT',
    annotationColors: ['#f759ab', '#597ef7'],
    cellColors: {
      A: '#e29eb6',
      C: '#dfd266',
      G: '#dfd266',
      T: '#e29eb6',
      N: '#f759ab',

      '-': '#ffffff',
      empty: '#f0f0f0',
      aggregate: '#595959',
    },
  },
  'pur-pyr': {
    name: 'Purine vs Pyrimidine',
    annotationColors: ['#f759ab', '#597ef7'],
    cellColors: {
      A: '#a463ce',
      C: '#9fd0cb',
      G: '#a463ce',
      T: '#9fd0cb',
      N: '#f759ab',

      '-': '#ffffff',
      empty: '#f0f0f0',
      aggregate: '#595959',
    },
  },
}
