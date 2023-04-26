<script lang="ts">
import { Col, Row } from 'ant-design-vue'
import { mapState } from 'pinia'

import Layout from '@/components/Layout.vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import { useGeneSetStore } from '@/stores/geneSet'

import ContextOptions from './sidebar/ContextOptions.vue'
import Filters from './sidebar/Filters.vue'
import GraphicsOptions from './sidebar/GraphicsOptions.vue'
import Sorting from './sidebar/Sorting.vue'
import Unphased from './sidebar/Unphased.vue'
import ChromosomeDetails from './visualizations/ChromosomeDetails.vue'
import ChromosomeOverview from './visualizations/ChromosomeOverview.vue'
import GroupInfoTable from './visualizations/GroupInfoTable.vue'
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
    GraphicsOptions,
    GroupInfoTable,
    ARow: Row,
    ACol: Col,
  },
  computed: {
    ...mapState(useGeneSetStore, ['isInitialized', 'showTable', 'showDetails']),
  },
}
</script>

<template>
  <Layout v-if="isInitialized">
    <template #sidebar>
      <Filters />
      <Sorting />
      <GraphicsOptions />
      <ContextOptions />
      <Unphased />
    </template>
    <ChromosomeOverview />
    <template v-if="showTable && showDetails">
      <ARow type="flex" :gutter="8">
        <ACol :span="12">
          <ChromosomeDetails />
        </ACol>
        <ACol :span="12">
          <GroupInfoTable />
        </ACol>
      </ARow>
    </template>
    <GroupInfoTable v-if="showTable && showDetails == false"></GroupInfoTable>
    <ChromosomeDetails
      v-if="showTable == false && showDetails"
    ></ChromosomeDetails>

    <!-- <Homologies /> -->
  </Layout>
  <LoadingScreen v-else>Loading homologies, please wait...</LoadingScreen>
</template>

<style>
.ant-layout-sider {
  background: #fafafa !important;
}
</style>
