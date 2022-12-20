<script lang="ts">
import { CELL_SIZE } from '@/config'
import { useDataStore } from '@/stores/data'
import * as d3 from 'd3'
import { range } from 'lodash'
import { mapState } from 'pinia'

export default {
  computed: {
    ...mapState(useDataStore, [
      'selectedRegion',
      'selectedRegionLength',
      'transitionTime',
    ]),
    regionRange() {
      const [start, end] = this.selectedRegion
      return range(start, end + 1)
    },
    width(): number {
      return this.selectedRegionLength * CELL_SIZE
    },
    height() {
      return 24
    },
  },
  methods: {
    svg() {
      return d3.select('#positions')
    },
    drawPositions() {
      this.svg()
        .selectAll('foreignObject')
        .data(this.regionRange, (d) => d as number)
        .join(
          (enter) =>
            enter
              .append('foreignObject')
              .attr('x', (d, index) => index * CELL_SIZE)
              .attr('y', 0)
              .attr('width', CELL_SIZE)
              .attr('height', this.height)
              .attr('fill', 'yellow')
              .text((d) => d),
          (update) => update.text((d) => d)
        )
    },
  },
  mounted() {
    this.drawPositions()
  },
  watch: {
    regionRange() {
      this.drawPositions()
    },
  },
}
</script>

<template>
  <div
    class="positions-wrapper"
    :style="{
      width: width + 'px',
      height: height + 'px',
      transitionDuration: transitionTime + 'ms',
    }"
  >
    <svg id="positions" :width="width" :height="height"></svg>
  </div>
</template>

<style lang="scss">
.positions-wrapper {
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

  foreignObject {
    display: block;
    user-select: none;
    color: darkgrey;
    font-size: 9px;
    line-height: 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    writing-mode: sideways-lr;
    text-indent: 10px;
  }
}
</style>
