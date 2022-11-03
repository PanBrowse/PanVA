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
    sequences: [] as Sequence[],
    varPosCount: [] as VarPosCount[],
    phenos: [] as Pheno[],
    dendroDefault: null as Dendro | null,
    dendroCustom: null as Dendro | null,

    // Visualization preferences.

    // API fetching state.
    hasData: false,
    isLoading: true,
    hasError: false,

    // Application state.
    homologyId: DEFAULT_HOMOLOGY_ID,
    selectedIds: [] as mRNAid[],
  }),
  getters: {},
  actions: {
    async fetchHomologyIds() {
      const response = await axios.get<Homology[]>(`${API_URL}/homology_ids`)
      this.homologies = response.data
    },
    async fetchCoreSNP() {
      const response = await axios.get<string>(`${API_URL}/core_snp`)
      this.coreSNP = parse_newick(response.data)
    },
    async fetchAlignedPositions() {
      this.alignedPositions = await csv<AlignedPosition>(
        `${API_URL}/${this.homologyId}/al_pos`,
        ({ informative, pheno_specific, variable, ...rest }) =>
          ({
            ...rest,
            informative: parseOptionalBool(informative),
            pheno_specific: parseOptionalBool(pheno_specific),
            variable: parseBool(variable),
          } as AlignedPosition)
      )
    },
    async fetchSequences() {
      this.sequences = await csv<Sequence>(
        `${API_URL}/${this.homologyId}/sequences`,
        ({ mRNA_id, nuc_trimmed_seq }) =>
          ({ mRNA_id, nuc_trimmed_seq } as Sequence)
      )
    },
    async fetchVarPosCount() {
      this.varPosCount = await csv<VarPosCount>(
        `${API_URL}/${this.homologyId}/var_pos_count`,
        ({ informative, ...rest }) =>
          ({
            // Convert all values to a number.
            ...mapValues(rest, parseInt),
            informative: parseOptionalBool(informative),
          } as VarPosCount)
      )
    },
    async fetchPhenos() {
      this.phenos = await csv<Pheno>(
        `${API_URL}/${this.homologyId}/phenos`,
        ({ genome_nr, pheno_node_id, ...rest }) => rest as Pheno
      )
    },
    async fetchDendrogramDefault() {
      const data = await json<Dendro>(`${API_URL}/${this.homologyId}/d3dendro`)
      if (data) {
        this.dendroDefault = data
      } else {
        this.hasError = true
      }
    },
    async fetchDendrogramCustom(positions: number[]) {
      const response = await axios.post<Dendro>(
        `${API_URL}/${this.homologyId}/d3dendro`,
        {
          positions,
        }
      )
      this.dendroCustom = response.data
    },
  },
})
