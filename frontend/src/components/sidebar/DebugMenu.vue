<script lang="ts">
import { mapState } from 'pinia'
import { useDataStore } from '@/stores/data'

import SidebarItem from '@/components/common/SidebarItem.vue'

export default {
  components: {
    SidebarItem,
  },
  computed: {
    ...mapState(useDataStore, ['sequenceCount', 'selectedRegionLength']),
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
    </a-space>
  </SidebarItem>
</template>
