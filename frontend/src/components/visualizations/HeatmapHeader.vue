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
</template>
