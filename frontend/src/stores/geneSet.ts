import { sortBy } from 'lodash'
import { defineStore } from 'pinia'

import { fetchHomologies } from '@/api/geneSet'
import type { Homology } from '@/types'

import { useGlobalStore } from './global'

export const useGeneSetStore = defineStore('geneSet', {
  state: () => ({
    homologies: [] as Homology[],
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

      this.isInitialized = true
    },
  },
})
