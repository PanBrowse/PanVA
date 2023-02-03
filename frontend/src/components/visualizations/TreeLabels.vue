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
    <foreignObject
      width="200"
      height="72"
      transform="translate(0,62) rotate(-45)"
    >
      <div
        :class="{ sorted: sorting.field === tree }"
        @click="changeSorting({ field: tree })"
      >
        <span v-if="tree === 'dendroDefault'">Dendrogram</span>
        <span v-if="tree === 'dendroCustom'">Custom dendrogram</span>
        <span v-if="tree === 'coreSNP'">CoreSNP</span>
      </div>
    </foreignObject>

    <foreignObject
      width="200"
      height="72"
      transform="translate(320,62) rotate(-45)"
    >
      <div
        :class="{ sorted: sorting.field === 'mrnaId' }"
        @click="changeSorting({ field: 'mrnaId' })"
      >
        mRNA id
      </div>
    </foreignObject>
  </svg>
</template>

<style lang="scss">
#tree-labels {
  foreignObject div {
    display: inline-block;
    position: absolute;
    user-select: none;
    color: darkgrey;
    font-size: 10px;
    line-height: 16px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;

    &:hover {
      color: #1890ff;
    }

    &.sorted {
      color: black;
    }
  }

  flex: 0 0 500px;
}
</style>
