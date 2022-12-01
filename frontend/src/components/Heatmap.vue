<script lang="ts">
import * as d3 from 'd3'
import { useDataStore } from '@/stores/data'
import { mapState } from 'pinia'
import { CELL_SIZE } from '@/config'

import LoadingBox from '@/components/LoadingBox.vue'

import type { AlignedPosition, Nucleotide } from '@/types'

type Cell = {
  col: number
  row: number
}

type Position = {
  x: number
  y: number
}

type Tooltip = {
  position: Position
  alignedPosition: AlignedPosition
}

export default {
  name: 'Heatmap',
  components: {
    LoadingBox,
  },
  data() {
    return {
      customNode: document.createElement('custom:node'),
      mutationObserver: null as MutationObserver | null,
      tooltip: null as Tooltip | null,
      hover: null as Position | null,
    }
  },
  computed: {
    ...mapState(useDataStore, [
      'sequenceCount',
      'selectedRegion',
      'selectedRegionLength',
      'alignedPositions',
      'geneLength',
      'nucleotideColor',
    ]),
    hasAllData(): boolean {
      return this.sequenceCount !== 0
    },
    width(): number {
      return this.selectedRegionLength * CELL_SIZE
    },
    height(): number {
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
    context() {
      return d3
        .select<HTMLCanvasElement, any>('#heatmap')
        .node()!
        .getContext('2d')
    },
    cellX({ position }: AlignedPosition) {
      const [start] = this.selectedRegion
      return (position - start) * CELL_SIZE
    },
    cellY({ index }: AlignedPosition) {
      return Math.floor(index / this.geneLength) * CELL_SIZE
    },
    drawCells() {
      if (!this.hasAllData) return

      console.time('drawCells')

      d3.select(this.customNode)
        .selectAll('c')
        .data<AlignedPosition>(this.cells, (d) => (d as AlignedPosition).index)
        .join(
          (enter) =>
            enter
              // This call is the performance bottleneck.
              .append('c')
              .attr('nucleotide', (d) => d.nucleotide)
              .attr('x', (d) => this.cellX(d))
              .attr('y', (d) => this.cellY(d)),
          (update) =>
            update
              .transition()
              .ease(d3.easeQuadInOut)
              .duration(2000)
              .attr('nucleotide', (d) => d.nucleotide)
              .attr('x', (d) => this.cellX(d))
              .attr('y', (d) => this.cellY(d)),
          (exit) => exit.remove()
        )

      console.timeEnd('drawCells')
    },
    drawCanvas() {
      const canvas = d3
        .select<HTMLCanvasElement, any>('#heatmap')
        .attr('width', this.width)
        .attr('height', this.height)
        .style('width', this.width + 'px')
        .style('height', this.height + 'px')

      const ctx = canvas.node()?.getContext('2d')

      if (!ctx) return

      ctx.save()
      ctx.clearRect(0, 0, this.width, this.height)
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 0.5

      const vis = this

      d3.select(this.customNode)
        .selectAll<HTMLElement, any>('c')
        .each(function () {
          if (!this) return

          const nucleotide = this.getAttribute('nucleotide') as Nucleotide
          const x = parseInt(this.getAttribute('x') as string)
          const y = parseInt(this.getAttribute('y') as string)

          ctx.fillStyle = vis.nucleotideColor(nucleotide)

          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
          ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE)
        })
      ctx.restore()
    },
    mouseEventToCell(event: MouseEvent): Cell {
      const [x, y] = d3.pointer(event)
      const col = Math.floor(x / CELL_SIZE)
      const row = Math.floor(y / CELL_SIZE)
      return {
        col,
        row,
      }
    },
    cellToPosition({ row, col }: Cell): Position {
      return {
        x: col * CELL_SIZE,
        y: row * CELL_SIZE,
      }
    },
    onMouseMove(event: MouseEvent) {
      this.hover = this.cellToPosition(this.mouseEventToCell(event))
    },
    // onClick(event: MouseEvent) {
    //   const cell = this.mouseEventToCell(event)
    //   const index = cell.row * this.selectedRegionLength + cell.col

    //   const alignedPosition = this.cells[index]
    //   this.tooltip = {
    //     position: this.cellToPosition(cell),
    //     alignedPosition,
    //   }
    // },
    onMouseLeave() {
      this.hover = null
    },
  },
  mounted() {
    // https://bl.ocks.org/1Cr18Ni9/75c29c06e02ff80671e37fd30eb8519e
    // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
    this.mutationObserver = new MutationObserver(() => this.drawCanvas())
    this.mutationObserver.observe(this.customNode, {
      attributes: true,
      childList: true,
      subtree: true,
    })
    this.drawCells()
  },
  unmounted() {
    this.mutationObserver?.disconnect()
  },
  watch: {
    hasAllData() {
      this.drawCells()
    },
    selectedRegion() {
      this.drawCells()
    },
  },
}
</script>

<template>
  <div class="wrapper" :style="{ width: width + 'px', height: height + 'px' }">
    <canvas
      v-show="hasAllData"
      :width="width"
      :height="height"
      id="heatmap"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
    ></canvas>
    <LoadingBox v-show="!hasAllData" />

    <a-popover title="test" visible="hover">
      <template #content>
        <p>Content</p>
        <p>Content</p>
      </template>

      <div
        class="heatmap-hover"
        v-if="hover"
        :style="{ left: hover.x + 'px', top: hover.y + 'px' }"
      ></div>
    </a-popover>
  </div>
</template>

<style lang="scss">
.heatmap-hover {
  pointer-events: none;
  border: 1px solid #1890ff;
  position: absolute;
  top: 10px;
  left: 10px;
  width: 10px;
  height: 10px;
}
.wrapper {
  position: relative;
  transition: width 2000ms ease-in-out;
}
</style>
