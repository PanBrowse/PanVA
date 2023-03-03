<script lang="ts">
import * as d3 from 'd3'
import { useDataStore } from '@/stores/data'
import { mapState } from 'pinia'
import { CELL_SIZE } from '@/constants'
import { drawNucleotide } from '@/helpers/nucleotide'

export default {
  computed: {
    ...mapState(useDataStore, [
      'cellTheme',
      'filteredPositions',
      'filteredPositionsCount',
      'reference',
      'referenceNucleotides',
    ]),
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
    draw() {
      const canvas = d3
        .select<HTMLCanvasElement, any>('#reference')
        .attr('width', this.width)
        .attr('height', this.height)

      const ctx = canvas.node()?.getContext('2d')

      if (!ctx) return

      this.filteredPositions.forEach((position, index) => {
        const nucleotides = this.referenceNucleotides
          ? this.referenceNucleotides[index]
          : ''

        drawNucleotide({
          ctx,
          nucleotides,
          x: index * CELL_SIZE,
          y: 0,
          cellThemeColors: this.cellTheme.colors,
        })
      })
    },
  },
  mounted() {
    this.draw()
  },
  watch: {
    filteredPositions() {
      this.draw()
    },
    reference() {
      this.draw()
    },
    cellTheme() {
      this.draw()
    },
  },
}
</script>

<template>
  <div class="reference-wrapper" :style="{ width: width + 'px' }">
    <canvas id="reference"></canvas>
  </div>
</template>

<style lang="scss" scoped>
.reference-wrapper {
  line-height: 1;
  overflow: hidden;

  canvas {
    vertical-align: top;
  }
}
</style>
