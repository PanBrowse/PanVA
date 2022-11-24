<script lang="ts">
import { mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { range } from 'lodash'

export default {
  name: 'LocusView',
  computed: {
    ...mapWritableState(useDataStore, ['selectedRegion']),
    examples(): number[] {
      const [start, end] = this.selectedRegion
      return range(start, end + 1)
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
      <p>Selected region: {{ selectedRegion }}</p>
      <a-button type="primary" @click="resetSelectionOne">
        Reset selection to 100-150
      </a-button>
      <a-button type="primary" @click="resetSelectionTwo">
        Reset selection to 60-64
      </a-button>
    </div>
    <div class="content">
      <div class="long">
        <p v-for="n in examples" v-bind:key="n">Card content line {{ n }}</p>
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

  .content {
    overflow-y: auto;
  }
}
</style>
