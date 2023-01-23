<script lang="ts">
import * as d3 from 'd3'
import { useDataStore } from '@/stores/data'
import { mapActions, mapState, mapWritableState } from 'pinia'
import { CELL_SIZE } from '@/config'
import isEqual from 'fast-deep-equal'

import LoadingBox from '@/components/common/LoadingBox.vue'
import BooleanIndicator from '@/components/common/BooleanIndicator.vue'

import type { AlignedPosition, Nucleotide } from '@/types'
import { debounce, type DebouncedFunc } from 'lodash'

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
  components: {
    BooleanIndicator,
    LoadingBox,
  },
  data() {
    return {
      customNode: document.createElement('custom:node'),
      hoverPosition: null as Position | null,
      mutationObserver: null as MutationObserver | null,
      tooltip: null as Tooltip | null,
      setTooltipDebounced: null as DebouncedFunc<(cell: Cell) => any> | null,
    }
  },
  computed: {
    ...mapState(useDataStore, [
      'alignedPositions',
      'cellTheme',
      'geneLength',
      'homologyId',
      'mrnaIds',
      'nucleotideColor',
      'referenceMrnaId',
      'referenceMrnaNucleotideAtPosition',
      'selectedRegion',
      'selectedRegionLength',
      'sequenceCount',
      'sortedMrnaIndices',
      'sortedMrnaPositions',
      'transitionTime',
    ]),
    ...mapWritableState(useDataStore, ['hoverRowIndex']),
    hasAllData(): boolean {
      return (
        this.sequenceCount !== 0 &&
        this.sortedMrnaIndices.length !== 0 &&
        this.alignedPositions.length !== 0
      )
    },
    width(): number {
      return this.selectedRegionLength * CELL_SIZE
    },
    height(): number {
      return this.sequenceCount * CELL_SIZE
    },
    cells(): AlignedPosition[] {
      const [start, end] = this.selectedRegion

      return this.alignedPositions.filter(({ position }) => {
        return position >= start && position <= end
      })
    },
    hoverCellStyle() {
      if (!this.hoverPosition) return
      return {
        left: this.hoverPosition.x + 'px',
        top: this.hoverPosition.y + 'px',
      }
    },
    hoverRowStyle() {
      if (this.hoverRowIndex === null) return
      return {
        top: this.hoverRowIndex * CELL_SIZE + 'px',
        width: this.width + 'px',
      }
    },
  },
  methods: {
    ...mapActions(useDataStore, ['dragUpdate']),
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
    cellY({ mRNA_index }: AlignedPosition) {
      return this.sortedMrnaPositions[mRNA_index] * CELL_SIZE
    },
    cellColor(position: number, nucleotide: Nucleotide) {
      if (!this.referenceMrnaId) return this.nucleotideColor(nucleotide)

      const referenceNucleotide =
        this.referenceMrnaNucleotideAtPosition(position)

      if (referenceNucleotide === nucleotide) {
        return '#e9ecef'
      }

      return this.nucleotideColor(nucleotide)
    },
    drawCells() {
      if (!this.hasAllData) return

      console.time('Heatmap#drawCells')

      d3.select(this.customNode)
        .selectAll('c')
        .data<AlignedPosition>(
          this.cells,
          (d) => `${this.homologyId}:${(d as AlignedPosition).index}`
        )
        .join(
          (enter) =>
            enter
              // This call is the performance bottleneck.
              .append('c')
              .attr('nucleotide', (d) => d.nucleotide)
              .attr('position', (d) => d.position)
              .attr('x', this.cellX)
              .attr('y', this.cellY),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('nucleotide', (d) => d.nucleotide)
              .attr('position', (d) => d.position)
              .attr('x', this.cellX)
              .attr('y', this.cellY),
          (exit) => exit.remove()
        )

      console.timeEnd('Heatmap#drawCells')
    },
    drawCanvas() {
      const scaleFactor = 2.0

      const canvas = d3
        .select<HTMLCanvasElement, any>('#heatmap')
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

      // Setup default drawing style.
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 0.5

      const that = this

      d3.select(this.customNode)
        .selectAll<HTMLElement, any>('c')
        .each(function () {
          if (!this) return

          const nucleotide = this.getAttribute('nucleotide') as Nucleotide
          const position = parseInt(this.getAttribute('position') as string)
          const x = parseInt(this.getAttribute('x') as string)
          const y = parseInt(this.getAttribute('y') as string)

          ctx.fillStyle = that.cellColor(position, nucleotide)

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
      if (!this.hasAllData) return

      const cell = this.mouseEventToCell(event)
      const position = this.cellToPosition(cell)

      if (this.hoverRowIndex !== cell.row) {
        this.hoverRowIndex = cell.row
        this.dragUpdate(cell.row)
      }

      // Only update data if values actually changed.
      if (!isEqual(position, this.hoverPosition)) {
        this.hoverPosition = position
        this.setTooltipDebounced?.(cell)
      }
    },
    onMouseLeave() {
      this.setTooltipDebounced?.cancel()
      this.tooltip = null
      this.hoverPosition = null
      this.hoverRowIndex = null
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
  created() {
    this.setTooltipDebounced = debounce((cell: Cell) => {
      const position = this.cellToPosition(cell)
      const mRNA_index = this.sortedMrnaIndices[cell.row]

      const apIndex = mRNA_index * this.selectedRegionLength + cell.col
      const alignedPosition = this.cells[apIndex]

      this.tooltip = {
        position,
        alignedPosition,
      }
    }, 200)
  },
  unmounted() {
    this.setTooltipDebounced?.cancel()
    this.mutationObserver?.disconnect()
  },
  watch: {
    alignedPositions() {
      this.drawCells()
    },
    hasAllData() {
      this.drawCells()
    },
    selectedRegion() {
      this.drawCells()
    },
    cellTheme() {
      this.drawCanvas()
    },
    referenceMrnaId() {
      this.drawCanvas()
    },
    sortedMrnaPositions() {
      this.drawCells()
    },
  },
}
</script>

<template>
  <div
    class="heatmap-wrapper"
    :style="{
      width: width + 'px',
      height: height + 'px',
      transitionDuration: transitionTime + 'ms',
    }"
  >
    <canvas
      v-show="hasAllData"
      :width="width"
      :height="height"
      id="heatmap"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
    ></canvas>
    <LoadingBox v-show="!hasAllData" :height="120" />

    <a-popover
      :title="tooltip.alignedPosition.mRNA_id"
      visible
      v-bind:key="tooltip"
      :mouseLeaveDelay="0"
      :mouseEnterDelay="0"
      v-if="tooltip && hasAllData"
    >
      <template #content>
        <div class="heatmap-popover-content">
          <a-descriptions size="small" layout="horizontal" :column="1" bordered>
            <a-descriptions-item label="Base">
              {{ tooltip.alignedPosition.nucleotide }}
            </a-descriptions-item>
            <a-descriptions-item label="Position">
              {{ tooltip.alignedPosition.position }}
            </a-descriptions-item>
            <a-descriptions-item label="Variable">
              <BooleanIndicator :value="tooltip.alignedPosition.variable" />
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </template>

      <div
        class="heatmap-tooltip-virtual-element"
        :style="{
          left: tooltip.position.x + 'px',
          top: tooltip.position.y + 'px',
        }"
      ></div>
    </a-popover>

    <div
      class="heatmap-cell-hover"
      v-if="hoverPosition && hasAllData"
      :style="hoverCellStyle"
    />

    <div
      class="heatmap-row-hover"
      v-if="hoverRowIndex !== null && hasAllData"
      :style="hoverRowStyle"
    />
  </div>
</template>

<style lang="scss" scoped>
.heatmap-tooltip-virtual-element {
  pointer-events: none;
  position: absolute;
  width: 10px;
  height: 10px;
}

.heatmap-cell-hover {
  pointer-events: none;
  border: 1px solid #1890ff;
  position: absolute;
  width: 10px;
  height: 10px;
}

.heatmap-row-hover {
  pointer-events: none;
  border-top: 1px solid #1890ff;
  border-bottom: 1px solid #1890ff;
  position: absolute;
  height: 10px;
}

.heatmap-wrapper {
  position: relative;
  transition-property: width;
  transition-timing-function: linear;

  /* canvas {
    image-rendering: pixelated;
  } */
}

.heatmap-popover-content {
  /* Take back padding from .ant-popover-inner-content */
  margin: -12px -16px -12px -16px;
}
</style>
