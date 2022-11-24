<script lang="ts">
import { mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { range } from 'lodash'
import { CELL_SIZE } from '@/config'
import ScrollSync from '@/components/ScrollSync.vue'

export default {
  name: 'LocusView',
  components: {
    ScrollSync,
  },
  computed: {
    ...mapState(useDataStore, ['sequenceCount']),
    // sequenceCount() {
    //   return 10
    // },
    ...mapWritableState(useDataStore, ['selectedRegion']),
    examples(): number[] {
      const [start, end] = this.selectedRegion
      return range(start, end + 1)
    },
    cellSize() {
      return CELL_SIZE
    },
    contentHeight(): number {
      return this.sequenceCount * this.cellSize
    },
  },
  methods: {
    resetSelectionOne() {
      this.selectedRegion = [100, 150]
    },
    resetSelectionTwo() {
      this.selectedRegion = [60, 64]
    },
  },
}
</script>

<template>
  <a-card class="locus-view" title="Locus view" :bordered="false" size="small">
    <div class="header">
      <!--
      <p>Selected region: {{ selectedRegion }}</p>
      <a-button type="primary" @click="resetSelectionOne">
        Reset selection to 100-150
      </a-button>
      <a-button type="primary" @click="resetSelectionTwo">
        Reset selection to 60-64
      </a-button>
      -->
      <div style="height: 60px; background: red; flex: 0 0 150px">Dendro</div>
      <div style="height: 60px; background: orange; flex: 0 0 100px">
        Bipartite
      </div>
      <scroll-sync
        horizontal
        style="height: 60px; background: yellow; overflow: auto hidden"
      >
        <div
          :style="{
            width: examples.length * cellSize + 'px',
            background: 'gold',
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
        <scroll-sync
          horizontal
          style="background: yellow; overflow: auto hidden"
        >
          <div v-for="seq in sequenceCount" v-bind:key="seq" class="row">
            <div
              :style="{
                width: examples.length * cellSize + 'px',
                height: cellSize + 'px',
                fontSize: '10px',
                lineHeight: '10px',
                background: 'gold',
              }"
            >
              Row {{ seq }}
            </div>
          </div>
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
