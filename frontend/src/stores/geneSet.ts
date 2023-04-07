import { sortBy } from 'lodash'
import { defineStore } from 'pinia'

import { fetchGroupInfo, fetchHomologies, fetchSequences } from '@/api/geneSet'
import {
  chromosomesLookup,
  sortedSequenceIdsLookup,
} from '@/helpers/chromosome'
import type { GroupInfo, Homology, SequenceMetrics } from '@/types'

import { useGlobalStore } from './global'

export const useGeneSetStore = defineStore('geneSet', {
  state: () => ({
    // Data from API
    homologies: [] as Homology[],
    sequences: [] as SequenceMetrics[],
    groupInfo: [] as GroupInfo[],

    // Sorting
    sorting: 'genome_number',
    sortedChromosomeSequenceIndices: {},

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

      try {
        const chrLookup = chromosomesLookup(this.sequences)
        this.sortedChromosomeSequenceIndices =
          sortedSequenceIdsLookup(chrLookup)
      } catch (error) {
        global.setError({
          message: 'Could not parse sorted chromosome sequence ids.',
          isFatal: true,
        })
        throw error
      }

      this.isInitialized = true
    },
    changeSorting(sorting) {
      // Update the sorting
      this.sorting = sorting

      // default sorting
      if (sorting === 'genome_number_asc') {
        const chrLookup = chromosomesLookup(this.sequences)
        this.sortedChromosomeSequenceIndices =
          sortedSequenceIdsLookup(chrLookup)

        return
      }

      // reverse sorting
      if (sorting === 'genome_number_desc') {
        const objectMap = (obj, fn) =>
          Object.fromEntries(
            Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)])
          )

        this.sortedChromosomeSequenceIndices = objectMap(
          this.sortedChromosomeSequenceIndices,
          (v) => [...v].reverse()
        )
        return
      }
    },
    getChromosome(key) {
      return this.chromosomeLookup[key]
    },
    getGroupInfo(key) {
      return this.groupInfoLookup[key]
    },
  },
  getters: {
    chromosomeLookup() {
      /**
       * Returns all sequences per chromosome
       */
      const lookup = {}
      this.sequences.forEach((sequence) => {
        const key = sequence.phasing_chromosome
        const rows = lookup[key] || []
        rows.push(sequence)
        lookup[key] = rows
      })
      return lookup
    },
    sequenceIdLookup() {
      /**
       * Returns a mapping of sequence ids and their initial order per chromosome
       */
      const lookup = {}
      Object.keys(this.chromosomeLookup).forEach((key) => {
        const object = this.chromosomeLookup[key].reduce(
          (obj, item, dataIndex) =>
            Object.assign(obj, { [item.sequence_id]: dataIndex }),
          {}
        )

        lookup[key] = object
      })

      return lookup
    },
    groupInfoLookup() {
      /**
       * Returns all mrNAs per chromosome
       */
      const lookup = {}
      this.groupInfo.forEach((info) => {
        const key = info.phasing_chromosome
        const rows = lookup[key] || []
        rows.push(info)
        lookup[key] = rows
      })
      return lookup
    },
    sortedGroupInfoLookup() {
      /**
       * Returns intitial sorting indices of gene set per chromosome
       */
      const lookup = {}
      const that = this
      Object.keys(this.groupInfoLookup).forEach((key) => {
        const groupLookup = this.groupInfoLookup[key]
        const ids =
          lookup[key] ||
          groupLookup.map(function (item) {
            const newKey = `${item.genome_number}_${item.sequence_number}`
            if (key != 'unphased') {
              return that.sequenceIdLookup[key][newKey]
            } else {
              return -99 //map unphased to -99
            }
          })

        lookup[key] = ids
      })

      return lookup
    },
  },
})
