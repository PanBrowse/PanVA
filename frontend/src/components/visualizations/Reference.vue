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
      'referenceMrnaId',
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
      if (!this.referenceMrnaId) {
        return '#e9ecef'
      }

      const mrnaIndex = this.mrnaIds.indexOf(this.referenceMrnaId)
      const { nucleotide } =
        this.alignedPositions[mrnaIndex * this.geneLength + position]
      return this.nucleotideColor(nucleotide)
    },
    drawCells() {
      console.log(this.referenceMrnaId)
      if (!this.hasAllData && this.referenceMrnaId) return

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

          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('fill', this.cellColor)
              .attr('x', this.cellX),
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
    referenceMrnaId() {
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
