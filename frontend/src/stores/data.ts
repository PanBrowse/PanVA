import axios from 'axios'
import { defineStore } from 'pinia'
import { parse_newick } from 'biojs-io-newick'
import * as d3 from 'd3'

import {
  CELL_THEMES,
  DEFAULT_SORTING,
  DEFAULT_SELECTED_REGION,
  TRANSITION_TIME,
} from '@/constants'
import {
  parseNumber,
  parseOptionalBool,
  parsePhenoBoolean,
  parsePhenoCategorical,
  parseString,
} from '@/helpers/parse'
import type {
  AlignmentCSVColumns,
  DataIndexCollapsed,
  TreeNode,
  Group,
  Homology,
  mRNAid,
  Nucleotide,
  Pheno,
  PhenoColumn,
  PhenoColumnData,
  PhenoCSVColumns,
  Range,
  Sorting,
  VariablePosition,
  VariablePositionCSVColumns,
  AppError,
  FilterPosition,
  TreeOption,
  Reference,
  GroupReference,
  DataReference,
} from '@/types'
import {
  chain,
  clamp,
  constant,
  filter,
  flatten,
  range,
  reverse,
  sortBy,
  times,
  union,
} from 'lodash'
import arrayFlip from '@/helpers/arrayFlip'
import { medianRight } from '@/helpers/medianRight'
import { zipEqual } from '@/helpers/zipEqual'
import { naturalSort, sortingPayload } from '@/helpers/sorting'
import { leafNodes } from '@/helpers/tree'
import { arraySlice } from '@/helpers/arraySlice'
import { isGroup } from '@/helpers/isGroup'
import { toRaw } from 'vue'
import { useConfigStore } from './config'
import { sortNucleotideString } from '@/helpers/nucleotide'

type NucleotideColorFunc = (nucleotide: Nucleotide) => string
type CellThemeName = keyof typeof CELL_THEMES

export const useDataStore = defineStore('data', {
  state: () => ({
    // Data that is fetched once from the API.
    homologies: [] as Homology[],
    coreSNP: null as TreeNode | null,

    // Data that is fetched from the API using `homologyId`.
    // We don't keep data for previous homology ids because of memory consumption.
    alignedPositions: [] as Nucleotide[],
    dendroCustom: null as TreeNode | null,
    dendroDefault: null as TreeNode | null,
    phenos: [] as Pheno[],
    variablePositions: [] as (VariablePosition | null)[],
    // mRNA ids in order as defined by the default dendrogram.
    // This is populated by taking the leaf nodes from dendroDefault.
    mrnaIds: [] as mRNAid[],
    // Genome numbers in order as defined by the default dendrogram.
    // This is populated from the `genome_nr` column when fetching alignments.
    genomeNrs: [] as number[],

    // API fetching state.
    error: null as AppError | null,

    // What row index is being hovered over.
    hoverRowIndex: null as number | null,

    // Drag state.
    dragStartRowIndex: null as number | null,
    dragIsCumulative: false,
    dragInitialSelectedRowIndices: [] as number[],

    // Row selection.
    // Stored as data indices.
    selectedDataIndices: [] as number[],

    // Position selection.
    // Range set by GeneOverview (inclusive on both ends).
    positionRegion: DEFAULT_SELECTED_REGION,
    // Checkboxes above the positions.
    selectedPositions: [] as number[],
    // When a custom dendrogram is generated, we store the selection it was generated for.
    // This way, we know when to display the "Update custom dendrogram" button.
    dendroCustomForSelectedPositions: [] as number[],

    // Filter positions based on position metadata.
    positionFilter: 'all' as FilterPosition,

    // Grouping.
    groups: [] as Group[],
    lastGroupId: 0,

    // Sorting.
    sorting: DEFAULT_SORTING,
    /**
     * Given a list of unsorted mRNA ids [a,b,c,d,e] and a target order of [e,b,d,a,c].
     * This field returns a mapping of `draw position` => `data index`, which
     * can be used when you iterate over draw positions.
     * [
     *   0 => 4, // on draw position 0 is data index 4 (this.mrnaIds[4] = e)
     *   1 => 1, // on draw position 1 is data index 1 (this.mrnaIds[1] = b)
     *   2 => 3, // on draw position 2 is data index 3 (this.mrnaIds[3] = d)
     *   3 => 0, // on draw position 3 is data index 0 (this.mrnaIds[0] = a)
     *   4 => 2, // on draw position 4 is data index 2 (this.mrnaIds[2] = c)
     * ]
     */
    sortedDataIndices: [] as number[],

    // User options.
    cellTheme: 'default' as CellThemeName,
    tree: 'dendroDefault' as TreeOption,
    homologyId: null as number | null,
    reference: null as Reference | null,
    transitionsEnabled: true,
  }),
  getters: {
    apiUrl(): string {
      const config = useConfigStore()
      return config.apiUrl
    },
    sortedDataIndicesCollapsed(): DataIndexCollapsed[] {
      /**
       * This returns the same mapping as `sortedDataIndices`, but with collapsed
       * groups as a Group object in the correct drawing position.
       *
       * Given a list of unsorted mRNA ids [a,b,c,d,e] and a target order of [e,b,d,a,c],
       * but with a group containing [b,d,c] this function returns:
       * [
       *   0 => 4,     // on draw position 0 is data index 4
       *   1 => Group, // on draw position 1 is Group with indices [1,3,2] (b,d,c)
       *   2 => 0,     // on draw position 2 is mRNA ids index 0 (a)
       * ]
       *
       * The group is placed at drawing position 1 because that is the median drawing
       * position in `sortedDataIndices` after removing empty rows:
       */

      // Work on a copy of the original `sortedDataIndices`.
      const indices: (DataIndexCollapsed | null)[] = [...this.sortedDataIndices]

      // Lookup table for mRNA ids index => draw position.
      const lookup = arrayFlip(this.sortedDataIndices)

      // For each collapsed group.
      filter(this.groups, 'isCollapsed').forEach((group) => {
        const { dataIndices } = group

        // Determine all draw positions for this group's data indices.
        const positions = dataIndices.map((dataIndex) => lookup[dataIndex])

        // Determine the median draw position where to draw this group.
        const medianPosition = medianRight(positions)

        // Set draw position to null for all data indices of this group.
        positions.forEach((position) => {
          indices[position] = null
        })

        // Add group at correct draw position.
        indices[medianPosition] = group
      })

      // Remove null values. Any gaps in draw positions will be removed.
      const condenced = indices.filter(
        (value): value is DataIndexCollapsed => value !== null
      )

      return condenced
    },
    rowColors(): string[] {
      const colors = times(this.sequenceCount, constant(''))
      this.groups.forEach(({ color, dataIndices, isColorized }) => {
        if (!isColorized) return

        dataIndices.forEach((index) => {
          colors[index] = color
        })
      })
      return colors
    },
    mrnaIdsLookup: (state) => {
      /**
       * We need to sort many data sets by the order as defined in `this.mrnaIds`.
       * Instead of using `this.mrnaIds.indexOf(mRNA_id)` as a sorting method,
       * which is O(n), we can use `this.mrnaIdsLookup[mRNA_id]`, which is O(1).
       * This brings down the total computation time from O(n^2) to O(2n).
       */
      return Object.fromEntries(
        state.mrnaIds.map((mrnaId, dataIndex) => [mrnaId, dataIndex])
      )
    },
    homology: (state) => {
      // This will return undefined if the homologies have not yet loaded.
      return state.homologies.find(
        ({ homology_id }) => homology_id === state.homologyId
      )
    },
    filterPositions() {
      return (positions: number[]) => {
        if (this.positionFilter !== 'all') {
          const field = this.positionFilter as Exclude<FilterPosition, 'all'>
          return positions.filter((pos) => {
            const varPos = this.variablePositions[pos - 1]
            if (!varPos) return false
            if (field === 'variable') return true
            return varPos[field]
          })
        }

        return positions
      }
    },
    filteredPositions(): number[] {
      const [start, end] = this.positionRegion
      const positions = range(start, end + 1)
      return this.filterPositions(positions)
    },
    filteredPositionsCount(): number {
      return this.filteredPositions.length
    },
    sequenceCount(): number {
      return this.mrnaIds.length
    },
    geneLength(): number {
      if (this.homology) return this.homology.gene_length
      return 0
    },
    nucleotideColor(): NucleotideColorFunc {
      const colors = CELL_THEMES[this.cellTheme].colors
      return d3
        .scaleOrdinal<string>()
        .domain(['A', 'C', 'G', 'T', 'a', 'c', 'g', 't', '-'])
        .range(colors)
    },
    transitionTime(): number {
      return this.transitionsEnabled ? TRANSITION_TIME : 0
    },
    referenceNucleotides(): string[] | null {
      /**
       * [
       *    'AC', // Nucleotide string at position 1.
       *    'A',  // Nucleotide string at position 2.
       *    ...
       * ],
       */
      if (!this.reference) return null

      if (this.reference.type === 'group') {
        const { id } = this.reference as GroupReference

        const { dataIndices } = this.groups.find(
          (group) => group.id === id
        ) as Group

        return this.filteredPositions.map((position) => {
          const nucleotides: Record<string, boolean> = {}

          dataIndices.forEach((dataIndex) => {
            const nucleotide =
              this.alignedPositions[dataIndex * this.geneLength + position - 1]
            nucleotides[nucleotide] = true
          })

          return sortNucleotideString(Object.keys(nucleotides).join(''))
        })
      }

      if (this.reference.type === 'data') {
        return this.filteredPositions.map((position) => {
          const { dataIndex } = this.reference as DataReference

          const nucleotide =
            this.alignedPositions[dataIndex * this.geneLength + position - 1]
          return nucleotide
        })
      }
      return null
    },
    mrnaIdsSorted(): mRNAid[] {
      return this.sortedDataIndices.map((index) => this.mrnaIds[index])
    },
    genomeMrnaIdsLookup(): Record<number, mRNAid[]> {
      const lookup: Record<number, mRNAid[]> = {}

      zipEqual(this.genomeNrs, this.mrnaIds).map(([genomeNr, mrnaId]) => {
        if (genomeNr in lookup) {
          lookup[genomeNr].push(mrnaId)
        } else {
          lookup[genomeNr] = [mrnaId]
        }
      })

      return lookup
    },
  },
  actions: {
    changeSorting(sorting: Sorting) {
      // Check if the requested sorting equals the current sorting.
      if (
        sorting.field === this.sorting.field &&
        sortingPayload(sorting) === sortingPayload(this.sorting)
      ) {
        // Same field and parameter, so we reverse the current sorting.
        // But we don't do this for the tree, that is static.
        if (
          !['dendroDefault', 'dendroCustom', 'coreSNP'].includes(sorting.field)
        ) {
          this.sortedDataIndices = reverse(this.sortedDataIndices)
        }
        return
      }

      // Sorting by dendrogram is the default sorting, so we reset everything.
      if (sorting.field === 'dendroDefault') {
        this.resetSorting()
        return
      }

      // First we update the sorting field to a new value.
      this.sorting = sorting

      // Sorting by custom dendrogram should not take current sorting into account.
      if (sorting.field === 'dendroCustom' && this.dendroCustom) {
        // The leaf nodes of a dendrogram are mRNA ids.
        this.sortedDataIndices = leafNodes(this.dendroCustom).map(
          (mrnaId) => this.mrnaIdsLookup[mrnaId]
        )
        return
      }

      // Sorting by coreSNP should not take current sorting into account.
      if (sorting.field === 'coreSNP' && this.coreSNP) {
        this.sortedDataIndices = flatten(
          // The leaf nodes of coreSNP are genome number strings.
          leafNodes(this.coreSNP).map((leaf) => {
            const genomeNr = parseInt(leaf)

            // Not all genome numbers occur in each homology
            // group, so lookup could result in undefined.
            if (genomeNr in this.genomeMrnaIdsLookup) {
              return this.genomeMrnaIdsLookup[genomeNr].map(
                (mrnaId) => this.mrnaIdsLookup[mrnaId]
              )
            }

            return []
          })
        )
        return
      }

      // Sorting by mrna id does not take current sorting into account.
      if (sorting.field === 'mrnaId') {
        this.sortedDataIndices = naturalSort(this.mrnaIds).map(
          (mrnaId) => this.mrnaIdsLookup[mrnaId]
        )
        return
      }

      // Get the array of values in the currently sorted order.
      const values = (() => {
        if (this.sorting.field === 'pheno') {
          const pheno = this.sorting.pheno
          // Get the array of values in the currently sorted order.
          return this.sortedDataIndices.map<PhenoColumnData>(
            (index) => this.phenos[index][pheno]
          )
        }

        if (this.sorting.field === 'position') {
          const position = this.sorting.position
          // Get the array of values in the currently sorted order.
          return this.sortedDataIndices.map<Nucleotide>(
            (index) =>
              this.alignedPositions[index * this.geneLength + position - 1]
          )
        }

        return []
      })()

      // We use a Map so we can use `null`, `false` and `true` as keys.
      const map = new Map()

      // Fill map with an array of indices per unique value.
      values.forEach((value, index) => {
        const indices = map.get(value) || []
        indices.push(index)
        map.set(value, indices)
      })

      // Determine the median index for each index array.
      map.forEach((indices, key) => {
        map.set(key, medianRight(indices))
      })

      // Generate tuple array of mrna index and sorted median index.
      const tuples = zipEqual(
        this.sortedDataIndices,
        values.map((value) => map.get(value))
      )

      // Sort by the sorted median index
      const sorted = sortBy(tuples, ([_index, value]) => value)

      // Pull out the mrna indices.
      this.sortedDataIndices = sorted.map(([index]) => index)
    },
    async fetchHomologies() {
      try {
        const response = await axios.get<Homology[]>(
          `${this.apiUrl}homologies.json`
        )
        this.homologies = sortBy(response.data, 'name')
      } catch (err) {
        this.setError({
          message: 'Unable to fetch or parse homology ids from API.',
          isFatal: true,
        })
        throw err
      }
    },
    async fetchCoreSNP() {
      try {
        const response = await axios.get<string>(`${this.apiUrl}core_snp.txt`)
        this.coreSNP = parse_newick(response.data)
      } catch (err) {
        this.setError({
          message: 'Unable to fetch or parse coreSNP from API.',
          isFatal: true,
        })
        throw err
      }
    },
    async fetchAlignments() {
      if (this.mrnaIds.length === 0) {
        throw new Error(
          'Order of mRNA ids must be known (by fetching dendrogram) before fetching aligned positions.'
        )
      }

      try {
        // Type for temporary data.
        type AlignmentData = {
          mRNA_id: mRNAid
          genome_nr: number
          position: number
          nucleotide: Nucleotide
        }

        const data = sortBy(
          await d3.csv<AlignmentData, AlignmentCSVColumns>(
            `${this.apiUrl}${this.homologyId}/alignments.csv`,
            ({ genome_nr, mRNA_id, nucleotide, position }) => ({
              genome_nr: parseNumber(genome_nr),
              mRNA_id: parseString(mRNA_id),
              nucleotide: parseString(nucleotide) as Nucleotide,
              position: parseNumber(position),
            })
          ),
          // 1. Sort by mRNA id in the order as defined by the dendrogram.
          // 2. Sort by the position within each mRNA id.
          [({ mRNA_id }) => this.mrnaIdsLookup[mRNA_id], 'position']
        )

        this.genomeNrs = range(
          0,
          this.geneLength * this.sequenceCount,
          this.geneLength
        ).map((index) => data[index].genome_nr)
        this.alignedPositions = data.map(({ nucleotide }) => nucleotide)
      } catch (err) {
        this.setError({
          message: 'Unable to fetch or parse aligned positions from API.',
          isFatal: true,
        })
        throw err
      }
    },
    async fetchDendrogramDefault() {
      try {
        const data = await d3.json<TreeNode>(
          `${this.apiUrl}${this.homologyId}/dendrogram.json`
        )
        if (!data) {
          throw new Error('Empty dendrogram default data.')
        }
        this.dendroDefault = data
        this.mrnaIds = leafNodes(data)
      } catch (err) {
        this.setError({
          message: 'Unable to fetch or parse default dendrogram from API.',
          isFatal: true,
        })
        throw err
      }
    },
    async fetchDendrogramCustom() {
      try {
        const response = await axios.post<TreeNode>(
          `${this.apiUrl}${this.homologyId}/dendrogram.json`,
          {
            positions: toRaw(this.selectedPositions),
          }
        )
        this.dendroCustom = response.data
        this.dendroCustomForSelectedPositions = this.selectedPositions
      } catch (err) {
        this.setError({
          message: 'Unable to fetch or parse custom dendrogram from API.',
          isFatal: false,
        })
        throw err
      }
    },
    async fetchPhenos() {
      const config = useConfigStore()

      try {
        const data = await d3.csv<Pheno, PhenoCSVColumns | string>(
          `${this.apiUrl}${this.homologyId}/phenos.csv`,
          ({ mRNA_id, genome_nr, ...rest }) => {
            // Common fields.
            const data: Pheno = {
              mRNA_id: parseString(mRNA_id),
            }

            // Dataset specific fields.
            config.phenoColumns.forEach((column: PhenoColumn) => {
              const { field, type } = column

              if (type === 'categorical') {
                data[field] = parsePhenoCategorical(rest[field], column)
              }

              if (type === 'boolean') {
                data[field] = parsePhenoBoolean(rest[field], column)
              }
            })

            return data
          }
        )

        this.phenos = chain(data)
          // Sort by mRNA id in the order as defined by the dendrogram.
          .sortBy(({ mRNA_id }) => this.mrnaIdsLookup[mRNA_id])
          // Fix the index column.
          .map((pheno, index) => ({ ...pheno, index }))
          .value()
      } catch (err) {
        this.setError({
          message: 'Unable to fetch or parse phenotypes from API.',
          isFatal: true,
        })
        throw err
      }
    },
    async fetchVariablePositions() {
      try {
        type VariablePositionData = VariablePosition & {
          position: number
        }

        const data = await d3.csv<
          VariablePositionData,
          VariablePositionCSVColumns
        >(
          `${this.apiUrl}${this.homologyId}/variable.csv`,
          ({ informative, position, pheno_specific, ...bases }) => {
            const A = parseNumber(bases.A)
            const C = parseNumber(bases.C)
            const G = parseNumber(bases.G)
            const T = parseNumber(bases.T)
            const gap = parseNumber(bases.gap)

            const conservation = Math.max(A, C, G, T, gap)

            return {
              position: parseNumber(position),
              informative: parseOptionalBool(informative),
              pheno_specific: parseOptionalBool(pheno_specific),
              A,
              C,
              G,
              T,
              gap,
              conservation,
            }
          }
        )

        // Convert sparse array to array containing VariablePosition and null.
        this.variablePositions = times(this.geneLength, constant(null))
        data.forEach(({ position, ...varPos }) => {
          this.variablePositions[position - 1] = varPos
        })
      } catch (err) {
        this.setError({
          message:
            'Unable to fetch or parse variable position counts from API.',
          isFatal: true,
        })
        throw err
      }
    },
    async fetchHomology() {
      this.$patch({
        // Reset data
        alignedPositions: [],
        dendroCustom: null,
        dendroDefault: null,
        phenos: [],
        variablePositions: [],

        // Reset groups and selections that contain references to data.
        tree: 'dendroDefault',
        dendroCustomForSelectedPositions: [],
        groups: [],
        lastGroupId: 0,
        selectedDataIndices: [],
      })

      // Fetch new data for now selected homology id.
      // We fetch the dendrogram first, as it will define the order in which the other data will be stored.
      await this.fetchDendrogramDefault()

      this.resetSorting()
      this.resetPositionRegion()

      // The remaining requests are performed concurrently to speed up loading.
      await Promise.all([
        this.fetchAlignments(),
        this.fetchPhenos(),
        this.fetchVariablePositions(),
      ])
    },
    resetPositionRegion() {
      // Reset to default selection, clamped to gene length.
      this.positionRegion = DEFAULT_SELECTED_REGION.map((val) =>
        clamp(val, this.geneLength)
      ) as Range
    },
    resetSorting() {
      this.$patch({
        // Reset to default sorting as defined by dendrogram.
        sorting: DEFAULT_SORTING,
        sortedDataIndices: range(this.sequenceCount),
      })
    },
    dragStart(index: number, isCumulative = false) {
      this.dragInitialSelectedRowIndices = this.selectedDataIndices
      this.dragStartRowIndex = index
      this.dragIsCumulative = isCumulative

      this.dragUpdate(index)
    },
    dragUpdate(index: number) {
      if (this.dragStartRowIndex === null) return

      const draggedDataIndices = arraySlice(
        this.sortedDataIndicesCollapsed,
        this.dragStartRowIndex,
        index
      ).filter((data): data is number => {
        // We can't select groups.
        if (isGroup(data)) return false
        // We can't select rows that are already part of a group.
        if (this.rowColors[data]) return false
        return true
      })

      if (this.dragIsCumulative) {
        this.selectedDataIndices = union(
          this.dragInitialSelectedRowIndices,
          draggedDataIndices
        )
      } else {
        this.selectedDataIndices = draggedDataIndices
      }
    },
    dragEnd(index?: number) {
      if (index !== undefined) {
        this.dragUpdate(index)
      }

      this.dragInitialSelectedRowIndices = []
      this.dragStartRowIndex = null
      this.dragIsCumulative = false
    },
    createGroup(group: Omit<Group, 'id' | 'dataIndices'>) {
      this.groups = [
        ...this.groups,
        {
          ...group,
          dataIndices: this.selectedDataIndices,
          id: ++this.lastGroupId,
        },
      ]
    },
    deleteGroup(id: number) {
      // Reset reference it is is set to the group we are deleting.
      if (this.reference?.type === 'group' && this.reference.id === id) {
        this.reference = null
      }

      this.groups = this.groups.filter((group) => group.id !== id)
    },
    setError(error: AppError | null) {
      // We have an old and new error.
      if (this.error && error) {
        // Don't update, unless the severity increases.
        if (!this.error.isFatal && error.isFatal) {
          this.error = error
        }
        return
      }

      this.error = error
    },
  },
})
