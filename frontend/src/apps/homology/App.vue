<script lang="ts">
import { mapState } from 'pinia'

import Layout from '@/components/Layout.vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import { useHomologyStore } from '@/stores/homology'

import Analytics from './sidebar/Analytics.vue'
import CustomDendrogram from './sidebar/CustomDendrogram.vue'
import Graphics from './sidebar/Graphics.vue'
import Groups from './sidebar/Groups.vue'
import HomologyInfo from './sidebar/HomologyInfo.vue'
import HomologySelect from './sidebar/HomologySelect.vue'
import Legends from './sidebar/Legends.vue'
import Tips from './sidebar/Tips.vue'
import GeneOverview from './views/GeneOverview.vue'
import LocusView from './views/LocusView.vue'

export default {
  components: {
    Analytics,
    CustomDendrogram,
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
  },
  computed: {
    ...mapState(useHomologyStore, ['isInitialized', 'homologyId']),
  },
}
</script>

<template>
  <Layout v-if="isInitialized" :key="`${homologyId}`">
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
  </Layout>
  <LoadingScreen v-else>Loading homology data, please wait...</LoadingScreen>
</template>
