<script lang="ts">
import Bipartite from '@/components/visualizations/Bipartite.vue'
import Tree from '@/components/visualizations/Tree.vue'
import Heatmap from '@/components/visualizations/Heatmap.vue'
import HeatmapHeader from '@/components/visualizations/HeatmapHeader.vue'
import TreeLabels from '@/components/visualizations/TreeLabels.vue'
import Names from '@/components/visualizations/Names.vue'
import MetadataBoolean from '@/components/visualizations/MetadataBoolean.vue'
import MetadataCategorical from '@/components/visualizations/MetadataCategorical.vue'
import MetadataLabels from '@/components/visualizations/MetadataLabels.vue'
import MetadataQuantitative from '@/components/visualizations/MetadataQuantitative.vue'
import ScrollSync from '@/components/common/ScrollSync.vue'
import { mapActions, mapState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { useConfigStore } from '@/stores/config'
import { useTooltipStore } from '@/stores/tooltip'
import { Card } from 'ant-design-vue'

export default {
  components: {
    ACard: Card,
    Bipartite,
    Heatmap,
    HeatmapHeader,
    Names,
    MetadataBoolean,
    MetadataCategorical,
    MetadataLabels,
    MetadataQuantitative,
    ScrollSync,
    Tree,
    TreeLabels,
  },
  computed: {
    ...mapState(useConfigStore, ['metadata']),
  },
  methods: {
    ...mapActions(useDataStore, ['dragEnd']),
    ...mapActions(useTooltipStore, ['togglePinned']),
    onMouseUp() {
      // We should be able to release the mouse anywhere and have the selection drag end.
      this.dragEnd()
    },
    onKeyPress(event: KeyboardEvent) {
      if (event.code === 'KeyT') {
        this.togglePinned()
      }
    },
  },
  mounted() {
    document.body.addEventListener('mouseup', this.onMouseUp)
    document.body.addEventListener('keyup', this.onKeyPress)
  },
  unmounted() {
    document.body.removeEventListener('mouseup', this.onMouseUp)
    document.body.removeEventListener('keyup', this.onKeyPress)
  },
}
</script>

<template>
  <ACard class="locus-view" title="Locus view" :bordered="false" size="small">
    <div class="header">
      <TreeLabels />
      <scroll-sync
        horizontal
        style="overflow: auto hidden; min-width: 120px"
        class="custom-scrollbar"
      >
        <HeatmapHeader />
      </scroll-sync>
      <MetadataLabels />
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
        <template v-for="(column, index) in metadata">
          <MetadataBoolean
            v-bind:key="column.field"
            :id="index"
            :field="column.field"
            :labels="column.labels"
            v-if="column.type === 'boolean'"
          />
          <MetadataCategorical
            v-bind:key="column.field"
            :id="index"
            :field="column.field"
            :width="column.width"
            v-if="column.type === 'categorical'"
          />
          <MetadataQuantitative
            v-bind:key="column.field"
            :id="index"
            :field="column.field"
            :suffix="column.suffix"
            :decimals="column.decimals"
            :maxValue="column.maxValue"
            :width="column.width"
            v-if="column.type === 'quantitative'"
          />
        </template>
      </div>
    </div>
  </ACard>
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
