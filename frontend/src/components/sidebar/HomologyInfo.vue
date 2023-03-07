<script lang="ts">
import { mapState } from 'pinia'
import { useDataStore } from '@/stores/data'

import SidebarItem from '@/components/common/SidebarItem.vue'
import MetadataValue from '@/components/common/MetadataValue.vue'
import { Descriptions, DescriptionsItem } from 'ant-design-vue'
import { useConfigStore } from '@/stores/config'
import { formatNumber } from '@/helpers/number'

export default {
  components: {
    ADescriptions: Descriptions,
    ADescriptionsItem: DescriptionsItem,
    MetadataValue,
    SidebarItem,
  },
  computed: {
    ...mapState(useDataStore, ['homology']),
    ...mapState(useConfigStore, ['homologyMetadata']),
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
