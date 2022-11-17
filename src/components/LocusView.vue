<script lang="ts">
import { mapState } from 'pinia'
import { useDataStore } from '@/stores/data'

export default {
  name: 'HomologyInfo',
  computed: {
    ...mapState(useDataStore, ['selectedRegion']),
  },
}
</script>

<template>
  <a-card title="Locus view" :bordered="false" size="small">
    <p>Card content</p>
    <p>Card content</p>
    <p>Card content</p>
    <p>Selected region: {{ selectedRegion }}</p>
  </a-card>
</template>
