import { defineStore } from 'pinia'

import { AVAILABLE_APPS } from '@/constants'
import type { App, AppError } from '@/types'

import { useConfigStore } from './config'
import { useGeneSetStore } from './geneSet'
import { useHomologyStore } from './homology'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    error: null as AppError | null,
    isInitialized: false,
    selectedApp: null as string | null,
  }),
  getters: {
    currentApp(): App | undefined {
      if (this.selectedApp) {
        return AVAILABLE_APPS.find(({ id }) => id === this.selectedApp)
      }
    },
    enabledApps(): App[] {
      const config = useConfigStore()
      return AVAILABLE_APPS.filter(({ id }) => config.apps.includes(id))
    },
  },
  actions: {
    setError(error: AppError | null) {
      // We have an old and new error.
      if (this.error && error) {
        // Don't update, unless the severity increases.
        if (!this.error.isFatal && error.isFatal) {
          this.error = error
        }
        return
      }

      this.error = error
    },
    async initialize() {
      const config = useConfigStore()
      if (await config.loadConfig()) {
        // Single app, automatically select it.
        if (this.enabledApps.length === 1) {
          this.switchToApp(this.enabledApps[0].id)
        }

        this.isInitialized = true
      }
    },
    switchToOverview() {
      this.selectedApp = null
    },
    switchToApp(app: string) {
      if (app === 'homology') {
        this.switchToHomologyApp()
      } else if (app === 'geneSet') {
        this.switchToGeneSetApp()
      }
    },
    async switchToHomologyApp(homologyId?: string) {
      this.selectedApp = 'homology'

      const homology = useHomologyStore()
      await homology.initialize(homologyId)
    },
    async switchToGeneSetApp() {
      this.selectedApp = 'geneSet'

      const geneSet = useGeneSetStore()
      await geneSet.initialize()
    },
  },
})
