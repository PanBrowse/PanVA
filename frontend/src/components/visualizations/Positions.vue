<script lang="ts">
import { CELL_SIZE } from '@/constants'
import { useDataStore } from '@/stores/data'
import * as d3 from 'd3'
import { mapState, mapActions } from 'pinia'

export default {
  computed: {
    ...mapState(useDataStore, [
      'filteredPositions',
      'filteredPositionsCount',
      'sorting',
      'transitionTime',
    ]),
    width(): number {
      return this.filteredPositionsCount * CELL_SIZE
    },
    height(): number {
      return 30
    },
    sortingPosition(): number | null {
      if (this.sorting.name === 'position') {
        return this.sorting.position
      }
      return null
    },
  },
  methods: {
    ...mapActions(useDataStore, ['changeSorting']),
    positionTransform(index: number) {
      const x = (index + 1) * CELL_SIZE - 2
      const y = this.height
      return `translate(${x},${y}) rotate(-90)`
    },
    svg() {
      return d3.select('#positions')
    },
    draw() {
      this.svg()
        .selectAll('text')
        .data(this.filteredPositions, (position) => position as number)
        .join(
          (enter) =>
            enter
              .append('text')
              .attr('transform', (position, index) =>
                this.positionTransform(index)
              )
              .on('click', (event, position) => {
                this.changeSorting({
                  name: 'position',
                  position,
                })
              })
              .text((position) => position),
          (update) =>
            update.attr('transform', (d, index) =>
              this.positionTransform(index)
            ),
          (exit) => exit.remove()
        )
        .attr('data-sorted', (d) => this.sortingPosition === d)
    },
  },
  mounted() {
    this.draw()
  },
  watch: {
    sortingPosition() {
      this.draw()
    },
    filteredPositions() {
      this.draw()
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

  text {
    fill: darkgrey;
    font-size: 9px;
    cursor: pointer;

    &[data-sorted='true'] {
      fill: #333;
    }

    &:hover {
      fill: #1890ff;
    }
  }
}
</style>
