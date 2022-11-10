<script lang="ts">
import { mapActions, mapState } from 'pinia'
import { useDataStore } from '@/stores/data'

import GeneOverview from '@/components/GeneOverview.vue'
import HomologyInfo from '@/components/HomologyInfo.vue'
import HomologySelect from '@/components/HomologySelect.vue'
import Layout from '@/components/Layout.vue'

export default {
  name: 'App',
  components: {
    GeneOverview,
    HomologySelect,
    HomologyInfo,
    Layout,
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
    <template #sider>
      <HomologySelect />
      <HomologyInfo />
    </template>

    <GeneOverview />

    <a-card title="Locus view" :bordered="false" size="small">
      <p>Card content</p>
      <p>Card content</p>
      <p>Card content</p>
    </a-card>
  </Layout>
</template>
