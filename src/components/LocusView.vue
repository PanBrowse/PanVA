<script lang="ts">
import { mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'

export default {
  name: 'HomologyInfo',
  computed: {
    ...mapWritableState(useDataStore, ['selectedRegion']),
  },
  methods: {
    resetSelection() {
      this.selectedRegion = [100, 150]
    },
  },
}
</script>

<template>
  <a-card class="card" title="Locus view" :bordered="false" size="small">
    <div class="header">
      <p>Selected region: {{ selectedRegion }}</p>
      <a-button type="primary" @click="resetSelection">
        Reset selection to 100-150
      </a-button>
    </div>
    <div class="content">
      <div class="long">
        <p v-for="n in 40" v-bind:key="n">Card content line {{ n }}</p>
      </div>
    </div>
  </a-card>
</template>

<style lang="scss">
.card {
  overflow: hidden;
  display: flex;
  flex-direction: column;

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
