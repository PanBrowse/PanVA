<script lang="ts">
import * as d3 from 'd3'
import { range } from 'lodash'
import { useDataStore } from '@/stores/data'
import { mapState } from 'pinia'
import { CELL_SIZE } from '@/config'

import LoadingBox from '@/components/LoadingBox.vue'
import type { AlignedPosition } from '@/types'

export default {
  name: 'Heatmap',
  components: {
    LoadingBox,
  },
  computed: {
    ...mapState(useDataStore, [
      'sequenceCount',
      'selectedRegion',
      'alignedPositions',
      'geneLength',
      'nucleotideColor',
    ]),
    hasAllData(): boolean {
      return this.sequenceCount !== 0
    },
    examples(): number[] {
      const [start, end] = this.selectedRegion
      return range(start, end + 1)
    },
    svgWidth(): number {
      return this.examples.length * CELL_SIZE
    },
    svgHeight(): number {
      return this.sequenceCount * CELL_SIZE
    },
    cells(): AlignedPosition[] {
      const [start, end] = this.selectedRegion

      const result = this.alignedPositions.filter((_value, index) => {
        const rowPosition = (index % this.geneLength) + 1
        return rowPosition >= start && rowPosition <= end
      })

      return result
    },
  },
  methods: {
    svg() {
      return d3.select('#heatmap')
    },
    cellX({ position }: AlignedPosition) {
      const [start] = this.selectedRegion
      return (position - start) * CELL_SIZE
    },
    cellY({ index }: AlignedPosition) {
      return Math.floor(index / this.geneLength) * CELL_SIZE
    },
    drawCells() {
      this.svg()
        .selectAll('.cell')
        .data<AlignedPosition>(this.cells, (d: any) => d.index)
        .join((enter) =>
          enter
            .append('rect')
            .attr('height', CELL_SIZE)
            .attr('width', CELL_SIZE)
            .attr('x', this.cellX)
            .attr('y', this.cellY)
            .attr('fill', (d) => this.nucleotideColor(d.nucleotide))
        )
    },
    drawSvg() {
      if (!this.hasAllData) return

      this.drawCells()
    },
  },
  watch: {
    hasAllData() {
      this.drawSvg()
    },
    selectedRegion() {
      this.drawSvg()
    },
  },
}
</script>

<template>
  <div :style="{ width: svgWidth + 'px', height: svgHeight + 'px' }">
    <svg
      v-show="hasAllData"
      :width="svgWidth"
      :height="svgHeight"
      id="heatmap"
    ></svg>
    <LoadingBox v-show="!hasAllData" />
  </div>
</template>

<style lang="scss"></style>
