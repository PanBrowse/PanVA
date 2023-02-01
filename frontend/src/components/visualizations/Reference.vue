<script lang="ts">
import * as d3 from 'd3'
import { useDataStore } from '@/stores/data'
import { mapState } from 'pinia'
import { CELL_SIZE } from '@/constants'

export default {
  computed: {
    ...mapState(useDataStore, [
      'alignedPositions',
      'cellTheme',
      'filteredPositions',
      'filteredPositionsCount',
      'geneLength',
      'mrnaIds',
      'nucleotideColor',
      'referenceMrnaId',
      'referenceMrnaNucleotideAtPosition',
      'transitionTime',
    ]),
    hasAllData(): boolean {
      return this.alignedPositions.length !== 0
    },
    width(): number {
      return this.filteredPositionsCount * CELL_SIZE
    },
    height(): number {
      return CELL_SIZE
    },
  },
  methods: {
    svg() {
      return d3.select('#reference')
    },
    cellColor(position: number) {
      if (!this.referenceMrnaId) return '#e9ecef'
      return this.nucleotideColor(
        this.referenceMrnaNucleotideAtPosition(position)
      )
    },
    drawCells() {
      if (!this.hasAllData && this.referenceMrnaId) return

      this.svg()
        .selectAll('rect')
        .data(this.filteredPositions, (d) => d as number)
        .join(
          (enter) =>
            enter
              .append('rect')
              .attr('fill', (position) => this.cellColor(position))
              .attr('x', (position, index) => index * CELL_SIZE)
              .attr('width', CELL_SIZE)
              .attr('height', CELL_SIZE)
              .attr('stroke', 'white')
              .attr('stroke-width', 0.5),
          (update) =>
            update
              .attr('fill', this.cellColor)
              .attr('x', (position, index) => index * CELL_SIZE),
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
    filteredPositions() {
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
