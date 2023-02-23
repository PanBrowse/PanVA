<script lang="ts">
import Annotation from '@/components/visualizations/Annotation.vue'
import Positions from '@/components/visualizations/Positions.vue'
import Reference from '@/components/visualizations/Reference.vue'
import Selection from '@/components/visualizations/Selection.vue'
import { useDataStore } from '@/stores/data'
import { mapState } from 'pinia'

export default {
  components: {
    Annotation,
    Positions,
    Reference,
    Selection,
  },
  computed: {
    ...mapState(useDataStore, ['annotation']),
  },
}
</script>

<template>
  <Selection />
  <Reference />
  <Annotation v-if="annotation" />
  <Positions />
  <div class="scrollbar-spacing" />
</template>

<style lang="scss" scoped>
/**
 * We don't want a horizontal scrollbar blocking the positions,
 * because that would make them no longer clickable.
 */
.scrollbar-spacing {
  height: 20px;
}
</style>
