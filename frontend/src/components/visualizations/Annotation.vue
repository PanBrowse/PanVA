<script lang="ts">
import * as d3 from 'd3'
import { useDataStore } from '@/stores/data'
import { mapState } from 'pinia'
import { CELL_SIZE, EMPTY_CELL_COLOR } from '@/constants'
import { useConfigStore } from '@/stores/config'
import colors from '@/assets/colors.module.scss'

export default {
  computed: {
    ...mapState(useDataStore, [
      'annotation',
      'annotationColors',
      'filteredPositions',
      'filteredPositionsCount',
      'transitionTime',
    ]),
    ...mapState(useConfigStore, ['annotations']),
    width(): number {
      return this.filteredPositionsCount * CELL_SIZE
    },
    height(): number {
      return CELL_SIZE * this.annotations.length
    },
  },
  methods: {
    context() {
      return d3
        .select<HTMLCanvasElement, any>('#annotation')
        .node()!
        .getContext('2d')
    },
    draw() {
      const scaleFactor = 2.0

      const canvas = d3
        .select<HTMLCanvasElement, any>('#annotation')
        .attr('width', this.width * scaleFactor)
        .attr('height', this.height * scaleFactor)
        .style('width', this.width + 'px')
        .style('height', this.height + 'px')

      const ctx = canvas.node()?.getContext('2d')

      if (!ctx) return

      // Render everything at 2x for improved graphics on higher DPI screens.
      ctx.scale(scaleFactor, scaleFactor)

      // Clear the screen.
      ctx.clearRect(0, 0, this.width, this.height)

      this.filteredPositions.forEach((position, cellIndex) => {
        this.annotations.forEach(({ column }, annotationIndex) => {
          const value = this.annotation?.features[position - 1][column]
          const x = cellIndex * CELL_SIZE
          const y = annotationIndex * CELL_SIZE
          ctx.fillStyle = value
            ? this.annotationColors[annotationIndex]
            : EMPTY_CELL_COLOR
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)

          // White border overlay.
          ctx.strokeStyle = colors['gray-1']
          ctx.lineWidth = 0.5
          ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE)
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
    annotation() {
      this.draw()
    },
  },
}
</script>

<template>
  <div
    class="annotation-wrapper"
    :style="{
      width: width + 'px',
      transitionDuration: transitionTime + 'ms',
    }"
  >
    <canvas id="annotation"></canvas>
  </div>
</template>

<style lang="scss" scoped>
.annotation-wrapper {
  line-height: 1;
  overflow: hidden;
  transition-property: width;
  transition-timing-function: linear;
  padding-top: 4px;

  canvas {
    vertical-align: top;
  }
}
</style>
