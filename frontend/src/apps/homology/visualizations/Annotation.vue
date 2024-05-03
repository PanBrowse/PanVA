<script lang="ts">
import * as d3 from 'd3'
import { mapState } from 'pinia'

import colors from '@/assets/colors.module.scss'
import { CELL_SIZE } from '@/constants'
import { useConfigStore } from '@/stores/config'
import { useHomologyStore } from '@/stores/homology'

export default {
  computed: {
    ...mapState(useHomologyStore, [
      'annotation',
      'annotationColors',
      'filteredPositions',
      'filteredPositionsCount',
      'highDpiEnabled',
      'theme',
    ]),
    width(): number {
      return this.filteredPositionsCount * CELL_SIZE
    },
    height(): number {
      const config = useConfigStore()
      return CELL_SIZE * config.homology.annotations.length
    },
  },
  methods: {
    getContext(canvas: HTMLCanvasElement) {
      if (this.highDpiEnabled) {
        const scaleFactor = 2
        canvas.setAttribute('width', '' + this.width * scaleFactor)
        canvas.setAttribute('height', '' + this.height * scaleFactor)
        canvas.style.width = this.width + 'px'
        canvas.style.height = this.height + 'px'

        const ctx = canvas.getContext('2d')!
        ctx.scale(scaleFactor, scaleFactor)

        return ctx
      }

      canvas.setAttribute('width', '' + this.width)
      canvas.setAttribute('height', '' + this.height)
      canvas.style.removeProperty('width')
      canvas.style.removeProperty('height')

      const ctx = canvas.getContext('2d')!

      return ctx
    },
    draw() {
      const config = useConfigStore()

      const canvas = d3.select<HTMLCanvasElement, any>('#annotation').node()
      if (!canvas) return

      const ctx = this.getContext(canvas)

      this.filteredPositions.forEach((position, cellIndex) => {
        config.homology.annotations.forEach(({ column }, annotationIndex) => {
          const value = this.annotation?.features[position - 1][column]
          const x = cellIndex * CELL_SIZE
          const y = annotationIndex * CELL_SIZE
          ctx.fillStyle = value
            ? this.annotationColors[annotationIndex]
            : this.theme.cellColors.empty
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
    highDpiEnabled() {
      this.draw()
    },
    annotation() {
      this.draw()
    },
  },
}
</script>

<template>
  <div class="annotation-wrapper" :style="{ width: width + 'px' }">
    <canvas id="annotation"></canvas>
  </div>
</template>

<style lang="scss" scoped>
.annotation-wrapper {
  line-height: 1;
  overflow: hidden;

  padding-top: 4px;

  canvas {
    vertical-align: top;
  }
}
</style>
