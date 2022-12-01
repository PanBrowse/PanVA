<script lang="ts">
import * as d3 from 'd3'
import { range } from 'lodash'
import { useDataStore } from '@/stores/data'
import { mapState } from 'pinia'
import { CELL_SIZE } from '@/config'

import LoadingBox from '@/components/LoadingBox.vue'
import type { AlignedPosition } from '@/types'

type AlignedPositionWithXY = AlignedPosition & {
  x: number
  y: number
}

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
    cells(): AlignedPositionWithXY[][] {
      const [start, end] = this.selectedRegion
      const regionWidth = end - start + 1

      return range(0, this.sequenceCount).map<AlignedPositionWithXY[]>(
        (row, rowIndex) => {
          // Selected region is one-based, so we subtract one to get the index.
          const regionIndex = row * this.geneLength + start - 1
          return this.alignedPositions
            .slice(regionIndex, regionIndex + regionWidth)
            .map((alignedPosition, colIndex) => ({
              ...alignedPosition,
              x: colIndex * CELL_SIZE,
              y: rowIndex * CELL_SIZE,
            }))
        }
      )
    },
  },
  methods: {
    svg() {
      return d3.select('#heatmap')
    },
    drawCells() {
      this.svg()
        .selectAll('.cell')
        // Rows
        .data(this.cells)
        .enter()
        .append('g')
        .selectAll('rect')
        // Cells
        .data((d) => d)
        .enter()
        .append('rect')
        .attr('height', CELL_SIZE)
        .attr('width', CELL_SIZE)
        .attr('x', ({ x }) => x)
        .attr('y', ({ y }) => y)
        .style('fill', 'rgba(255,255,255, 0)')
    },
    drawSvg() {
      if (!this.hasAllData) return

      // Remove all old child elements from SVG.
      this.svg().html('')

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
  <svg
    v-show="hasAllData"
    :width="svgWidth"
    :height="svgHeight"
    id="heatmap"
  ></svg>
  <LoadingBox v-show="!hasAllData" :height="svgHeight" :width="svgWidth" />
</template>

<style lang="scss"></style>
