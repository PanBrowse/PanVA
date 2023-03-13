<script lang="ts">
import { Card } from 'ant-design-vue'
import { mapActions, mapState } from 'pinia'

import ScrollSync from '@/components/ScrollSync.vue'
import { useHomologyStore } from '@/stores/homology'
import { useTooltipStore } from '@/stores/tooltip'

import Bipartite from '../visualizations/Bipartite.vue'
import Heatmap from '../visualizations/Heatmap.vue'
import HeatmapHeader from '../visualizations/HeatmapHeader.vue'
import MetadataBoolean from '../visualizations/MetadataBoolean.vue'
import MetadataCategorical from '../visualizations/MetadataCategorical.vue'
import MetadataLabels from '../visualizations/MetadataLabels.vue'
import MetadataQuantitative from '../visualizations/MetadataQuantitative.vue'
import Names from '../visualizations/Names.vue'
import Tree from '../visualizations/Tree.vue'
import TreeLabels from '../visualizations/TreeLabels.vue'

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
    ...mapState(useHomologyStore, ['visibleSequenceMetadata']),
  },
  methods: {
    ...mapActions(useHomologyStore, ['dragEnd']),
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
    <ScrollSync horizontal group="locus-view" class="header scrollbars-hidden">
      <TreeLabels />
      <ScrollSync
        horizontal
        group="locus-heatmap"
        style="overflow: auto hidden; min-width: 200px"
      >
        <HeatmapHeader />
      </ScrollSync>
      <MetadataLabels />
    </ScrollSync>

    <ScrollSync horizontal group="locus-view" class="content-wrapper">
      <div class="content">
        <Tree />
        <Bipartite />
        <Names />
        <ScrollSync
          horizontal
          group="locus-heatmap"
          style="overflow: auto hidden; min-width: 200px"
          class="scrollbars-hidden"
        >
          <Heatmap />
        </ScrollSync>
        <template v-for="column in visibleSequenceMetadata">
          <MetadataBoolean
            v-bind:key="column.column"
            :column="column"
            v-if="column.type === 'boolean'"
          />
          <MetadataCategorical
            v-bind:key="column.column"
            :column="column"
            v-if="column.type === 'categorical'"
          />
          <MetadataQuantitative
            v-bind:key="column.column"
            :column="column"
            v-if="column.type === 'quantitative'"
          />
        </template>

        <!-- MetadataLabels padding-right, to prevent labels from being cut off. -->
        <div style="min-width: 32px"></div>
      </div>
    </ScrollSync>
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

    padding: 12px 0 0 12px !important;
  }

  .header {
    display: flex;
    flex: 0 0 auto;
    overflow: auto hidden;
    align-items: flex-end;
  }

  .content-wrapper {
    overflow: auto;
    overflow: overlay;
    padding-bottom: 12px;
  }

  .content {
    display: flex;
    align-items: stretch;
  }

  .scrollbars-hidden {
    -ms-overflow-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>
