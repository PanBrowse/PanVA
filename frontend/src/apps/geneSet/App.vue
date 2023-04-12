<script lang="ts">
import { mapState } from 'pinia'

import Layout from '@/components/Layout.vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import { useGeneSetStore } from '@/stores/geneSet'

import Sorting from './sidebar/Sorting.vue'
import Tips from './sidebar/Tips.vue'
import Chromosome from './visualizations/Chromosome.vue'
import Homologies from './visualizations/Homologies.vue'

export default {
  components: {
    Homologies,
    Chromosome,
    Layout,
    LoadingScreen,
    Sorting,
    Tips,
  },
  computed: {
    ...mapState(useGeneSetStore, ['isInitialized']),
  },
}
</script>

<template>
  <Layout v-if="isInitialized">
    <template #sidebar> <Sorting /><Tips /></template>
    <Chromosome />
    <!-- <Homologies /> -->
  </Layout>
  <LoadingScreen v-else>Loading homologies, please wait...</LoadingScreen>
</template>
