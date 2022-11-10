import axios from 'axios'
import { defineStore } from 'pinia'
import { parse_newick, type TreeNode } from 'biojs-io-newick'
import { csv, json } from 'd3'
import { mapValues } from 'lodash'

import { API_URL, DEFAULT_HOMOLOGY_ID } from '@/config'
import { parseBool, parseOptionalBool } from '@/helpers/d3'

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
    homologyId: DEFAULT_HOMOLOGY_ID,
    selectedIds: [] as mRNAid[],
  }),
  getters: {
    homology: (state) => {
      // This will return undefined if the homologies have not yet loaded.
      return state.homologies.find(
        ({ homology_id }) => homology_id === state.homologyId
      )
    },
    geneLength(): number {
      if (this.homology) {
        return this.alignedPositions.length / this.homology.members
      }
      return 0
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
        this.alignedPositions = await csv<AlignedPosition>(
          `${API_URL}/${this.homologyId}/al_pos`,
          ({ informative, pheno_specific, variable, virulence, ...rest }) =>
            ({
              ...rest,
              informative: parseOptionalBool(informative),
              pheno_specific: parseOptionalBool(pheno_specific),
              variable: parseBool(variable),
            } as AlignedPosition)
        )
      } catch (err) {
        this.hasError = true
        throw err
      }
    },
    async fetchDendrogramDefault() {
      try {
        const data = await json<Dendro>(
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
        this.phenos = await csv<Pheno>(
          `${API_URL}/${this.homologyId}/phenos`,
          ({ genome_nr, pheno_node_id, ...rest }) => rest as Pheno
        )
      } catch (err) {
        this.hasError = true
        throw err
      }
    },
    async fetchVarPosCount() {
      try {
        this.varPosCount = await csv<VarPosCount>(
          `${API_URL}/${this.homologyId}/var_pos_count`,
          ({ informative, ...rest }) =>
            ({
              // Convert all values to a number.
              ...mapValues(rest, parseInt),
              informative: parseOptionalBool(informative),
            } as VarPosCount)
        )
      } catch (err) {
        this.hasError = true
        throw err
      }
    },
    async fetchHomology() {
      // Reset to initial state.
      this.alignedPositions = []
      this.varPosCount = []
      this.phenos = []
      this.dendroDefault = null
      this.dendroCustom = null

      // Fetch new data for now selected homology id.
      // The requests are performed concurrently to speed up loading.
      await Promise.all([
        this.fetchAlignedPositions(),
        this.fetchDendrogramDefault(),
        this.fetchPhenos(),
        this.fetchVarPosCount(),
      ])
    },
  },
})
