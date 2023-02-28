<script lang="ts">
import { mapState, mapActions } from 'pinia'
import { useDataStore } from '@/stores/data'

export default {
  computed: {
    ...mapState(useDataStore, ['tree', 'sorting']),
  },
  methods: {
    ...mapActions(useDataStore, ['changeSorting']),
  },
}
</script>

<template>
  <svg id="tree-labels" width="500" height="72">
    <text
      transform="translate(10,67) rotate(-45)"
      :data-sorted="sorting.name === 'tree'"
      @click="changeSorting({ name: 'tree', tree: tree.name })"
    >
      {{ tree.label }}
    </text>

    <text
      transform="translate(325,67) rotate(-45)"
      :data-sorted="sorting.name === 'mrnaId'"
      @click="changeSorting({ name: 'mrnaId' })"
    >
      mRNA id
    </text>
  </svg>
</template>

<style lang="scss">
@import '@/assets/colors.module.scss';

#tree-labels {
  text {
    fill: $gray-7;
    font-size: 10px;
    cursor: pointer;

    &:hover {
      fill: $hover;
    }

    &[data-sorted='true'] {
      font-weight: 500;
      fill: $gray-10;
    }
  }

  flex: 0 0 500px;
}
</style>
