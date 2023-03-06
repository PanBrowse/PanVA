<script lang="ts">
import * as d3 from 'd3'
import { useDataStore } from '@/stores/data'
import { mapState } from 'pinia'
import { CELL_SIZE } from '@/constants'
import { drawNucleotide } from '@/helpers/nucleotide'

export default {
  computed: {
    ...mapState(useDataStore, [
      'filteredPositions',
      'filteredPositionsCount',
      'highDpiEnabled',
      'reference',
      'referenceNucleotides',
      'theme',
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
      const scaleFactor = this.highDpiEnabled ? 2 : 1

      const canvas = d3
        .select<HTMLCanvasElement, any>('#reference')
        .attr('width', this.width * scaleFactor)
        .attr('height', this.height * scaleFactor)
        .style('width', this.width + 'px')
        .style('height', this.height + 'px')

      const ctx = canvas.node()?.getContext('2d')
      if (!ctx) return

      ctx.scale(scaleFactor, scaleFactor)

      this.filteredPositions.forEach((position, index) => {
        const nucleotides = this.referenceNucleotides
          ? this.referenceNucleotides[index]
          : ''

        drawNucleotide({
          ctx,
          nucleotides,
          x: index * CELL_SIZE,
          y: 0,
          theme: this.theme,
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
    highDpiEnabled() {
      this.draw()
    },
    reference() {
      this.draw()
    },
    theme() {
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
    background: white;
  }
}
</style>
