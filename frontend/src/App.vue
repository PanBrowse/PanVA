<script lang="ts">
import { mapActions, mapState } from 'pinia'
import { useDataStore } from '@/stores/data'

import Analytics from '@/components/sidebar/Analytics.vue'
import CustomDendrogram from '@/components/sidebar/CustomDendrogram.vue'
import ErrorOverlay from '@/components/common/ErrorOverlay.vue'
import GeneOverview from '@/components/views/GeneOverview.vue'
import Graphics from '@/components/sidebar/Graphics.vue'
import Groups from '@/components/sidebar/Groups.vue'
import HomologySelect from '@/components/sidebar/HomologySelect.vue'
import HomologyInfo from '@/components/sidebar/HomologyInfo.vue'
import Layout from '@/components/common/Layout.vue'
import Legends from '@/components/sidebar/Legends.vue'
import LoadingScreen from '@/components/common/LoadingScreen.vue'
import LocusView from '@/components/views/LocusView.vue'
import Tips from '@/components/sidebar/Tips.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import { useConfigStore } from '@/stores/config'

import { DEFAULT_TITLE } from '@/constants'

export default {
  components: {
    Analytics,
    CustomDendrogram,
    ErrorOverlay,
    GeneOverview,
    Graphics,
    Groups,
    HomologySelect,
    HomologyInfo,
    Layout,
    Legends,
    LoadingScreen,
    LocusView,
    Tips,
    Tooltip,
  },
  head() {
    return {
      title: this.title || DEFAULT_TITLE,
    }
  },
  methods: {
    ...mapActions(useDataStore, ['initializeApp']),
  },
  computed: {
    ...mapState(useDataStore, ['isInitialized']),
    ...mapState(useConfigStore, ['title']),
  },
  created() {
    this.initializeApp()
  },
}
</script>

<template>
  <Layout v-if="isInitialized">
    <template #sidebar>
      <HomologySelect />
      <HomologyInfo />
      <Legends />
      <Groups />
      <Analytics />
      <CustomDendrogram />
      <Graphics />

      <Tips />
    </template>

    <GeneOverview />
    <LocusView />
    <Tooltip />
  </Layout>
  <LoadingScreen v-else />

  <ErrorOverlay />
</template>
