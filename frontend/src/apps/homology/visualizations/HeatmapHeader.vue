<script lang="ts">
import { mapState } from 'pinia'

import { useHomologyStore } from '@/stores/homology'

import Annotation from './Annotation.vue'
import Positions from './Positions.vue'
import Reference from './Reference.vue'
import Selection from './Selection.vue'

export default {
  components: {
    Annotation,
    Positions,
    Reference,
    Selection,
  },
  computed: {
    ...mapState(useHomologyStore, ['annotation']),
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
