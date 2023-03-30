<script lang="ts">
import { Descriptions, DescriptionsItem } from 'ant-design-vue'
import { mapState } from 'pinia'

import MetadataValue from '@/components/MetadataValue.vue'
import SidebarItem from '@/components/SidebarItem.vue'
import { formatNumber } from '@/helpers/number'
import { useConfigStore } from '@/stores/config'
import { useHomologyStore } from '@/stores/homology'

export default {
  components: {
    ADescriptions: Descriptions,
    ADescriptionsItem: DescriptionsItem,
    MetadataValue,
    SidebarItem,
  },
  computed: {
    ...mapState(useHomologyStore, ['homology']),
    homologyMetadata() {
      const config = useConfigStore()
      return config.homology.homologyMetadata.filter((metadata) => {
        const value = this.homology!.metadata[metadata.column]
        if (value === null) return false
        if (value === undefined) return false
        if (value === '') return false
        if (Array.isArray(value) && value.length === 0) return false
        return true
      })
    },
  },
  methods: {
    formatNumber,
  },
}
</script>

<template>
  <SidebarItem v-if="homology" title="Homology info" isDefaultCollapsed>
    <ADescriptions
      size="small"
      layout="horizontal"
      class="homology-info"
      :column="1"
      bordered
    >
      <ADescriptionsItem label="Members">
        {{ formatNumber(homology.members) }}
      </ADescriptionsItem>
      <ADescriptionsItem label="Alignment length">
        {{ formatNumber(homology.alignment_length) }}
      </ADescriptionsItem>
      <ADescriptionsItem
        :label="metadata.label"
        v-for="metadata in homologyMetadata"
        v-bind:key="metadata.column"
      >
        <MetadataValue
          :metadata="metadata"
          :value="homology.metadata[metadata.column]"
        />
      </ADescriptionsItem>
    </ADescriptions>
  </SidebarItem>
</template>

<style lang="scss" scoped>
.homology-info {
  :deep(th) {
    width: 50%;
  }
}
</style>
