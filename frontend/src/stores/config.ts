import type { Config, PhenoColumn } from '@/types'
import { defineStore } from 'pinia'

// @ts-ignore
import schema from '../config.schema.json'
import Ajv from 'ajv'
import { useDataStore } from './data'

export const useConfigStore = defineStore('config', {
  state: () => ({
    apiUrl: '/api/' as string,
    title: '' as string,
    phenoColumns: [] as PhenoColumn[],
    defaultHomologyId: null as number | null,
  }),
  actions: {
    async loadConfig() {
      const { setError } = useDataStore()

      const resp = await fetch('config.json')

      // No custom config, so we are done.
      if (!resp.ok) return true

      // Load the custom config.
      const config = (await resp.json()) as Config

      // Validate content of config.
      const ajv = new Ajv()
      const validate = ajv.compile(schema)
      const isValid = validate(config)

      if (!isValid) {
        setError({
          message: 'Invalid runtime configuration found.',
          isFatal: true,
        })
        return false
      }

      // Ensure single trailing slash.
      if (config.apiUrl !== undefined) {
        config.apiUrl = config.apiUrl.replace(/\/*$/, '/')
      }

      this.$patch(config)
      return true
    },
  },
})
