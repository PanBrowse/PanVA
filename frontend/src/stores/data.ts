import axios from 'axios'
import { defineStore } from 'pinia'
import { parse_newick, type TreeNode } from 'biojs-io-newick'
import * as d3 from 'd3'

import {
  API_URL,
  CELL_THEMES,
  DEFAULT_SELECTED_REGION,
  TRANSITION_TIME,
} from '@/config'
import { defaultSorting, defaultHomologyId, phenoColumns } from '@dataset'
import {
  parseBool,
  parseNumber,
  parseOptionalBool,
  parseString,
} from '@/helpers/parse'
import type {
  AlignedPosition,
  Dendro,
  Homology,
  mRNAid,
  Pheno,
  VarPosCount,
  Range,
  Nucleotide,
  PhenoCSVColumns,
  AlignedPositionsCSVColumns,
  VarPosCountCSVColumns,
  Sequence,
  SequenceCSVColumns,
  PhenoColumn,
  Sorting,
  PhenoColumnData,
} from '@/types'
import { clamp, map, orderBy, range, shuffle, uniq } from 'lodash'
import arrayFlip from '@/helpers/arrayFlip'
import { median } from '@/helpers/median'
import { zipEqual } from '@/helpers/zipEqual'

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

    // Visualization preferences.

    // API fetching state.
    hasError: false,

    // Application state.
    cellTheme: 'clustal' as CellThemeName,
    homologyId: defaultHomologyId,
    referenceMrnaId: null as mRNAid | null,
    selectedIds: [] as mRNAid[],
    selectedPositions: [] as number[],
    // The range is inclusive on both ends.
    selectedRegion: DEFAULT_SELECTED_REGION as Range,
    sorting: defaultSorting as Sorting,
    /**
     * Given a list of unsorted mRNA ids [a,b,c,d,e] and a target order of [e,b,d,a,c].
     * This field returns a mapping of `draw position` => `mRNA ids index`, which
     * can be used when you iterate over draw positions.
     * [
     *   0 => 4, // on draw position 0 is mRNA ids index 4 (e)
     *   1 => 1, // on draw position 1 is mRNA ids index 1 (b)
     *   2 => 3, // on draw position 2 is mRNA ids index 3 (d)
     *   3 => 0, // on draw position 3 is mRNA ids index 0 (a)
     *   4 => 2, // on draw position 4 is mRNA ids index 2 (c)
     * ]
     */
    sortedMrnaIndices: [] as number[],
    transitionsEnabled: true,
  }),
  getters: {
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
      return this.sequences.length
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
    mrnaIds(): mRNAid[] {
      if (this.sequences) {
        return map(this.sequences, 'mRNA_id')
      }
      return []
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
    sortedMrnaPositions(): number[] {
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
      return arrayFlip(this.sortedMrnaIndices)
    },
    mrnaIdsSorted(): mRNAid[] {
      return this.sortedMrnaIndices.map((index) => this.mrnaIds[index])
    },
  },
  actions: {
    changeSorting({ field, payload, desc }: Sorting) {
      // First we update the sorting field to a new value
      if (field === this.sorting.field && payload === this.sorting.payload) {
        // Same field and parameter, so we flip the `desc` flag.
        this.sorting = { field, payload, desc: !this.sorting.desc }
      } else {
        // Ensure `desc` flag is a boolean.
        this.sorting = { field, payload, desc: !!desc }
      }

      // We then sort the current rows with the updated sorting.
      if (this.sorting.field === 'pheno') {
        // Get the array of values in the currently sorted order.
        const values = this.sortedMrnaIndices.map<PhenoColumnData>(
          (index) => this.phenos[index][this.sorting.payload]
        )

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
          map.set(key, median(indices))
        })

        // Generate tuple array of mrna index and sorted median index.
        const tuples = zipEqual(
          this.sortedMrnaIndices,
          values.map((value) => map.get(value))
        )

        // Sort by the sorted median index
        const sortOrder = this.sorting.desc ? 'desc' : 'asc'
        const sorted = orderBy(tuples, ([_index, value]) => value, sortOrder)

        // Pull out the mrna indices.
        this.sortedMrnaIndices = sorted.map(([index]) => index)
      } else {
        this.sortedMrnaIndices = shuffle(this.sortedMrnaIndices)
      }
    },
    async fetchHomologyIds() {
      try {
        const response = await axios.get<Homology[]>(`${API_URL}/homology_ids`)
        this.homologies = response.data
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
      try {
        this.alignedPositions = await d3.csv<
          AlignedPosition,
          AlignedPositionsCSVColumns
        >(
          `${API_URL}/${this.homologyId}/al_pos`,
          ({
            genome_nr,
            index,
            informative,
            mRNA_id,
            mRNA_index,
            nucleotide,
            pheno_specific,
            position,
            variable,
          }) => ({
            genome_nr: parseNumber(genome_nr),
            index: parseNumber(index),
            informative: parseOptionalBool(informative),
            mRNA_id: parseString(mRNA_id),
            mRNA_index: parseNumber(mRNA_index),
            nucleotide: parseString(nucleotide) as Nucleotide,
            pheno_specific: parseOptionalBool(pheno_specific),
            position: parseNumber(position),
            variable: parseBool(variable),
          })
        )
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
        this.phenos = await d3.csv<Pheno, PhenoCSVColumns | string>(
          `${API_URL}/${this.homologyId}/phenos`,
          ({ mRNA_id, genome_nr, ...rest }) => {
            // Common fields.
            const data: Pheno = {
              mRNA_id: parseString(mRNA_id),
              genome_nr: parseNumber(genome_nr),
              index: parseNumber(genome_nr) - 1,
            }

            // Dataset specific fields.
            phenoColumns.forEach((column) => {
              const { field, parser } = column as PhenoColumn
              data[field] = parser(rest[field])
            })

            return data
          }
        )
      } catch (err) {
        this.hasError = true
        throw err
      }
    },
    async fetchSequences() {
      try {
        this.sequences = await d3.csv<Sequence, SequenceCSVColumns>(
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
        selectedIds: [],
        sequences: [],
        varPosCount: [],
      })

      // Fetch new data for now selected homology id.
      // We fetch the sequences first, so we can start displaying most visualizations early.
      await this.fetchSequences()
      this.$patch({
        // Reset to default selection, clamped to gene length.
        selectedRegion: DEFAULT_SELECTED_REGION.map((val) =>
          clamp(val, this.geneLength)
        ) as Range,
        sorting: defaultSorting,
        sortedMrnaIndices: range(this.sequenceCount),
      })

      // The remaining requests are performed concurrently to speed up loading.
      await Promise.all([
        this.fetchAlignedPositions(),
        this.fetchDendrogramDefault(),
        this.fetchPhenos(),
        this.fetchVarPosCount(),
      ])
    },
  },
})
