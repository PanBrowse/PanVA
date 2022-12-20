<script lang="ts">
import * as d3 from 'd3'
import { useDataStore } from '@/stores/data'
import { mapState } from 'pinia'
import { CELL_SIZE } from '@/config'

import { range } from 'lodash'

export default {
  computed: {
    ...mapState(useDataStore, [
      'alignedPositions',
      'cellTheme',
      'mrnaIds',
      'geneLength',
      'nucleotideColor',
      'referenceMrnaPosition',
      'selectedRegion',
      'selectedRegionLength',
      'transitionTime',
    ]),
    regionRange() {
      const [start, end] = this.selectedRegion
      return range(start, end + 1)
    },
    hasAllData(): boolean {
      return this.alignedPositions.length !== 0
    },
    width(): number {
      return this.selectedRegionLength * CELL_SIZE
    },
    height(): number {
      return CELL_SIZE
    },
  },
  methods: {
    svg() {
      return d3.select('#reference')
    },
    cellX(position: number) {
      const [start] = this.selectedRegion
      return (position - start) * CELL_SIZE
    },
    cellColor(position: number) {
      if (!this.referenceMrnaPosition) return '#e9ecef'
      return this.nucleotideColor(this.referenceMrnaPosition(position))
    },
    drawCells() {
      console.log(this.referenceMrnaPosition)
      if (!this.hasAllData && this.referenceMrnaPosition) return

      this.svg()
        .selectAll('rect')
        .data(this.regionRange, (d) => d as number)
        .join(
          (enter) =>
            enter
              .append('rect')
              .attr('fill', this.cellColor)
              .attr('x', this.cellX)
              .attr('width', CELL_SIZE)
              .attr('height', CELL_SIZE)
              .attr('stroke', 'white')
              .attr('stroke-width', 0.5),

          (update) => update.attr('fill', this.cellColor).attr('x', this.cellX),
          (exit) => exit.remove()
        )
    },
  },
  mounted() {
    this.drawCells()
  },
  watch: {
    hasAllData() {
      this.drawCells()
    },
    selectedRegion() {
      this.drawCells()
    },
    referenceMrnaPosition() {
      this.drawCells()
    },
    cellTheme() {
      this.drawCells()
    },
  },
}
</script>

<template>
  <div
    class="reference-wrapper"
    :style="{
      width: width + 'px',
      height: height + 'px',
      transitionDuration: transitionTime + 'ms',
    }"
  >
    <svg :width="width" :height="height" id="reference"></svg>
  </div>
</template>

<style lang="scss" scoped>
.reference-wrapper {
  line-height: 1;
  overflow: hidden;
  transition-property: width;
  transition-timing-function: linear;
  svg {
    vertical-align: top;
  }
}
</style>
