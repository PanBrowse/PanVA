<script lang="ts">
import { mapState } from 'pinia'
import { useDataStore } from '@/stores/data'

import BooleanIndicator from '@/components/common/BooleanIndicator.vue'
import SidebarItem from '@/components/common/SidebarItem.vue'
import { Descriptions, DescriptionsItem } from 'ant-design-vue'

export default {
  components: {
    ADescriptions: Descriptions,
    ADescriptionsItem: DescriptionsItem,
    BooleanIndicator,
    SidebarItem,
  },
  computed: {
    ...mapState(useDataStore, ['homology']),
  },
}
</script>

<template>
  <SidebarItem v-if="homology" title="Homology info" isDefaultCollapsed>
    <ADescriptions size="small" layout="horizontal" :column="1" bordered>
      <ADescriptionsItem label="ID">
        {{ homology.homology_id }}
      </ADescriptionsItem>
      <ADescriptionsItem label="Members">
        {{ homology.members }}
      </ADescriptionsItem>
      <ADescriptionsItem
        :label="label"
        v-for="{ label, value } in homology.metadata"
        v-bind:key="label"
      >
        <BooleanIndicator :value="true" v-if="value === true" />
        <BooleanIndicator :value="false" v-else-if="value === false" />
        <template v-else>
          {{ value }}
        </template>
      </ADescriptionsItem>
    </ADescriptions>
  </SidebarItem>
</template>
