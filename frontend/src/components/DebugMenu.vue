<script lang="ts">
import { mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { sortBy } from 'lodash'
import type { Homology } from '@/types'

export default {
  name: 'DebugMenu',
  computed: {
    ...mapState(useDataStore, ['sequenceCount', 'selectedRegionLength']),
    ...mapWritableState(useDataStore, ['selectedRegion']),
    sortedHomologies(): Homology[] {
      return sortBy(this.homologies, 'name')
    },
    cellCount(): number {
      return this.selectedRegionLength * this.sequenceCount
    },
  },
}
</script>

<template>
  <div>
    <a-divider />

    <h3>Debug</h3>

    <a-descriptions size="small" layout="horizontal" :column="1" bordered>
      <a-descriptions-item label="Cell count">
        {{ cellCount }}
      </a-descriptions-item>
    </a-descriptions>

    <br />

    <a-button type="primary" @click="selectedRegion = [100, 500]">
      Change selection to 100-500
    </a-button>
  </div>
</template>
