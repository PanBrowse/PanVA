import { sortBy } from 'lodash'
import { defineStore } from 'pinia'

import { fetchGroupInfo, fetchHomologies, fetchSequences } from '@/api/geneSet'
import {
  chromosomesLookup,
  groupInfosLookup,
  sequencesIdLookup,
  sortedGroupInfosLookup,
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
    chromosomes: [] as Number,
    numberOfChromosomes: 0,

    // Sorting
    sorting: 'genome_number',
    sortedChromosomeSequenceIndices: {},
    sortedMrnaIndices: {},

    // Clustering
    linkage: 1,

    //Context
    percentageGC: true,

    isInitialized: false,
  }),
  actions: {
    async initialize() {
      const global = useGlobalStore()

      this.chromosomes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] // to-do: get from data!
      this.numberOfChromosomes = this.chromosomes.length

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

      // constants
      const chrLookup = chromosomesLookup(this.sequences)
      const grInfoLookup = groupInfosLookup(this.groupInfo)
      const seqLookup = sequencesIdLookup(chrLookup)

      try {
        // const chrLookup = chromosomesLookup(this.sequences)
        this.sortedChromosomeSequenceIndices =
          sortedSequenceIdsLookup(chrLookup)
      } catch (error) {
        global.setError({
          message: 'Could not parse sorted chromosome sequence ids.',
          isFatal: true,
        })
        throw error
      }

      try {
        this.sortedMrnaIndices = sortedGroupInfosLookup(grInfoLookup, seqLookup)
      } catch (error) {
        global.setError({
          message: 'Could not parse sorted chromosome mrna ids.',
          isFatal: true,
        })
        throw error
      }

      this.isInitialized = true
    },
    changeSorting(sorting) {
      // Update the sorting
      this.sorting = sorting

      const chrLookup = chromosomesLookup(this.sequences)
      const seqLookup = sequencesIdLookup(chrLookup)
      const grInfoLookup = groupInfosLookup(this.groupInfo)

      // default sorting
      if (sorting === 'genome_number_asc') {
        const grInfoLookup = groupInfosLookup(this.groupInfo)

        this.sortedChromosomeSequenceIndices =
          sortedSequenceIdsLookup(chrLookup)
        this.sortedMrnaIndices = sortedGroupInfosLookup(grInfoLookup, seqLookup)

        return
      }

      // reverse sorting
      if (sorting === 'genome_number_desc') {
        console.log('seqLookup', seqLookup[5])

        const objectMap = (obj, fn) =>
          Object.fromEntries(
            Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)])
          )

        this.sortedChromosomeSequenceIndices = objectMap(
          this.sortedChromosomeSequenceIndices,
          (v) => [...v].reverse()
        )
        console.log(
          'reversed sortedChromosomeSequenceIndices',
          this.sortedChromosomeSequenceIndices[5]
        )

        // update mrnaIdLookup
        const seqLookupNew = {} // need to update old?
        Object.keys(seqLookup).forEach((chr) => {
          const chrObj = {}

          Object.keys(seqLookup[chr]).forEach((key) => {
            const idx = seqLookup[chr][key]

            chrObj[key] = this.sortedChromosomeSequenceIndices[chr][idx]
          })
          seqLookupNew[chr] = chrObj
        })

        this.sortedMrnaIndices = sortedGroupInfosLookup(
          grInfoLookup,
          seqLookupNew
        )
        // console.log('mrna new', this.sortedMrnaIndices)

        return
      }
    },
    deleteChromosome(chr) {
      console.log('delete chromosome', chr)
      const chromosomesUpdated = [...this.chromosomes]
      const value = parseInt(chr.split('chr')[1])
      const index = chromosomesUpdated.indexOf(value)

      if (index > -1) {
        // only splice array when item is found
        chromosomesUpdated.splice(index, 1) // 2nd parameter means remove one item only
      }

      this.numberOfChromosomes = chromosomesUpdated.length
      this.chromosomes = chromosomesUpdated
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
