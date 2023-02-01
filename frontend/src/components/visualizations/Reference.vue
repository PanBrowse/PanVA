<script lang="ts">
import * as d3 from 'd3'
import { useDataStore } from '@/stores/data'
import { mapState } from 'pinia'
import { CELL_SIZE } from '@/constants'
import { drawNucleotide } from '@/helpers/nucleotide'

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
      'reference',
      'referenceNucleotides',
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
    context() {
      return d3
        .select<HTMLCanvasElement, any>('#reference')
        .node()!
        .getContext('2d')
    },
    drawCells() {
      if (!this.hasAllData) return

      const scaleFactor = 2.0

      const canvas = d3
        .select<HTMLCanvasElement, any>('#reference')
        .attr('width', this.width * scaleFactor)
        .attr('height', this.height * scaleFactor)
        .style('width', this.width + 'px')
        .style('height', this.height + 'px')

      const ctx = canvas.node()?.getContext('2d')

      if (!ctx) return

      // Render everything at 2x for improved graphics on higher DPI screens.
      ctx.scale(scaleFactor, scaleFactor)

      // Clear the screen.
      ctx.save()
      ctx.clearRect(0, 0, this.width, this.height)

      this.filteredPositions.forEach((position, index) => {
        const nucleotides = this.referenceNucleotides
          ? this.referenceNucleotides[index]
          : ''

        drawNucleotide({
          ctx,
          nucleotides,
          x: index * CELL_SIZE,
          y: 0,
          colorFn: this.nucleotideColor,
        })
      })

      ctx.restore()
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
    reference() {
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
    <canvas :width="width" :height="height" id="reference"></canvas>
  </div>
</template>

<style lang="scss" scoped>
.reference-wrapper {
  line-height: 1;
  overflow: hidden;
  transition-property: width;
  transition-timing-function: linear;

  canvas {
    vertical-align: top;
  }
}
</style>
