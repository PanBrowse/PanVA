import axios from 'axios'
import { defineStore } from 'pinia'
import { parse_newick, type TreeNode } from 'biojs-io-newick'
import * as d3 from 'd3'

import {
  API_URL,
  CELL_THEMES,
  DEFAULT_SORTING,
  DEFAULT_SELECTED_REGION,
  TRANSITION_TIME,
} from '@/config'
import { defaultHomologyId, phenoColumns } from '@dataset'
import {
  parseBool,
  parseNumber,
  parseOptionalBool,
  parseString,
} from '@/helpers/parse'
import type {
  AlignedPosition,
  AlignedPositionsCSVColumns,
  DataIndexCollapsed,
  Dendro,
  Group,
  Homology,
  mRNAid,
  Nucleotide,
  Pheno,
  PhenoColumn,
  PhenoColumnData,
  PhenoCSVColumns,
  Range,
  Sequence,
  SequenceCSVColumns,
  Sorting,
  VarPosCount,
  VarPosCountCSVColumns,
} from '@/types'
import {
  chain,
  clamp,
  constant,
  filter,
  range,
  reverse,
  sortBy,
  times,
  union,
  xor,
} from 'lodash'
import arrayFlip from '@/helpers/arrayFlip'
import { medianRight } from '@/helpers/medianRight'
import { zipEqual } from '@/helpers/zipEqual'
import { sortingPayload } from '@/helpers/sorting'
import { leafNodes } from '@/helpers/dendro'
import { arraySlice } from '@/helpers/arraySlice'
import { isGroup } from '@/helpers/isGroup'

type NucleotideColorFunc = (nucleotide: Nucleotide) => string
type CellThemeName = keyof typeof CELL_THEMES

export const useDataStore = defineStore('data', {
  state: () => ({
    // Data that is fetched once from the API.
    homologies: [] as Homology[],
    coreSNP: null as TreeNode | null,

    // Data that is fetched from the API using `homologyId`.
    // We don't keep data for previous homology ids because of memory consumption.
    alignedPositions: [] as AlignedPosition[],
    dendroCustom: null as Dendro | null,
    dendroDefault: null as Dendro | null,
    phenos: [] as Pheno[],
    sequences: [] as Sequence[],
    varPosCount: [] as VarPosCount[],
    // This is populated by taking the leaf nodes from dendroDefault.
    mrnaIds: [] as mRNAid[],

    // API fetching state.
    hasError: false,

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
    selectedRegion: DEFAULT_SELECTED_REGION,
    // Checkboxes above the positions.
    selectedPositions: [] as number[],

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
    homologyId: defaultHomologyId,
    referenceMrnaId: null as mRNAid | null,
    transitionsEnabled: true,
  }),
  getters: {
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
    sortedRowPositions(): number[] {
      /**
       * TODO: Try to deprecate this function.
       * Two separate approaches will make for confusing code.
       */

      /**
       * Given a list of unsorted mRNA ids [a,b,c,d,e] and a target order of [e,b,d,a,c].
       * This function returns a mapping of `mRNA ids index` => `draw position`, which
       * can be used when you iterate over an unsorted data array.
       * [
       *   0 => 3, // mRNA ids index 0 (a) is on draw position 3
       *   1 => 1, // mRNA ids index 1 (b) is on draw position 1
       *   2 => 4, // mRNA ids index 2 (c) is on draw position 4
       *   3 => 2, // mRNA ids index 3 (d) is on draw position 2
       *   4 => 0, // mRNA ids index 4 (e) is on draw position 0
       * ]
       */
      return arrayFlip(this.sortedDataIndices)
    },
    sortedRowPositionsCollapsed(): number[] {
      /**
       * TODO: Try to deprecate this function.
       * Two separate approaches will make for confusing code.
       */

      /**
       * This returns the same mapping as `sortedRowPositions`, but with collapsed
       * groups placed together in an array in the correct drawing position.
       *
       * Given a list of unsorted mRNA ids [a,b,c,d,e] and a target order of [e,b,d,a,c],
       * but with a group containing [b,d,c] this function returns:
       * [
       *   0 => 2, // mRNA ids index 0 (a) is on draw position 2
       *   1 => 1, // mRNA ids index 1 (b) is on draw position 1
       *   2 => 1, // mRNA ids index 2 (c) is on draw position 1
       *   3 => 1, // mRNA ids index 3 (d) is on draw position 1
       *   4 => 0, // mRNA ids index 4 (e) is on draw position 0
       * ]
       */
      return []
    },
    mrnaIdsLookup: (state) => {
      /**
       * We need to sort many data sets by the order as defined in `this.mrnaIds`.
       * Instead of using `this.mrnaIds.indexOf(mRNA_id)` as a sorting method,
       * which is O(n), we can use `this.mrnaIdsLookup[mRNA_id]`, which is O(1).
       * This brings down the total computation time from O(n^2) to O(2n).
       */
      return state.mrnaIds.reduce((acc, mrnaId, index) => {
        acc[mrnaId] = index
        return acc
      }, {} as Record<string, number>)
    },
    homology: (state) => {
      // This will return undefined if the homologies have not yet loaded.
      return state.homologies.find(
        ({ homology_id }) => homology_id === state.homologyId
      )
    },
    selectedRegionLength(): number {
      const [start, end] = this.selectedRegion
      return end - start + 1
    },
    sequenceCount(): number {
      return this.mrnaIds.length
    },
    geneLength(): number {
      if (this.sequences) {
        return this.sequences[0].nuc_trimmed_seq.length
      }
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
    referenceMrnaNucleotideAtPosition() {
      if (!this.referenceMrnaId) {
        throw new Error(
          'Should only be called if there is a referenceMrnaId set.'
        )
      }

      const mrnaIndex = this.mrnaIds.indexOf(this.referenceMrnaId)

      return (position: number) => {
        const { nucleotide } =
          this.alignedPositions[mrnaIndex * this.geneLength + position - 1]
        return nucleotide
      }
    },
    mrnaIdsSorted(): mRNAid[] {
      return this.sortedDataIndices.map((index) => this.mrnaIds[index])
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
        this.sortedDataIndices = reverse(this.sortedDataIndices)
        return
      }

      // Sorting by dendrogram is the default sorting, so we reset everything.
      if (sorting.field === 'dendro') {
        this.resetSorting()
        return
      }

      // First we update the sorting field to a new value.
      this.sorting = sorting

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
                .nucleotide
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
    toggleSelectedIndex(index: number) {
      this.selectedDataIndices = xor(this.selectedDataIndices, [index])
    },
    async fetchHomologyIds() {
      try {
        const response = await axios.get<Homology[]>(`${API_URL}/homology_ids`)
        this.homologies = sortBy(response.data, 'name')
      } catch (err) {
        this.hasError = true
        throw err
      }
    },
    async fetchCoreSNP() {
      try {
        const response = await axios.get<string>(`${API_URL}/core_snp`)
        this.coreSNP = parse_newick(response.data)
      } catch (err) {
        this.hasError = true
        throw err
      }
    },
    async fetchAlignedPositions() {
      if (this.mrnaIds.length === 0) {
        throw new Error(
          'Order of mRNA ids must be known (by fetching dendrogram) before fetching aligned positions.'
        )
      }

      try {
        const data = await d3.csv<AlignedPosition, AlignedPositionsCSVColumns>(
          `${API_URL}/${this.homologyId}/al_pos`,
          ({
            genome_nr,
            informative,
            mRNA_id,
            nucleotide,
            pheno_specific,
            position,
            variable,
          }) => ({
            genome_nr: parseNumber(genome_nr),
            informative: parseOptionalBool(informative),
            mRNA_id: parseString(mRNA_id),
            nucleotide: parseString(nucleotide) as Nucleotide,
            pheno_specific: parseOptionalBool(pheno_specific),
            position: parseNumber(position),
            variable: parseBool(variable),
            index: 0, // Value gets generated later.
            mRNA_index: 0, // Value gets generated later.
          })
        )

        this.alignedPositions = chain(data)
          // 1. Sort by mRNA id in the order as defined by the dendrogram.
          // 2. Sort by the position within each mRNA id.
          .sortBy([({ mRNA_id }) => this.mrnaIdsLookup[mRNA_id], 'position'])
          // Fix the mRNA_index column.
          .map((alignedPosition, index) => ({
            ...alignedPosition,
            index,
            mRNA_index: this.mrnaIdsLookup[alignedPosition.mRNA_id],
          }))
          .value()
      } catch (err) {
        this.hasError = true
        throw err
      }
    },
    async fetchDendrogramDefault() {
      try {
        const data = await d3.json<Dendro>(
          `${API_URL}/${this.homologyId}/d3dendro`
        )
        if (data) {
          this.dendroDefault = data
          this.mrnaIds = leafNodes(data)
        } else {
          this.hasError = true
        }
      } catch (err) {
        this.hasError = true
        throw err
      }
    },
    async fetchDendrogramCustom(positions: number[]) {
      try {
        const response = await axios.post<Dendro>(
          `${API_URL}/${this.homologyId}/d3dendro`,
          {
            positions,
          }
        )
        this.dendroCustom = response.data
      } catch (err) {
        this.hasError = true
        throw err
      }
    },
    async fetchPhenos() {
      try {
        const data = await d3.csv<Pheno, PhenoCSVColumns | string>(
          `${API_URL}/${this.homologyId}/phenos`,
          ({ mRNA_id, genome_nr, ...rest }) => {
            // Common fields.
            const data: Pheno = {
              mRNA_id: parseString(mRNA_id),
              genome_nr: parseNumber(genome_nr),
              index: 0, // Value gets generated later.
            }

            // Dataset specific fields.
            phenoColumns.forEach((column) => {
              const { field, parser } = column as PhenoColumn
              data[field] = parser(rest[field])
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
        this.hasError = true
        throw err
      }
    },
    async fetchSequences() {
      try {
        const data = await d3.csv<Sequence, SequenceCSVColumns>(
          `${API_URL}/${this.homologyId}/sequences`,
          ({
            mRNA_id,
            nuc_trimmed_seq,
            nuc_seq,
            prot_trimmed_seq,
            prot_seq,
          }) => ({
            mRNA_id: parseString(mRNA_id),
            nuc_trimmed_seq: parseString(nuc_trimmed_seq),
            nuc_seq: parseString(nuc_seq),
            prot_trimmed_seq: parseString(prot_trimmed_seq),
            prot_seq: parseString(prot_seq),
          })
        )

        // Sort by mRNA id in the order as defined by the dendrogram.
        this.sequences = sortBy(
          data,
          ({ mRNA_id }) => this.mrnaIdsLookup[mRNA_id]
        )
      } catch (err) {
        this.hasError = true
        throw err
      }
    },
    async fetchVarPosCount() {
      try {
        this.varPosCount = await d3.csv<VarPosCount, VarPosCountCSVColumns>(
          `${API_URL}/${this.homologyId}/var_pos_count`,
          ({ A, C, conservation, G, gap, informative, other, position, T }) =>
            ({
              position: parseNumber(position),
              informative: parseOptionalBool(informative),
              A: parseNumber(A),
              C: parseNumber(C),
              G: parseNumber(G),
              T: parseNumber(T),
              gap: parseNumber(gap),
              other: parseNumber(other),
              conservation: parseNumber(conservation),
            } as VarPosCount)
        )
      } catch (err) {
        this.hasError = true
        throw err
      }
    },
    async fetchHomology() {
      this.$patch({
        alignedPositions: [],
        dendroCustom: null,
        dendroDefault: null,
        phenos: [],
        selectedDataIndices: [],
        sequences: [],
        varPosCount: [],
      })

      // Fetch new data for now selected homology id.
      // We fetch the dendrogram first, as it will define the order in which the other data will be stored.
      await this.fetchDendrogramDefault()

      // Fetch the sequences after, so we can start displaying most visualizations early.
      await this.fetchSequences()

      this.resetSorting()
      this.resetSelectedRegion()

      // The remaining requests are performed concurrently to speed up loading.
      await Promise.all([
        this.fetchAlignedPositions(),
        this.fetchPhenos(),
        this.fetchVarPosCount(),
      ])
    },
    resetSelectedRegion() {
      // Reset to default selection, clamped to gene length.
      this.selectedRegion = DEFAULT_SELECTED_REGION.map((val) =>
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
      ).filter((data): data is number => !isGroup(data))

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
  },
})
