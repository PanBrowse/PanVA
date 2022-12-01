<script lang="ts">
import { mapActions, mapState } from 'pinia'
import { useDataStore } from '@/stores/data'

import GeneOverview from '@/components/GeneOverview.vue'
import HomologyInfo from '@/components/HomologyInfo.vue'
import HomologySelect from '@/components/HomologySelect.vue'
import Layout from '@/components/Layout.vue'
import LocusView from '@/components/LocusView.vue'

// import { DATASET } from '@/config'

export default {
  name: 'App',
  components: {
    GeneOverview,
    HomologySelect,
    HomologyInfo,
    Layout,
    LocusView,
  },
  // metaInfo: {
  //   title: DATASET.title,
  // },
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
    <LocusView />

    <a-card title="Additional card" :bordered="false" size="small">
      <p>Content</p>
    </a-card>
  </Layout>
</template>
