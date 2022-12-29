<script lang="ts">
import { CELL_SIZE } from '@/config'
import { useDataStore } from '@/stores/data'
import * as d3 from 'd3'
import { range } from 'lodash'
import { mapState, mapActions } from 'pinia'

export default {
  computed: {
    ...mapState(useDataStore, [
      'selectedRegion',
      'selectedRegionLength',
      'sorting',
      'transitionTime',
    ]),
    regionRange(): number[] {
      const [start, end] = this.selectedRegion
      return range(start, end + 1)
    },
    width(): number {
      return this.selectedRegionLength * CELL_SIZE
    },
    height(): number {
      return 24
    },
    sortingPosition(): number | null {
      if (this.sorting.field === 'position') {
        return this.sorting.position
      }
      return null
    },
  },
  methods: {
    ...mapActions(useDataStore, ['changeSorting']),
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
              .attr('width', this.height)
              .attr('height', CELL_SIZE)
              .attr('transform', (d, index) => {
                const x = index * CELL_SIZE
                const y = this.height
                return `translate(${x},${y}) rotate(-90)`
              })
              .append('xhtml:div')
              .attr('class', (d) =>
                this.sortingPosition === d ? 'sorted' : ''
              )
              .text((d) => d)
              .on('click', (event, d) => {
                this.changeSorting({
                  field: 'position',
                  position: d,
                })
              }),
          (update) =>
            update
              .select('div')
              .attr('class', (d) =>
                this.sortingPosition === d ? 'sorted' : ''
              )
              .text((d) => d),
          (exit) => exit.remove()
        )
    },
  },
  mounted() {
    this.drawPositions()
  },
  watch: {
    sortingPosition() {
      this.drawPositions()
    },
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

  foreignObject div {
    display: inline-block;
    position: absolute;
    user-select: none;
    color: darkgrey;
    font-size: 9px;
    line-height: 10px;
    overflow: hidden;
    white-space: nowrap;
    cursor: pointer;

    &.sorted {
      color: black;
    }

    &:hover {
      color: #1890ff;
    }
  }
}
</style>
