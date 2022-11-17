<script lang="ts">
import { mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'

export default {
  name: 'HomologyInfo',
  computed: {
    ...mapWritableState(useDataStore, ['selectedRegion']),
  },
  methods: {
    resetSelection() {
      this.selectedRegion = [100, 150]
    },
  },
}
</script>

<template>
  <a-card title="Locus view" :bordered="false" size="small">
    <p>Card content</p>
    <p>Card content</p>
    <p>Card content</p>
    <p>Selected region: {{ selectedRegion }}</p>
    <a-button type="primary" @click="resetSelection"
      >Reset selection to 100-150</a-button
    >
  </a-card>
</template>
