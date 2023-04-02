import { sortBy } from 'lodash'
import { defineStore } from 'pinia'

import { fetchGroupInfo, fetchHomologies, fetchSequences } from '@/api/geneSet'
import type { GroupInfo, Homology, SequenceMetrics } from '@/types'

import { useGlobalStore } from './global'

export const useGeneSetStore = defineStore('geneSet', {
  state: () => ({
    // Data from API
    homologies: [] as Homology[],
    sequences: [] as SequenceMetrics[],
    groupInfo: [] as GroupInfo[],

    // Sorting
    sortedSequenceIndices: [
      //should be real incides instead of strings
      '1_A',
      '1_B',
      '1_C',
      '1_D',
      '1_U',
      '2_A',
      '2_B',
      '2_C',
      '2_D',
      '2_U',
      '3_A',
      '3_B',
      '3_C',
      '3_D',
      '3_U',
      '4_A',
      '4_B',
      '4_C',
      '4_D',
      '4_U',
      '5_A',
      '5_B',
      '5_C',
      '5_D',
      '5_U',
      'U',
    ],

    isInitialized: false,
  }),
  actions: {
    async initialize() {
      const global = useGlobalStore()

      try {
        this.homologies = sortBy(await fetchHomologies(), 'id')
      } catch (error) {
        global.setError({
          message: 'Could not load or parse homologies.',
          isFatal: true,
        })
        throw error
      }

      try {
        this.sequences = await fetchSequences()
      } catch (error) {
        global.setError({
          message: 'Could not load or parse sequence metrics.',
          isFatal: true,
        })
        throw error
      }

      try {
        this.groupInfo = await fetchGroupInfo()
      } catch (error) {
        global.setError({
          message: 'Could not load or parse group info.',
          isFatal: true,
        })
        throw error
      }

      this.isInitialized = true
    },
    getChromosome(key) {
      return this.chromosomeLookup[key]
    },
  },
  getters: {
    chromosomeLookup() {
      const lookup = {}
      this.sequences.forEach((sequence) => {
        const key = sequence.phasing_chromosome
        const rows = lookup[key] || []
        rows.push(sequence)
        lookup[key] = rows
      })
      return lookup
    },
  },
})
