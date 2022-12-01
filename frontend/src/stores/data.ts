import axios from 'axios'
import { defineStore } from 'pinia'
import { parse_newick, type TreeNode } from 'biojs-io-newick'
import * as d3 from 'd3'

import {
  API_URL,
  CELL_THEMES,
  DATASET,
  DEFAULT_SELECTED_REGION,
} from '@/config'
import {
  parseBool,
  parseNumber,
  parseOptionalBool,
  parseString,
} from '@/helpers/d3'
import type {
  AlignedPosition,
  Dendro,
  Homology,
  mRNAid,
  Pheno,
  VarPosCount,
  Range,
  Nucleotide,
  Virulence,
  PhenoCSVColumns,
  AlignedPositionsCSVColumns,
  VarPosCountCSVColumns,
} from '@/types'
import { clamp } from 'lodash'

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
    varPosCount: [] as VarPosCount[],
    phenos: [] as Pheno[],
    dendroDefault: null as Dendro | null,
    dendroCustom: null as Dendro | null,

    // Visualization preferences.

    // API fetching state.
    hasError: false,

    // Application state.
    homologyId: DATASET.defaultHomologyId,
    selectedIds: [] as mRNAid[],
    selectedRegion: DEFAULT_SELECTED_REGION as Range,
    cellTheme: 'default' as CellThemeName,
  }),
  getters: {
    homology: (state) => {
      // This will return undefined if the homologies have not yet loaded.
      return state.homologies.find(
        ({ homology_id }) => homology_id === state.homologyId
      )
    },
    sequenceCount(): number {
      return this.homology?.members || 0
    },
    geneLength(): number {
      if (this.homology) {
        return this.alignedPositions.length / this.homology.members
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
  },
  actions: {
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
            nucleotide,
            pheno_specific,
            position,
            variable,
          }) => ({
            genome_nr: parseNumber(genome_nr),
            index: parseNumber(index),
            informative: parseOptionalBool(informative),
            mRNA_id: parseString(mRNA_id),
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
        this.phenos = await d3.csv<Pheno, PhenoCSVColumns>(
          `${API_URL}/${this.homologyId}/phenos`,
          ({ mRNA_id, species, strain_name, virulence }) => ({
            mRNA_id: parseString(mRNA_id),
            species: parseString(species),
            strain_name: parseString(strain_name),
            virulence: parseString(virulence) as Virulence,
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
      // Reset to initial data state.
      this.$patch({
        alignedPositions: [],
        dendroCustom: null,
        dendroDefault: null,
        phenos: [],
        varPosCount: [],
      })

      // Fetch new data for now selected homology id.
      // The requests are performed concurrently to speed up loading.
      await Promise.all([
        this.fetchAlignedPositions(),
        this.fetchDendrogramDefault(),
        this.fetchPhenos(),
        this.fetchVarPosCount(),
      ])

      // Reset application state.
      this.$patch({
        selectedIds: [],
        // Reset to default selection, clamped to gene length.
        selectedRegion: DEFAULT_SELECTED_REGION.map((val) =>
          clamp(val, this.geneLength)
        ) as Range,
      })
    },
  },
})
