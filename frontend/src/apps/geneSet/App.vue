<script lang="ts">
import { mapState } from 'pinia'

import Layout from '@/components/Layout.vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import { useGeneSetStore } from '@/stores/geneSet'

import ContextOptions from './sidebar/ContextOptions.vue'
import Filters from './sidebar/Filters.vue'
import Sorting from './sidebar/Sorting.vue'
import Unphased from './sidebar/Unphased.vue'
import ChromosomeDetails from './visualizations/ChromosomeDetails.vue'
import ChromosomeOverview from './visualizations/ChromosomeOverview.vue'
// import Homologies from './visualizations/Homologies.vue'

export default {
  components: {
    // Homologies,
    ChromosomeOverview,
    ChromosomeDetails,
    Layout,
    LoadingScreen,
    Sorting,
    Unphased,
    Filters,
    ContextOptions,
  },
  computed: {
    ...mapState(useGeneSetStore, ['isInitialized']),
  },
}
</script>

<template>
  <Layout v-if="isInitialized">
    <template #sidebar>
      <Filters />
      <Sorting />

      <ContextOptions />
      <Unphased />
    </template>
    <ChromosomeOverview />
    <ChromosomeDetails />
    <!-- <Homologies /> -->
  </Layout>
  <LoadingScreen v-else>Loading homologies, please wait...</LoadingScreen>
</template>
