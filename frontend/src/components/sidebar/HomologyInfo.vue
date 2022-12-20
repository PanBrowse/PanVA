<script lang="ts">
import { mapState } from 'pinia'
import { useDataStore } from '@/stores/data'

import BooleanIndicator from '@/components/common/BooleanIndicator.vue'
import SidebarItem from '@/components/common/SidebarItem.vue'

export default {
  components: {
    BooleanIndicator,
    SidebarItem,
  },
  computed: {
    ...mapState(useDataStore, ['homology']),
  },
}
</script>

<template>
  <SidebarItem v-if="homology" title="Homology info">
    <a-descriptions size="small" layout="horizontal" :column="1" bordered>
      <a-descriptions-item label="ID">
        {{ homology.homology_id }}
      </a-descriptions-item>
      <a-descriptions-item label="Class">
        {{ homology.class }}
      </a-descriptions-item>
      <a-descriptions-item label="Members">
        {{ homology.members }}
      </a-descriptions-item>
      <a-descriptions-item label="Nucleotide">
        <BooleanIndicator :value="homology.variable_sites_nuc">
          Variable sites
        </BooleanIndicator>
        <BooleanIndicator :value="homology.informative_sites_nuc">
          Informative sites
        </BooleanIndicator>
        <BooleanIndicator :value="homology.pheno_specific_changes_nuc">
          Pheno specific changes
        </BooleanIndicator>
      </a-descriptions-item>
      <a-descriptions-item label="Protein">
        <BooleanIndicator :value="homology.variable_sites_prot">
          Variable sites
        </BooleanIndicator>
        <BooleanIndicator :value="homology.informative_sites_prot">
          Informative sites
        </BooleanIndicator>
        <BooleanIndicator :value="homology.pheno_specific_changes_prot">
          Pheno specific changes
        </BooleanIndicator>
      </a-descriptions-item>
    </a-descriptions>
  </SidebarItem>
</template>
