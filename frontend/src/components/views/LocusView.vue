<script lang="ts">
import Bipartite from '@/components/visualizations/Bipartite.vue'
import Tree from '@/components/visualizations/Tree.vue'
import Heatmap from '@/components/visualizations/Heatmap.vue'
import HeatmapHeader from '@/components/visualizations/HeatmapHeader.vue'
import TreeLabels from '@/components/visualizations/TreeLabels.vue'
import Names from '@/components/visualizations/Names.vue'
import PhenoBoolean from '@/components/visualizations/PhenoBoolean.vue'
import PhenoCategorical from '@/components/visualizations/PhenoCategorical.vue'
import PhenoLabels from '@/components/visualizations/PhenoLabels.vue'
import ScrollSync from '@/components/common/ScrollSync.vue'
import { mapActions, mapState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { useConfigStore } from '@/stores/config'

export default {
  components: {
    Bipartite,
    Heatmap,
    HeatmapHeader,
    Names,
    PhenoBoolean,
    PhenoCategorical,
    PhenoLabels,
    ScrollSync,
    Tree,
    TreeLabels,
  },
  computed: {
    ...mapState(useConfigStore, ['phenoColumns']),
  },
  methods: {
    ...mapActions(useDataStore, ['dragEnd']),
    onMouseUp() {
      // We should be able to release the mouse anywhere and have the selection drag end.
      this.dragEnd()
    },
  },
  mounted() {
    document.body.addEventListener('mouseup', this.onMouseUp)
  },
  unmounted() {
    document.body.removeEventListener('mouseup', this.onMouseUp)
  },
}
</script>

<template>
  <a-card class="locus-view" title="Locus view" :bordered="false" size="small">
    <div class="header">
      <TreeLabels />
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
        <Tree />
        <Bipartite />
        <Names />
        <scroll-sync
          horizontal
          style="overflow: auto hidden; min-width: 120px"
          class="custom-scrollbar"
        >
          <Heatmap />
        </scroll-sync>
        <template v-for="(column, index) in phenoColumns">
          <PhenoBoolean
            v-bind:key="column.field"
            :id="index"
            :field="column.field"
            :labels="column.labels"
            v-if="column.type === 'boolean'"
          />
          <PhenoCategorical
            v-bind:key="column.field"
            :id="index"
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
    align-items: flex-end;
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
