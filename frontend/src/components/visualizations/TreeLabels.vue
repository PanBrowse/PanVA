<script lang="ts">
import { mapState, mapActions } from 'pinia'
import { useDataStore } from '@/stores/data'

export default {
  computed: {
    ...mapState(useDataStore, ['tree', 'sorting']),
    treeLabel() {
      if (this.tree === 'coreSNP') return 'CoreSNP'
      if (this.tree === 'dendroCustom') return 'Custom dendrogram'
      return 'Dendrogram'
    },
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
      :data-sorted="sorting.name === tree"
      @click="changeSorting({ name: tree })"
    >
      {{ treeLabel }}
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
#tree-labels {
  text {
    fill: darkgrey;
    font-size: 10px;
    cursor: pointer;

    &:hover {
      fill: #1890ff;
    }

    &[data-sorted='true'] {
      fill: black;
    }
  }

  flex: 0 0 500px;
}
</style>
