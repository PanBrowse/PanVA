<script lang="ts">
import { mapActions, mapState } from 'pinia'
import { useDataStore } from '@/stores/data'

import Dendrogram from '@/components/sidebar/Dendrogram.vue'
import GeneOverview from '@/components/views/GeneOverview.vue'
import Groups from '@/components/sidebar/Groups.vue'
import HomologyInfo from '@/components/sidebar/HomologyInfo.vue'
import HomologySelect from '@/components/sidebar/HomologySelect.vue'
import Layout from '@/components/common/Layout.vue'
import LocusView from '@/components/views/LocusView.vue'
import Tips from '@/components/sidebar/Tips.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import ViewOptions from '@/components/sidebar/ViewOptions.vue'

import { title } from '@dataset'

export default {
  components: {
    Dendrogram,
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
      <Groups />
      <ViewOptions />
      <Dendrogram />
      <Tips />
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
