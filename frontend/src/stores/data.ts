import { defineStore } from 'pinia'
import * as d3 from 'd3'

import {
  CELL_THEMES,
  DEFAULT_SORTING,
  DEFAULT_SELECTED_REGION,
  TRANSITION_TIME,
} from '@/constants'
import { h } from 'vue'
import type {
  DataIndexCollapsed,
  TreeNode,
  Group,
  Homology,
  mRNAid,
  Nucleotide,
  Metadata,
  Range,
  Sorting,
  VariablePosition,
  AppError,
  FilterPosition,
  TreeOption,
  Reference,
  GroupReference,
  DataReference,
  ConfigMetadata,
  MetadataQuantitative,
} from '@/types'
import {
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
import { Button as AButton, Progress as AProgress } from 'ant-design-vue'
import {
  CheckCircleOutlined,
  Loading3QuartersOutlined,
} from '@ant-design/icons-vue'

import { notification } from 'ant-design-vue'
import arrayFlip from '@/helpers/arrayFlip'
import { medianRight } from '@/helpers/medianRight'
import { zipEqual } from '@/helpers/zipEqual'
import { naturalSort, sortingPayload } from '@/helpers/sorting'
import { leafNodes } from '@/helpers/tree'
import { arraySlice } from '@/helpers/arraySlice'
import { isGroup } from '@/helpers/isGroup'
import { useConfigStore } from './config'
import { sortNucleotideString } from '@/helpers/nucleotide'
import {
  fetchAlignments,
  fetchCoreSNP,
  fetchDendrogramCustom,
  fetchDendrogramDefault,
  fetchHomologies,
  fetchMetadata,
  fetchVariablePositions,
} from '@/helpers/api'
import { homologyName } from '@/helpers/homology'
import { ProgressPromise } from '@prezly/progress-promise'

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
    metadata: [] as Metadata[],
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
     * This variable returns a mapping of `draw position` => `data index`, which
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
    visibleMetadataColumns: [] as string[],
    tree: 'dendroDefault' as TreeOption,
    homologyId: null as number | null,
    reference: null as Reference | null,
    transitionsEnabled: true,

    // Indicates if the data store contains all data to render the layout with all views.
    isInitialized: false,

    // Increments on each homology group load, and is used to determine if a load result
    // should still be used and presented to the user, or if they have already requested
    // another homology group.
    homologyLoadId: 0,
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
    groupLookup() {
      /**
       * Mapping of dataIndex => Group | null.
       */
      const result: (Group | null)[] = times(this.sequenceCount, constant(null))

      this.groups.forEach((group) => {
        group.dataIndices.forEach((index) => {
          result[index] = group
        })
      })

      return result
    },
    rowColors(): string[] {
      /**
       * Mapping of dataIndex => color.
       */
      return this.groupLookup.map((group) => {
        if (group && group.isColorized) return group.color
        return ''
      })
    },
    mrnaIdsLookup(): Record<string, number> {
      /**
       * We need to sort many data sets by the order as defined in `this.mrnaIds`.
       * Instead of using `this.mrnaIds.indexOf(mRNA_id)` as a sorting method,
       * which is O(n), we can use `this.mrnaIdsLookup[mRNA_id]`, which is O(1).
       * This brings down the total computation time from O(n^2) to O(2n).
       */
      return Object.fromEntries(
        this.mrnaIds.map((mrnaId, dataIndex) => [mrnaId, dataIndex])
      )
    },
    homology(): Homology | undefined {
      // This will return undefined if the homologies have not yet loaded.
      return this.homologies.find(
        ({ homology_id }) => homology_id === this.homologyId
      )
    },
    filterPositions() {
      return (positions: number[]) => {
        if (this.positionFilter !== 'all') {
          const column = this.positionFilter
          return positions.filter((pos) => {
            const varPos = this.variablePositions[pos - 1]
            if (!varPos) return false
            if (column === 'variable') return true
            return varPos.properties[column]
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
      if (this.homology) return this.homology.alignment_length
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
    selectedDataIndicesSet(): Set<number> {
      // Array.includes is O(n) while Set.has is O(1).
      return new Set(this.selectedDataIndices)
    },
    metadataConfigLookup() {
      const config = useConfigStore()
      return Object.fromEntries(
        config.metadata.map((metadata) => [metadata.column, metadata])
      )
    },
    visibleMetadata(): ConfigMetadata[] {
      // Maintain selection order.
      return this.visibleMetadataColumns.map(
        (column) => this.metadataConfigLookup[column]
      )
    },
  },
  actions: {
    changeSorting(sorting: Sorting) {
      // Check if the requested sorting equals the current sorting.
      if (
        sorting.name === this.sorting.name &&
        sortingPayload(sorting) === sortingPayload(this.sorting)
      ) {
        // Same name and payload, so we reverse the current sorting.
        // But we don't do this for the tree, that is static.
        if (
          !['dendroDefault', 'dendroCustom', 'coreSNP'].includes(sorting.name)
        ) {
          this.sortedDataIndices = reverse(this.sortedDataIndices)
        }
        return
      }

      // Sorting by dendrogram is the default sorting, so we reset everything.
      if (sorting.name === 'dendroDefault') {
        // Reset to default sorting as defined by dendrogram.
        this.$patch({
          sorting: DEFAULT_SORTING,
          sortedDataIndices: range(this.sequenceCount),
        })
        return
      }

      // First we update the sorting to a new value.
      this.sorting = sorting

      // Sorting by custom dendrogram should not take current sorting into account.
      if (sorting.name === 'dendroCustom' && this.dendroCustom) {
        // The leaf nodes of a dendrogram are mRNA ids.
        this.sortedDataIndices = leafNodes(this.dendroCustom).map(
          (mrnaId) => this.mrnaIdsLookup[mrnaId]
        )
        return
      }

      // Sorting by coreSNP should not take current sorting into account.
      if (sorting.name === 'coreSNP' && this.coreSNP) {
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

      // Sorting by mrnaId should not take current sorting into account.
      if (sorting.name === 'mrnaId') {
        this.sortedDataIndices = naturalSort(this.mrnaIds).map(
          (mrnaId) => this.mrnaIdsLookup[mrnaId]
        )
        return
      }

      // Sorting by quantitative metadata should not take current sorting into account.
      if (sorting.name === 'metadata') {
        const metadataConfig = this.metadataConfigLookup[sorting.column]
        if (metadataConfig.type === 'quantitative') {
          this.sortedDataIndices = sortBy(
            this.sortedDataIndices,
            (index) =>
              this.metadata[index][sorting.column] as MetadataQuantitative
          )
          return
        }
      }

      // Get the array of values in the currently sorted order.
      const values = (() => {
        if (this.sorting.name === 'metadata') {
          const column = this.sorting.column
          // Get the array of values in the currently sorted order.
          return this.sortedDataIndices.map(
            (index) => this.metadata[index][column]
          )
        }

        if (this.sorting.name === 'position') {
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
    async initializeApp() {
      const config = useConfigStore()

      if (await config.loadConfig()) {
        const homologies = sortBy(await fetchHomologies(), [
          'name',
          'homology_id',
        ])
        const coreSNP = await fetchCoreSNP()

        // Use the configured default metadata columns.
        const visibleMetadataColumns = config.defaultMetadataColumns

        // Update the store.
        this.$patch({
          coreSNP,
          homologies,
          visibleMetadataColumns,
        })

        // Use the configured defaultHomologyId or default to the first homology from `homologies`.
        const homologyId =
          config.defaultHomologyId !== null &&
          // Make sure the configured homology id exists.
          homologies.find(
            ({ homology_id }) => homology_id === config.defaultHomologyId
          )
            ? config.defaultHomologyId
            : homologies[0].homology_id

        this.loadHomologyGroup(homologyId)
      }
    },
    async loadHomologyGroup(homologyId: number) {
      // Remember the load id for this call.
      const loadId = ++this.homologyLoadId

      const homology = this.homologies.find(
        ({ homology_id }) => homology_id === homologyId
      )!

      const showNotification = (percent: number = 0) => {
        // User as already switched to a different homology group.
        if (this.homologyLoadId !== loadId) return

        // Don't show notifications on initial load.
        if (!this.isInitialized) return

        if (percent < 100) {
          notification.open({
            key: 'homology',
            message: `Loading homology group ${homologyName(homology)}.`,
            description: () => h(AProgress, { percent, showInfo: false }),
            btn: () =>
              h(
                AButton,
                {
                  onClick: () => {
                    // Increment the load id so the result of the
                    // current load is not handled anymore.
                    this.homologyLoadId++

                    notification.close('homology')
                  },
                },
                { default: () => 'Cancel' }
              ),
            placement: 'bottomRight',
            duration: null,
            closeIcon: () => null,
            icon: () =>
              h(Loading3QuartersOutlined, {
                style: 'color: var(--ant-primary-color)',
                spin: true,
              }),
          })
        } else {
          notification.open({
            key: 'homology',
            message: `Loaded homology group ${homologyName(homology)}.`,
            description: () => h(AProgress, { percent, showInfo: false }),
            btn: () =>
              h(
                AButton,
                { onClick: () => notification.close('homology') },
                { default: () => 'Close' }
              ),
            placement: 'bottomRight',
            duration: 1,
            closeIcon: () => null,
            icon: () =>
              h(CheckCircleOutlined, {
                style: 'color: var(--ant-success-color)',
              }),
          })
        }
      }

      // Open notification and show initial progress.
      showNotification()

      await ProgressPromise.all([
        fetchDendrogramDefault(homologyId),
        fetchAlignments(homologyId),
        fetchMetadata(homologyId),
        fetchVariablePositions(homologyId),
      ])
        .then(
          ([dendroDefault, alignments, meta, varPos]) => {
            // User as already switched to a different homology group.
            if (this.homologyLoadId !== loadId) return

            const geneLength = homology.alignment_length
            const sequenceCount = homology.members

            // Get mRNA id order from default dendrogram.
            const mrnaIds = leafNodes(dendroDefault)
            const mrnaIdsLookup = Object.fromEntries(
              mrnaIds.map((mrnaId, dataIndex) => [mrnaId, dataIndex])
            )

            // Extract genomeNrs and nucleotides from alignments.
            const sortedAlignments = sortBy(
              alignments,
              // 1. Sort by mRNA id in the order as defined by the dendrogram.
              // 2. Sort by the position within each mRNA id.
              [({ mRNA_id }) => mrnaIdsLookup[mRNA_id], 'position']
            )
            const genomeNrs = range(
              0,
              geneLength * sequenceCount,
              geneLength
            ).map((index) => sortedAlignments[index].genome_nr)
            const alignedPositions = sortedAlignments.map(
              ({ nucleotide }) => nucleotide
            )

            // Sort metadata.
            const metadata = sortBy(
              meta,
              ({ mrnaId }) => mrnaIdsLookup[mrnaId]
            ).map(({ metadata }) => metadata)

            // Convert sparse array to array containing VariablePosition and null.
            const variablePositions: (VariablePosition | null)[] = times(
              geneLength,
              constant(null)
            )
            varPos.forEach(({ position, ...varPos }) => {
              variablePositions[position - 1] = varPos
            })

            // User as already switched to a different homology group.
            if (this.homologyLoadId !== loadId) return

            const positionRegion = DEFAULT_SELECTED_REGION.map((val) =>
              clamp(val, geneLength)
            ) as Range

            this.$patch({
              alignedPositions,
              dendroCustom: null,
              dendroCustomForSelectedPositions: [],
              dendroDefault,
              genomeNrs,
              groups: [],
              homologyId,
              isInitialized: true,
              lastGroupId: 0,
              metadata,
              mrnaIds,
              positionFilter: 'all',
              positionRegion,
              reference: null,
              selectedDataIndices: [],
              selectedPositions: [],
              sortedDataIndices: range(sequenceCount),
              sorting: DEFAULT_SORTING,
              tree: 'dendroDefault',
              variablePositions,
            })
          },
          () => {
            // User as already switched to a different homology group.
            if (this.homologyLoadId !== loadId) return

            notification.close('homology')

            this.setError({
              message: `Unable to load the data for homology group ${homologyName(
                homology
              )}.`,
              isFatal: !this.isInitialized,
            })
          },
          (percent) => showNotification(percent)
        )
        .catch((error) => {
          // User as already switched to a different homology group.
          if (this.homologyLoadId !== loadId) return

          this.setError({
            message: `There was an error processing the data for homology group ${homologyName(
              homology
            )}.`,
            isFatal: true,
          })
          throw error
        })
    },
    async loadCustomDendrogram() {
      if (this.homologyId === null) return

      // Store current homology id.
      const homologyId = this.homologyId

      try {
        const data = await fetchDendrogramCustom(
          this.homologyId,
          this.selectedPositions
        )

        // Make sure user didn't switch homology groups in the mean time.
        if (homologyId !== this.homologyId) return

        this.dendroCustom = data
        this.dendroCustomForSelectedPositions = this.selectedPositions

        // Automatically switch to the custom dendrogram.
        this.tree = 'dendroCustom'
        this.changeSorting({ name: 'dendroCustom' })
      } catch (err) {
        this.setError({
          message: 'Unable to fetch or parse custom dendrogram from API.',
          isFatal: false,
        })
        throw err
      }
    },
  },
})
