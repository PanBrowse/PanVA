<script lang="ts">
import { mapActions, mapState } from 'pinia'

import Gene from '@/apps/gene/App.vue'
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
    Gene,
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
    <Gene v-else-if="selectedApp === 'gene'" />
    <AppSelect v-else />
  </template>
  <LoadingScreen v-else />

  <Tooltip />
  <ErrorOverlay />
</template>
