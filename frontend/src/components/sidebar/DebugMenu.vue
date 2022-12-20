<script lang="ts">
import { mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { sortBy } from 'lodash'
import type { Homology } from '@/types'

import SidebarItem from '@/components/common/SidebarItem.vue'

export default {
  components: {
    SidebarItem,
  },
  computed: {
    ...mapState(useDataStore, ['sequenceCount', 'selectedRegionLength']),
    ...mapWritableState(useDataStore, [
      'shuffleSequences',
      'selectedRegion',
      'transitionsEnabled',
    ]),
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
  <SidebarItem title="Debug" isDefaultCollapsed>
    <a-space direction="vertical" :size="16">
      <a-descriptions size="small" layout="horizontal" :column="1" bordered>
        <a-descriptions-item label="Cell count">
          {{ cellCount }}
        </a-descriptions-item>
      </a-descriptions>

      <a-checkbox v-model:checked="transitionsEnabled"
        >Transitions enabled</a-checkbox
      >

      <a-checkbox v-model:checked="shuffleSequences"
        >Shuffle sequences</a-checkbox
      >

      <a-button type="primary" @click="selectedRegion = [100, 500]">
        Change selection to 100-500
      </a-button>
    </a-space>
  </SidebarItem>
</template>
