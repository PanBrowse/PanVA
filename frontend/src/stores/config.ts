import Ajv from 'ajv'
import { isArray, mergeWith } from 'lodash'
import { defineStore } from 'pinia'

import type {
  Config,
  ConfigAnnotation,
  ConfigMetadata,
  ConfigTree,
} from '@/types'

// @ts-ignore
import schema from '../schema.config.json'
import { useGlobalStore } from './global'

export const useConfigStore = defineStore('config', {
  state: () => ({
    apiUrl: '/api/' as string,
    apps: ['homology'] as string[],
    homology: {
      alignmentMetadata: [] as ConfigMetadata[],
      annotations: [] as ConfigAnnotation[],
      defaultId: null as string | null,
      defaultSequenceMetadataColumns: [] as string[],
      homologyMetadata: [] as ConfigMetadata[],
      sequenceMetadata: [] as ConfigMetadata[],
      trees: [] as ConfigTree[],
      variableMetadata: [] as ConfigMetadata[],
    },
    title: 'PanVA' as string,
  }),
  getters: {
    sequenceMetadataLookup(): Record<string, ConfigMetadata> {
      return Object.fromEntries(
        this.homology.sequenceMetadata.map((metadata) => [
          metadata.column,
          metadata,
        ])
      )
    },
  },
  actions: {
    async loadConfig() {
      const { setError } = useGlobalStore()

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

      this.$patch((state) =>
        // Merge the provided config with the default config.
        mergeWith(state, config, (objValue, srcValue) => {
          if (isArray(objValue)) return srcValue
        })
      )

      return true
    },
  },
})
