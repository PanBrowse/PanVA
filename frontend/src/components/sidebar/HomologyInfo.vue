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
      <ADescriptionsItem label="Class">
        {{ homology.class }}
      </ADescriptionsItem>
      <ADescriptionsItem label="Members">
        {{ homology.members }}
      </ADescriptionsItem>
      <ADescriptionsItem label="Nucleotide">
        <BooleanIndicator :value="homology.variable_sites_nuc">
          Variable sites
        </BooleanIndicator>
        <BooleanIndicator :value="homology.informative_sites_nuc">
          Informative sites
        </BooleanIndicator>
        <BooleanIndicator :value="homology.pheno_specific_changes_nuc">
          Pheno specific changes
        </BooleanIndicator>
      </ADescriptionsItem>
      <ADescriptionsItem label="Protein">
        <BooleanIndicator :value="homology.variable_sites_prot">
          Variable sites
        </BooleanIndicator>
        <BooleanIndicator :value="homology.informative_sites_prot">
          Informative sites
        </BooleanIndicator>
        <BooleanIndicator :value="homology.pheno_specific_changes_prot">
          Pheno specific changes
        </BooleanIndicator>
      </ADescriptionsItem>
    </ADescriptions>
  </SidebarItem>
</template>
