<script lang="ts">
import { CELL_SIZE } from '@/config'
import { useDataStore } from '@/stores/data'
import { range } from 'lodash'
import { mapState, mapWritableState } from 'pinia'

export default {
  computed: {
    ...mapState(useDataStore, [
      'selectedRegion',
      'selectedRegionLength',
      'transitionTime',
    ]),
    ...mapWritableState(useDataStore, ['selectedPositions']),
    isAllChecked() {
      return (
        this.selectedPositions.length !== 0 &&
        this.selectedPositions.length === this.selectedRegionLength
      )
    },
    isIndeterminate(): boolean {
      return this.selectedPositions.length !== 0 && !this.isAllChecked
    },
    regionRange() {
      const [start, end] = this.selectedRegion
      return range(start, end + 1)
    },
    options() {
      return this.regionRange.map((position) => ({
        value: position,
      }))
    },
    width(): number {
      return this.selectedRegionLength * CELL_SIZE
    },
  },
  methods: {
    onCheckAll() {
      const [start, end] = this.selectedRegion
      this.selectedPositions = this.isAllChecked ? [] : range(start, end + 1)
    },
  },
}
</script>

<template>
  <div
    class="selection-wrapper"
    :style="{
      width: width + 'px',
      transitionDuration: transitionTime + 'ms',
    }"
  >
    <!--
    <a-checkbox
      v-model:checked="isAllChecked"
      :indeterminate="isIndeterminate"
      @change="onCheckAll"
    >
      select all
    </a-checkbox>
    -->

    <a-checkbox-group v-model:value="selectedPositions" :options="options" />
  </div>
</template>

<style lang="scss">
.selection-wrapper {
  height: 10px;
  overflow: hidden;
  line-height: 10px;
  transition-property: width;
  transition-timing-function: linear;

  .ant-checkbox-group {
    height: 10px;
    line-height: 10px;
    white-space: nowrap;
  }

  .ant-checkbox-group-item {
    white-space: nowrap;
    margin: 0;
    padding: 0 1px;
  }

  .ant-checkbox-inner {
    width: 8px;
    height: 8px;
  }

  .ant-checkbox-inner::after {
    width: 4px;
    height: 4px;
  }
}
</style>
