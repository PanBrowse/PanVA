<script lang="ts">
import { mapState, mapActions } from 'pinia'
import { useDataStore } from '@/stores/data'

export default {
  computed: {
    ...mapState(useDataStore, ['dendro', 'sorting']),
  },
  methods: {
    ...mapActions(useDataStore, ['changeSorting']),
  },
}
</script>

<template>
  <svg id="dendro-labels" width="500" height="60">
    <foreignObject width="200" height="60" transform="translate(5,42)">
      <div
        :class="{ sorted: sorting.field === 'dendroDefault' }"
        @click="changeSorting({ field: 'dendroDefault' })"
        v-if="dendro === 'default'"
      >
        Dendrogram
      </div>
      <div
        :class="{ sorted: sorting.field === 'dendroCustom' }"
        @click="changeSorting({ field: 'dendroCustom' })"
        v-else
      >
        Dendrogram (custom)
      </div>
    </foreignObject>

    <foreignObject width="200" height="60" transform="translate(324,42)">
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
#dendro-labels {
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
