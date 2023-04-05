import { sortBy } from 'lodash'
import { defineStore } from 'pinia'

import { fetchGroupInfo, fetchHomologies, fetchSequences } from '@/api/geneSet'
import {
  chromosomesLookup,
  sortedChromosomesIdsLookup,
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
          sortedChromosomesIdsLookup(chrLookup)
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
          sortedChromosomesIdsLookup(chrLookup)

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
    getSortedChromosomeIds(key) {
      return this.sortedChromosomeIdsLookup[key]
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
    sortedChromosomeIdsLookup() {
      const lookup = {}

      Object.keys(this.chromosomeLookup).forEach((key) => {
        // console.log(key, this.chromosomeLookup[key], [
        //   ...Array(this.chromosomeLookup[key].length).keys(),
        // ])

        const ids = lookup[key] || [
          ...Array(this.chromosomeLookup[key].length).keys(),
        ]
        lookup[key] = ids
      })
      return lookup
    },
  },
})
