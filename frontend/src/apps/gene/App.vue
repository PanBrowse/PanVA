<script lang="ts">
import { mapState } from 'pinia'

import Layout from '@/components/Layout.vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import { useGeneStore } from '@/stores/gene'

import Homologies from './visualizations/Homologies.vue'

export default {
  components: {
    Homologies,
    Layout,
    LoadingScreen,
  },
  computed: {
    ...mapState(useGeneStore, ['isInitialized']),
  },
}
</script>

<template>
  <Layout v-if="isInitialized">
    <Homologies />
  </Layout>
  <LoadingScreen v-else>Loading homologies, please wait...</LoadingScreen>
</template>
