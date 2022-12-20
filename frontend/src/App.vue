<script lang="ts">
import { mapActions, mapState } from 'pinia'
import { useDataStore } from '@/stores/data'

import DebugMenu from '@/components/DebugMenu.vue'
import GeneOverview from '@/components/GeneOverview.vue'
import HomologyInfo from '@/components/HomologyInfo.vue'
import HomologySelect from '@/components/HomologySelect.vue'
import Layout from '@/components/Layout.vue'
import LocusView from '@/components/LocusView.vue'
import LocusViewOptions from '@/components/LocusViewOptions.vue'
import Tooltip from '@/components/Tooltip.vue'

import { title } from '@dataset'

export default {
  components: {
    DebugMenu,
    GeneOverview,
    HomologySelect,
    HomologyInfo,
    Layout,
    LocusView,
    LocusViewOptions,
    Tooltip,
  },
  head: {
    title,
  },
  methods: {
    ...mapActions(useDataStore, [
      'fetchHomologyIds',
      'fetchCoreSNP',
      'fetchHomology',
    ]),
  },
  computed: {
    ...mapState(useDataStore, ['homologyId']),
  },
  created() {
    Promise.all([
      this.fetchHomologyIds(),
      this.fetchCoreSNP(),
      this.fetchHomology(),
    ])
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
      <LocusViewOptions />
      <DebugMenu />
    </template>

    <GeneOverview />
    <LocusView />
    <Tooltip />

    <!--
    <a-card title="Additional card" :bordered="false" size="small">
      <p>Content</p>
    </a-card>
    -->
  </Layout>
</template>
