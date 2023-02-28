import { defineStore } from 'pinia'
import * as d3 from 'd3'

import {
  CELL_THEMES,
  DEFAULT_SORTING,
  DEFAULT_SELECTED_REGION,
  TRANSITION_TIME,
  ANNOTATIONS_GRADIENT_COLORS,
} from '@/constants'
import { h } from 'vue'
import type {
  DataIndexCollapsed,
  Group,
  Homology,
  mRNAid,
  Nucleotide,
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
  SequenceFilter,
  Annotation,
  Alignment,
  Sequence,
  Tree,
} from '@/types'
import {
  clamp,
  constant,
  filter,
  flatten,
  pick,
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
  fetchAnnotations,
  fetchDendrogramCustom,
  fetchDendrogramDefault,
  fetchHomologies,
  fetchSequenceMetadata,
  fetchTrees,
  fetchVariablePositions,
} from '@/helpers/api'
import { ProgressPromise } from '@prezly/progress-promise'
import colorInterpolate from 'color-interpolate'

type NucleotideColorFunc = (nucleotide: Nucleotide) => string
type CellThemeName = keyof typeof CELL_THEMES

export const useDataStore = defineStore('data', {
  state: () => ({
    // Data that is fetched once from the API.
    homologies: [] as Homology[],
    trees: [] as Tree[],

    // Data that is fetched from the API using `homologyId`.
    // We don't keep data for previous homology ids because of memory consumption.
    alignedPositions: [] as Alignment[],
    annotations: [] as Annotation[],
    dendroCustom: null as Tree | null,
    dendroDefault: null as Tree | null,
    sequences: [] as Sequence[],
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

    // Filter sequences based on sequence metadata.
    sequenceFilters: [] as SequenceFilter[],

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
    annotationMrnaId: null as mRNAid | null,
    cellTheme: 'default' as CellThemeName,
    homologyId: null as number | null,
    keepSequenceFilters: false,
    reference: null as Reference | null,
    transitionsEnabled: true,
    selectedTree: 'dendroDefault' as TreeOption,
    visibleSequenceMetadataColumns: [] as string[],

    // Indicates if the data store contains all data to render the layout with all views.
    isInitialized: false,

    // Increments on each homology group load, and is used to determine if a load result
    // should still be used and presented to the user, or if they have already requested
    // another homology group.
    homologyLoadId: 0,
  }),
  getters: {
    sortedDataIndicesFiltered(): number[] {
      /**
       * Filters `sortedDataIndices` and removes data indices that don't match.
       */
      return this.sortedDataIndices.filter((dataIndex) =>
        this.sequenceFilters.every(({ column, operator, values }): boolean => {
          const value = this.sequences[dataIndex].metadata[column]
          switch (operator) {
            case 'between':
              return value !== null && value >= values[0] && value <= values[1]
            case 'equals':
              return value !== null && value === values[0]
            case 'greater-than':
              return value !== null && value > values[0]
            case 'less-than':
              return value !== null && value < values[0]
            case 'greater-than-equal':
              return value !== null && value >= values[0]
            case 'less-than-equal':
              return value !== null && value <= values[0]
            case 'in':
              return values.includes(`${value}`)
            case 'not-in':
              return !values.includes(`${value}`)
          }
        })
      )
    },
    tree(): Tree {
      if (this.selectedTree === 'dendroCustom') {
        if (this.dendroCustom === null) {
          throw new Error('Custom dendrogram is empty.')
        }

        return this.dendroCustom
      }

      if (this.selectedTree !== 'dendroDefault') {
        const tree = this.trees.find((tree) => tree.name === this.selectedTree)

        if (!tree) {
          throw new Error('Tree is empty.')
        }

        return tree
      }

      if (this.dendroDefault === null) {
        throw new Error('Default dendrogram is empty.')
      }

      return this.dendroDefault
    },
    groupsFiltered(): Group[] {
      /**
       * Filters `groups` and removes data indices that don't match the current sequence filters.
       * Groups that are left without any data indices are not returned.
       */
      const lookup = arrayFlip(this.sortedDataIndicesFiltered)

      return this.groups
        .map((group) => {
          const dataIndices = group.dataIndices.filter(
            (dataIndex) => lookup[dataIndex] !== undefined
          )
          return {
            ...group,
            dataIndices,
          }
        })
        .filter(({ dataIndices }) => dataIndices.length !== 0)
    },
    sortedDataIndicesCollapsed(): DataIndexCollapsed[] {
      /**
       * This returns the same mapping as `sortedDataIndicesFiltered`, but with
       * collapsed groups as a Group object in the correct row index.
       *
       * Given a list of unsorted mRNA ids [a,b,c,d,e] and a target order of [e,b,d,a,c],
       * but with a group containing [b,d,c] this function returns:
       * [
       *   0 => 4,     // on row index 0 is data index 4
       *   1 => Group, // on row index 1 is Group with indices [1,3,2] (b,d,c)
       *   2 => 0,     // on row index 2 is mRNA ids index 0 (a)
       * ]
       *
       * The group is placed at row index 1 because that is the median row index
       * in `sortedDataIndicesFiltered` after removing empty rows:
       */

      // Work on a copy of the original `sortedDataIndices`.
      const indices: (DataIndexCollapsed | null)[] = [
        ...this.sortedDataIndicesFiltered,
      ]

      // Lookup table for mRNA ids index => row index.
      const lookup = arrayFlip(this.sortedDataIndicesFiltered)

      // For each collapsed group.
      filter(this.groupsFiltered, 'isCollapsed').forEach((group) => {
        const { dataIndices } = group

        // Determine all row indices for this group's data indices.
        const rowIndices = dataIndices.map((dataIndex) => lookup[dataIndex])

        // Determine the median row index where to draw this group.
        const medianRowIndex = medianRight(rowIndices)

        // Set row index to null for all data indices of this group.
        rowIndices.forEach((rowIndex) => {
          indices[rowIndex] = null
        })

        // Add group at correct row index.
        indices[medianRowIndex] = group
      })

      // Remove null values. Any gaps in row indices will be removed.
      const condenced = indices.filter(
        (dataIndex): dataIndex is DataIndexCollapsed => dataIndex !== null
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
            return varPos.metadata[column]
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
    annotationColors(): string[] {
      const config = useConfigStore()
      const count = config.annotations.length
      const interpolation = colorInterpolate(ANNOTATIONS_GRADIENT_COLORS)
      if (count === 1) return [interpolation(0)]
      return range(count).map((index) => interpolation(index / (count - 1)))
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
            const { nucleotide } =
              this.alignedPositions[dataIndex * this.geneLength + position - 1]
            nucleotides[nucleotide] = true
          })

          return sortNucleotideString(Object.keys(nucleotides).join(''))
        })
      }

      if (this.reference.type === 'data') {
        return this.filteredPositions.map((position) => {
          const { dataIndex } = this.reference as DataReference

          const { nucleotide } =
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
    visibleSequenceMetadata(): ConfigMetadata[] {
      // Maintain selection order.
      const config = useConfigStore()
      return this.visibleSequenceMetadataColumns.map(
        (column) => config.sequenceMetadataLookup[column]
      )
    },
    annotation(): Annotation | null {
      if (this.annotationMrnaId) {
        return this.annotations.find(
          ({ mRNA_id }) => mRNA_id === this.annotationMrnaId
        )!
      }
      return null
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
        if (sorting.name !== 'tree') {
          this.sortedDataIndices = reverse(this.sortedDataIndices)
        }
        return
      }

      // Update the sorting
      this.sorting = sorting

      // Sorting by tree is handled differently.
      if (sorting.name === 'tree') {
        if (sorting.tree === 'dendroDefault') {
          // Reset to default sorting as defined by dendrogram.
          this.sortedDataIndices = range(this.sequenceCount)
        } else if (sorting.tree === 'dendroCustom') {
          if (this.dendroCustom) {
            // The leaf nodes of a dendrogram are mRNA ids.
            this.sortedDataIndices = leafNodes(this.dendroCustom.root).map(
              (mrnaId) => this.mrnaIdsLookup[mrnaId]
            )
          }
        } else {
          const tree = this.trees.find((tree) => tree.name === sorting.tree)
          if (tree) {
            this.sortedDataIndices = flatten(
              // The leaf nodes of custom trees are genome number strings.
              leafNodes(tree.root).map((leaf) => {
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
          }
        }

        // We are done sorting.
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
        const config = useConfigStore()
        const metadataConfig = config.sequenceMetadataLookup[sorting.column]
        if (metadataConfig.type === 'quantitative') {
          this.sortedDataIndices = sortBy(
            this.sortedDataIndices,
            (index) =>
              this.sequences[index].metadata[
                sorting.column
              ] as MetadataQuantitative
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
            (index) => this.sequences[index].metadata[column]
          )
        }

        if (this.sorting.name === 'position') {
          const position = this.sorting.position
          // Get the array of values in the currently sorted order.
          return this.sortedDataIndices.map<Nucleotide>((index) => {
            const { nucleotide } =
              this.alignedPositions[index * this.geneLength + position - 1]
            return nucleotide
          })
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
    createGroup(group: Omit<Group, 'id' | 'dataIndices' | 'size'>) {
      this.groups = [
        ...this.groups,
        {
          ...group,
          dataIndices: this.selectedDataIndices,
          size: this.selectedDataIndices.length,
          id: ++this.lastGroupId,
        },
      ]
      this.selectedDataIndices = []
    },
    deleteGroup(id: number) {
      // Reset reference it is is set to the group we are deleting.
      if (this.reference?.type === 'group' && this.reference.id === id) {
        this.reference = null
      }

      this.groups = this.groups.filter((group) => group.id !== id)
    },
    expandGroup(id: number) {
      const group = this.groups.find((group) => group.id === id)
      if (group) {
        group.dataIndices = [...group.dataIndices, ...this.selectedDataIndices]
        group.size = group.dataIndices.length
        this.selectedDataIndices = []
      }
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
    addSequenceFilter(filter: SequenceFilter) {
      this.sequenceFilters.push(filter)
    },
    async initializeApp() {
      const config = useConfigStore()
      if (await config.loadConfig()) {
        let homologies: Homology[]

        try {
          homologies = sortBy(await fetchHomologies(), ['name', 'homology_id'])
        } catch (error) {
          this.setError({
            message: 'Could not load or parse homologies.',
            isFatal: true,
          })
          throw error
        }

        const trees = await fetchTrees()
        if (trees.length !== config.trees.length) {
          this.setError({
            message: 'Some tree files could not be loaded or parsed.',
            isFatal: false,
          })
        }

        // Use the configured default sequence metadata columns.
        const visibleSequenceMetadataColumns =
          config.defaultSequenceMetadataColumns

        // Update the store.
        this.$patch({
          trees,
          homologies,
          visibleSequenceMetadataColumns,
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

        await this.loadHomologyGroup(homologyId)
      }
    },
    async loadHomologyGroup(homologyId: number) {
      // Remember the load id for this call.
      const loadId = ++this.homologyLoadId

      const homology = this.homologies.find(
        ({ homology_id }) => homology_id === homologyId
      )!
      const geneLength = homology.alignment_length
      const sequenceCount = homology.members

      const showNotification = (percent: number = 0) => {
        // User as already switched to a different homology group.
        if (this.homologyLoadId !== loadId) return

        // Don't show notifications on initial load.
        if (!this.isInitialized) return

        if (percent < 100) {
          notification.open({
            key: 'homology',
            message: `Loading homology group ${loadId}.`,
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
            message: `Loaded homology group ${loadId}.`,
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
        fetchAlignments(homologyId),
        fetchAnnotations(homologyId, geneLength),
        fetchDendrogramDefault(homologyId),
        fetchSequenceMetadata(homologyId),
        fetchVariablePositions(homologyId, geneLength),
      ])
        .then(
          ([
            alignments,
            annotations,
            dendro,
            sequenceMetadata,
            variablePositions,
          ]) => {
            // Get mRNA id order from default dendrogram.
            const mrnaIds = leafNodes(dendro)
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

            const alignedPositions = sortedAlignments.map((alignment) =>
              pick(alignment, ['nucleotide', 'metadata'])
            )

            // Sort metadata.
            const sequences = sortBy(
              sequenceMetadata,
              ({ mrnaId }) => mrnaIdsLookup[mrnaId]
            ).map((sequence) => pick(sequence, 'metadata'))

            const positionRegion = DEFAULT_SELECTED_REGION.map((val) =>
              clamp(val, geneLength)
            ) as Range

            // Optionally keep sequence filters between homology groups.
            const sequenceFilters = this.keepSequenceFilters
              ? this.sequenceFilters
              : []

            const dendroDefault: Tree = {
              name: 'dendroDefault',
              label: 'Dendrogram',
              root: dendro,
            }

            // User as already switched to a different homology group.
            if (this.homologyLoadId !== loadId) return

            this.$patch({
              alignedPositions,
              annotationMrnaId: null,
              annotations,
              dendroCustom: null,
              dendroCustomForSelectedPositions: [],
              dendroDefault,
              genomeNrs,
              groups: [],
              homologyId,
              isInitialized: true,
              lastGroupId: 0,
              mrnaIds,
              positionFilter: 'all',
              positionRegion,
              reference: null,
              selectedDataIndices: [],
              selectedPositions: [],
              selectedTree: 'dendroDefault',
              sequenceFilters,
              sequences,
              sortedDataIndices: range(sequenceCount),
              sorting: DEFAULT_SORTING,
              variablePositions,
            })
          },
          () => {
            // User as already switched to a different homology group.
            if (this.homologyLoadId !== loadId) return

            notification.close('homology')

            this.setError({
              message: `Unable to load the data for homology group ${loadId}.`,
              isFatal: !this.isInitialized,
            })
          },
          (percent) => showNotification(percent)
        )
        .catch((error) => {
          // User as already switched to a different homology group.
          if (this.homologyLoadId !== loadId) return

          this.setError({
            message: `There was an error processing the data for homology group ${loadId}.`,
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
        const dendro = await fetchDendrogramCustom(
          this.homologyId,
          this.selectedPositions
        )

        // Make sure user didn't switch homology groups in the mean time.
        if (homologyId !== this.homologyId) return

        this.dendroCustom = {
          name: 'dendroCustom',
          label: 'Custom dendrogram',
          root: dendro,
        }
        this.dendroCustomForSelectedPositions = this.selectedPositions

        // Automatically switch to the custom dendrogram.
        this.selectedTree = 'dendroCustom'
        this.changeSorting({ name: 'tree', tree: 'dendroCustom' })
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
