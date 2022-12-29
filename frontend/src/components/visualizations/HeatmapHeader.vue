<script lang="ts">
import Positions from '@/components/visualizations/Positions.vue'
import Reference from '@/components/visualizations/Reference.vue'
import Selection from '@/components/visualizations/Selection.vue'

export default {
  components: {
    Positions,
    Reference,
    Selection,
  },
}
</script>

<template>
  <Selection />
  <Reference />
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
