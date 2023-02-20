<script lang="ts">
import { mapActions, mapState } from 'pinia'
import { useDataStore } from '@/stores/data'

import CustomDendrogram from '@/components/sidebar/CustomDendrogram.vue'
import ErrorOverlay from '@/components/common/ErrorOverlay.vue'
import GeneOverview from '@/components/views/GeneOverview.vue'
import Groups from '@/components/sidebar/Groups.vue'
import HomologyInfo from '@/components/sidebar/HomologyInfo.vue'
import HomologySelect from '@/components/sidebar/HomologySelect.vue'
import Layout from '@/components/common/Layout.vue'
import LoadingScreen from '@/components/common/LoadingScreen.vue'
import LocusView from '@/components/views/LocusView.vue'
import Tips from '@/components/sidebar/Tips.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import ViewOptions from '@/components/sidebar/ViewOptions.vue'
import { useConfigStore } from '@/stores/config'

import { DEFAULT_TITLE } from '@/constants'

export default {
  components: {
    CustomDendrogram,
    ErrorOverlay,
    GeneOverview,
    Groups,
    HomologyInfo,
    HomologySelect,
    Layout,
    LoadingScreen,
    LocusView,
    Tips,
    Tooltip,
    ViewOptions,
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
      <Groups />
      <ViewOptions />
      <CustomDendrogram />
      <Tips />
    </template>

    <GeneOverview />
    <LocusView />
    <Tooltip />
  </Layout>
  <LoadingScreen v-else />

  <ErrorOverlay />
</template>
