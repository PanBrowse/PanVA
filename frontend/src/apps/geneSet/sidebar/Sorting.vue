<script lang="ts">
import { Button } from 'ant-design-vue'
import { mapActions, mapState } from 'pinia'

import SidebarItem from '@/components/SidebarItem.vue'
import { useGeneSetStore } from '@/stores/geneSet'

export default {
  components: {
    AButton: Button,
    SidebarItem,
  },
  methods: {
    ...mapActions(useGeneSetStore, ['changeSorting']),
  },
}
</script>

<template>
  <SidebarItem title="Sorting">
    <AButton @click="changeSorting('genome_number_asc')">
      ascending genomeNr
    </AButton>
    <AButton danger @click="changeSorting('genome_number_desc')">
      descending genomeNr
    </AButton>
  </SidebarItem>
</template>
