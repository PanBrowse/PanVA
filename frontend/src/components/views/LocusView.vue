<script lang="ts">
import { phenoColumns } from '@dataset'

import Bipartite from '@/components/visualizations/Bipartite.vue'
import Dendrogram from '@/components/visualizations/Dendrogram.vue'
import Heatmap from '@/components/visualizations/Heatmap.vue'
import HeatmapHeader from '@/components/visualizations/HeatmapHeader.vue'
import LocusOptions from '@/components/visualizations/LocusOptions.vue'
import Names from '@/components/visualizations/Names.vue'
import PhenoBoolean from '@/components/visualizations/PhenoBoolean.vue'
import PhenoCategorical from '@/components/visualizations/PhenoCategorical.vue'
import PhenoLabels from '@/components/visualizations/PhenoLabels.vue'
import ScrollSync from '@/components/common/ScrollSync.vue'

export default {
  components: {
    Bipartite,
    Dendrogram,
    Heatmap,
    HeatmapHeader,
    LocusOptions,
    Names,
    PhenoBoolean,
    PhenoCategorical,
    PhenoLabels,
    ScrollSync,
  },
  computed: {
    phenoColumns() {
      return phenoColumns
    },
  },
}
</script>

<template>
  <a-card class="locus-view" title="Locus view" :bordered="false" size="small">
    <div class="header">
      <div style="height: 60px; flex: 0 0 520px"><LocusOptions /></div>
      <scroll-sync
        horizontal
        style="overflow: auto hidden; min-width: 120px"
        class="custom-scrollbar"
      >
        <HeatmapHeader />
      </scroll-sync>
      <PhenoLabels />
    </div>

    <div class="content-wrapper">
      <div class="content">
        <Dendrogram />
        <Bipartite />
        <Names />
        <scroll-sync
          horizontal
          style="overflow: auto hidden; min-width: 120px"
          class="custom-scrollbar"
        >
          <Heatmap />
        </scroll-sync>
        <template v-for="column in phenoColumns">
          <PhenoBoolean
            v-bind:key="column.field"
            :field="column.field"
            v-if="column.type === 'boolean'"
          />
          <PhenoCategorical
            v-bind:key="column.field"
            :field="column.field"
            :width="column.width"
            v-if="column.type === 'categorical'"
          />
        </template>
      </div>
    </div>
  </a-card>
</template>

<style lang="scss">
.locus-view {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;

  .ant-card-head {
    flex: 0 0 auto;
  }

  .ant-card-body {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .header {
    display: flex;
    flex: 0 0 auto;
    overflow: hidden;
  }

  .content-wrapper {
    overflow-y: auto;
    overflow-x: hidden;
  }

  .content {
    display: flex;
    align-items: stretch;
  }
}
</style>
