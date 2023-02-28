import type {
  Config,
  ConfigMetadata,
  ConfigAnnotation,
  ConfigTree,
} from '@/types'
import { defineStore } from 'pinia'

// @ts-ignore
import schema from '../config.schema.json'
import Ajv from 'ajv'
import { useDataStore } from './data'

export const useConfigStore = defineStore('config', {
  state: () => ({
    alignmentMetadata: [] as ConfigMetadata[],
    annotations: [] as ConfigAnnotation[],
    apiUrl: '/api/' as string,
    defaultHomologyId: null as number | null,
    defaultSequenceMetadataColumns: [] as string[],
    sequenceMetadata: [] as ConfigMetadata[],
    title: '' as string,
    trees: [] as ConfigTree[],
    variableMetadata: [] as ConfigMetadata[],
  }),
  getters: {
    alignmentMetadataLookup(): Record<string, ConfigMetadata> {
      return Object.fromEntries(
        this.alignmentMetadata.map((metadata) => [metadata.column, metadata])
      )
    },
    sequenceMetadataLookup(): Record<string, ConfigMetadata> {
      return Object.fromEntries(
        this.sequenceMetadata.map((metadata) => [metadata.column, metadata])
      )
    },
    variableMetadataLookup(): Record<string, ConfigMetadata> {
      return Object.fromEntries(
        this.variableMetadata.map((metadata) => [metadata.column, metadata])
      )
    },
  },
  actions: {
    async loadConfig() {
      const { setError } = useDataStore()

      // Fetch config.json, but bypass the browser cache.
      const resp = await fetch('config.json', { cache: 'no-store' })

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
        console.error(validate.errors)
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
