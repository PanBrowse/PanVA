<script lang="ts">
import { mapActions, mapState } from 'pinia'

import GeneSet from '@/apps/geneSet/App.vue'
import Homology from '@/apps/homology/App.vue'
import AppSelect from '@/components/AppSelect.vue'
import ErrorOverlay from '@/components/ErrorOverlay.vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import Tooltip from '@/components/Tooltip.vue'
import { DEFAULT_TITLE } from '@/constants'
import { useConfigStore } from '@/stores/config'

import { useGlobalStore } from './stores/global'

export default {
  components: {
    AppSelect,
    ErrorOverlay,
    GeneSet,
    Homology,
    LoadingScreen,
    Tooltip,
  },
  head() {
    const baseTitle = this.title || DEFAULT_TITLE
    const title = this.currentApp
      ? `${baseTitle} - ${this.currentApp.name}`
      : baseTitle

    return {
      title,
    }
  },
  computed: {
    ...mapState(useGlobalStore, ['currentApp', 'selectedApp', 'isInitialized']),
    ...mapState(useConfigStore, ['title']),
  },
  methods: {
    ...mapActions(useGlobalStore, ['initialize']),
  },
  created() {
    this.initialize()
  },
}
</script>

<template>
  <template v-if="isInitialized">
    <Homology v-if="selectedApp === 'homology'" />
    <GeneSet v-else-if="selectedApp === 'geneSet'" />
    <AppSelect v-else />
  </template>
  <LoadingScreen v-else />

  <Tooltip />
  <ErrorOverlay />
</template>
