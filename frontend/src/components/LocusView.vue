<script lang="ts">
import { mapState } from 'pinia'
import { useDataStore } from '@/stores/data'
import ScrollSync from '@/components/ScrollSync.vue'
import Heatmap from '@/components/Heatmap.vue'
import { CELL_SIZE } from '@/config'

export default {
  name: 'LocusView',
  components: {
    Heatmap,
    ScrollSync,
  },
  computed: {
    ...mapState(useDataStore, ['selectedRegion']),
    heatmapWidth(): number {
      const [start, end] = this.selectedRegion
      return (end - start + 1) * CELL_SIZE
    },
  },
}
</script>

<template>
  <a-card class="locus-view" title="Locus view" :bordered="false" size="small">
    <div class="header">
      <div style="height: 60px; background: red; flex: 0 0 150px">Dendro</div>
      <div style="height: 60px; background: orange; flex: 0 0 100px">
        Bipartite
      </div>
      <div style="background: gold; flex: 0 0 100px">Names</div>
      <scroll-sync
        horizontal
        style="height: 60px; background: yellow; overflow: auto hidden"
      >
        <div
          :style="{
            width: heatmapWidth + 'px',
          }"
        >
          Heatmap
        </div>
      </scroll-sync>
      <div style="height: 60px; background: lime; flex: 0 0 40px">Pheno 1</div>
      <div style="height: 60px; background: green; flex: 0 0 120px">
        Pheno 2
      </div>
      <div style="height: 60px; background: cyan; flex: 0 0 100px">Pheno 3</div>
    </div>

    <div class="content-wrapper">
      <div class="content">
        <div style="background: red; flex: 0 0 150px">Dendro</div>
        <div style="background: orange; flex: 0 0 100px">Bipartite</div>
        <div style="background: gold; flex: 0 0 100px">Names</div>
        <scroll-sync
          horizontal
          style="background: yellow; overflow: auto hidden"
        >
          <Heatmap />
        </scroll-sync>
        <div style="background: lime; flex: 0 0 40px">Pheno 1</div>
        <div style="background: green; flex: 0 0 120px">Pheno 2</div>
        <div style="background: cyan; flex: 0 0 100px">Pheno 3</div>
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
  }

  .content-wrapper {
    overflow-y: auto;
  }

  .content {
    display: flex;
    align-items: stretch;
  }
}
</style>
