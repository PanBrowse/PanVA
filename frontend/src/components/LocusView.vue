<script lang="ts">
import { mapState } from 'pinia'

import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/config'
import { phenoColumns } from '@dataset'

import Bipartite from '@/components/Bipartite.vue'
import Dendrogram from '@/components/Dendrogram.vue'
import Heatmap from '@/components/Heatmap.vue'
import Names from '@/components/Names.vue'
import PhenoBoolean from '@/components/PhenoBoolean.vue'
import PhenoCategorical from '@/components/PhenoCategorical.vue'
import PhenoLabels from '@/components/PhenoLabels.vue'
import ScrollSync from '@/components/ScrollSync.vue'

export default {
  components: {
    Bipartite,
    Dendrogram,
    Heatmap,
    Names,
    PhenoBoolean,
    PhenoCategorical,
    PhenoLabels,
    ScrollSync,
  },
  computed: {
    ...mapState(useDataStore, ['selectedRegionLength']),
    heatmapWidth(): number {
      return this.selectedRegionLength * CELL_SIZE
    },
    phenoColumns() {
      return phenoColumns
    },
  },
}
</script>

<template>
  <a-card class="locus-view" title="Locus view" :bordered="false" size="small">
    <div class="header">
      <div style="height: 60px; background: red; flex: 0 0 320px">Options</div>
      <div style="background: gold; flex: 0 0 200px">Names</div>
      <scroll-sync
        horizontal
        style="
          height: 60px;
          background: yellow;
          overflow: auto hidden;
          min-width: 200px;
        "
      >
        <div
          :style="{
            width: heatmapWidth + 'px',
          }"
        >
          Heatmap
        </div>
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
          style="background: yellow; overflow: auto hidden; min-width: 200px"
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
