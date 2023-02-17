<script lang="ts">
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'

import CustomDendrogram from '@/components/sidebar/CustomDendrogram.vue'
import ErrorOverlay from '@/components/common/ErrorOverlay.vue'
import GeneOverview from '@/components/views/GeneOverview.vue'
import Groups from '@/components/sidebar/Groups.vue'
import HomologyInfo from '@/components/sidebar/HomologyInfo.vue'
import HomologySelect from '@/components/sidebar/HomologySelect.vue'
import Layout from '@/components/common/Layout.vue'
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
    ...mapActions(useConfigStore, ['loadConfig']),
    ...mapActions(useDataStore, [
      'fetchHomologies',
      'fetchCoreSNP',
      'fetchHomology',
    ]),
  },
  computed: {
    ...mapState(useDataStore, ['homologies']),
    ...mapWritableState(useDataStore, ['homologyId', 'visibleMetadataColumns']),
    ...mapState(useConfigStore, [
      'defaultHomologyId',
      'defaultMetadataColumns',
      'metadata',
      'title',
    ]),
  },
  async created() {
    if (await this.loadConfig()) {
      await this.fetchHomologies()

      this.fetchCoreSNP()

      // Change the visible metadata columns to the configured default.
      this.visibleMetadataColumns = this.defaultMetadataColumns

      // Use the configured defaultHomologyId or default to the first homology from `homologies`.
      this.homologyId = this.defaultHomologyId || this.homologies[0].homology_id
    }
  },
  watch: {
    homologyId() {
      this.fetchHomology()
    },
  },
}
</script>

<template>
  <Layout>
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
    <ErrorOverlay />
  </Layout>
</template>
