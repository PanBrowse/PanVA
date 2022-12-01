<script lang="ts">
import { mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { sortBy } from 'lodash'
import type { Homology } from '@/types'

export default {
  name: 'DebugMenu',
  computed: {
    ...mapWritableState(useDataStore, ['selectedRegion']),
    sortedHomologies(): Homology[] {
      return sortBy(this.homologies, 'name')
    },
  },
}
</script>

<template>
  <div>
    <a-divider />

    <h3>Debug menu</h3>

    <a-button type="primary" @click="selectedRegion = [100, 500]">
      Change selection to 100-500
    </a-button>
  </div>
</template>
