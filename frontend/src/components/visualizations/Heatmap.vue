<script lang="ts">
import * as d3 from 'd3'
import { useDataStore } from '@/stores/data'
import { mapActions, mapState, mapWritableState } from 'pinia'
import { CELL_SIZE } from '@/config'

import type { AlignedPosition } from '@/types'

import LoadingBox from '@/components/common/LoadingBox.vue'
// import BooleanIndicator from '@/components/common/BooleanIndicator.vue'

import type { DataIndexCollapsed, Nucleotide } from '@/types'
import { valueKey } from '@/helpers/valueKey'
import { arrayRange } from '@/helpers/arrayRange'
import { isGroup } from '@/helpers/isGroup'
import { keys, pickBy } from 'lodash'

type Cell = {
  data: DataIndexCollapsed
  position: number
  column: number
  row: number
}

type NucleotideCounts = Record<Nucleotide, number>

type GroupAggregates = Record<
  number,
  {
    // Counts per nucleotide in this position.
    counts: NucleotideCounts
    // String of nucleotides in this position (eg: AC-).
    nucleotides: string
  }[]
>

// type Tooltip = {
//   position: Position
//   alignedPosition: AlignedPosition
// }

export default {
  components: {
    // BooleanIndicator,
    LoadingBox,
  },
  data() {
    return {
      customNode: document.createElement('custom:node'),
      // hoverPosition: null as Position | null,
      mutationObserver: null as MutationObserver | null,
      // tooltip: null as Tooltip | null,
      // setTooltipDebounced: null as DebouncedFunc<(cell: Cell) => any> | null,
    }
  },
  computed: {
    ...mapState(useDataStore, [
      'alignedPositions',
      'cellTheme',
      'geneLength',
      'groups',
      'homologyId',
      'mrnaIds',
      'nucleotideColor',
      'referenceMrnaId',
      'referenceMrnaNucleotideAtPosition',
      'selectedRegion',
      'selectedRegionLength',
      'sequenceCount',
      'sortedDataIndicesCollapsed',
      'transitionTime',
    ]),
    ...mapWritableState(useDataStore, ['hoverRowIndex']),
    hasAllData(): boolean {
      return (
        this.sequenceCount !== 0 &&
        this.sortedDataIndicesCollapsed.length !== 0 &&
        this.alignedPositions.length !== 0
      )
    },
    width(): number {
      return this.selectedRegionLength * CELL_SIZE
    },
    height(): number {
      return this.sequenceCount * CELL_SIZE
    },
    positions(): number[] {
      // TODO: Add position filtering (informative, etc)
      const [start, end] = this.selectedRegion

      // Region is one-based, we want column indices to be zero-based.
      return arrayRange(start, end)
    },
    cells(): Cell[] {
      /**
       * We have two arrays:
       * - sortedDataIndicesCollapsed (DataIndexCollapsed[])
       * - positions (number[])
       *
       * This functions generates an array that contains the cartesian product
       * of these two arrays, including the accompanying index in each array.
       */
      const result: Cell[] = []

      this.sortedDataIndicesCollapsed.forEach((data, row) => {
        this.positions.forEach((position, column) => {
          result.push({ data, row, position, column })
        })
      })

      return result
    },
    groupAggregates(): GroupAggregates {
      return Object.fromEntries(
        this.groups.map(({ id, dataIndices }) => {
          const aggregates = this.positions.map((position) => {
            const counts: NucleotideCounts = {
              A: 0,
              C: 0,
              G: 0,
              T: 0,
              a: 0,
              c: 0,
              g: 0,
              t: 0,
              '-': 0,
            }

            dataIndices.forEach((dataIndex) => {
              const { nucleotide } = this.dataAtPosition(dataIndex, position)
              counts[nucleotide]++
            })

            const nucleotides = keys(pickBy(counts)).join('')

            return { counts, nucleotides }
          })

          return [id, aggregates]
        })
      )
    },
    // hoverCellStyle() {
    //   if (!this.hoverPosition) return
    //   return {
    //     left: this.hoverPosition.x + 'px',
    //     top: this.hoverPosition.y + 'px',
    //   }
    // },
    // hoverRowStyle() {
    //   if (this.hoverRowIndex === null) return
    //   return {
    //     top: this.hoverRowIndex * CELL_SIZE + 'px',
    //     width: this.width + 'px',
    //   }
    // },
  },
  methods: {
    ...mapActions(useDataStore, ['dragUpdate']),
    context() {
      return d3
        .select<HTMLCanvasElement, any>('#heatmap')
        .node()!
        .getContext('2d')
    },
    dataAtPosition(dataIndex: number, position: number): AlignedPosition {
      return this.alignedPositions[dataIndex * this.geneLength + position - 1]
    },
    drawCells() {
      if (!this.hasAllData) return

      d3.select(this.customNode)
        .selectAll('c')
        .data<Cell>(
          this.cells,
          ({ data, column }: any) => `${valueKey(data)}:${column}`
        )
        .join(
          (enter) =>
            enter
              // This call is the performance bottleneck.
              .append('c')
              .attr('x', ({ column }) => column * CELL_SIZE)
              .attr('y', ({ row }) => row * CELL_SIZE),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('x', ({ column }) => column * CELL_SIZE)
              .attr('y', ({ row }) => row * CELL_SIZE),
          (exit) => exit.remove()
        )
        .attr('nucleotides', ({ data, position, column }) => {
          if (isGroup(data)) {
            const { nucleotides } = this.groupAggregates[data.id][column]
            // return nucleotides
            return nucleotides
          }

          const { nucleotide } = this.dataAtPosition(data, position)
          return nucleotide
        })
        .attr('position', ({ position }) => position)
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
    drawNucleotide(
      ctx: CanvasRenderingContext2D,
      nucleotides: string,
      position: number,
      x: number,
      y: number
    ) {
      ctx.save()

      // Single nucleotide or group with the same nucleotide at this position.
      if (nucleotides.length === 1) {
        ctx.fillStyle = this.cellColor(position, nucleotides as Nucleotide)
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
      } else {
        ctx.fillStyle = '#4d4d4d'
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)

        if (nucleotides.includes('a') || nucleotides.includes('A')) {
          ctx.fillStyle = this.nucleotideColor('A')
          ctx.beginPath()
          // Top.
          ctx.moveTo(x + 5, y + 5)
          ctx.lineTo(x, y)
          ctx.lineTo(x + 10, y)
          ctx.lineTo(x + 5, y + 5)
          ctx.closePath()
          ctx.fill()
        }

        if (nucleotides.includes('c') || nucleotides.includes('C')) {
          ctx.fillStyle = this.nucleotideColor('C')
          ctx.beginPath()
          // Right.
          ctx.moveTo(x + 5, y + 5)
          ctx.lineTo(x + 10, y)
          ctx.lineTo(x + 10, y + 10)
          ctx.lineTo(x + 5, y + 5)
          ctx.closePath()
          ctx.fill()
        }

        if (nucleotides.includes('g') || nucleotides.includes('G')) {
          ctx.fillStyle = this.nucleotideColor('G')
          ctx.beginPath()
          // Bottom.
          ctx.moveTo(x + 5, y + 5)
          ctx.lineTo(x + 10, y + 10)
          ctx.lineTo(x, y + 10)
          ctx.lineTo(x + 5, y + 5)
          ctx.closePath()
          ctx.fill()
        }

        if (nucleotides.includes('t') || nucleotides.includes('T')) {
          ctx.fillStyle = this.nucleotideColor('T')
          ctx.beginPath()
          // Left.
          ctx.moveTo(x + 5, y + 5)
          ctx.lineTo(x, y + 10)
          ctx.lineTo(x, y)
          ctx.lineTo(x + 5, y + 5)
          ctx.closePath()
          ctx.fill()
        }

        if (nucleotides.includes('-')) {
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.ellipse(x + 5, y + 5, 2.75, 2.75, 0, 0, 0)
          ctx.closePath()
          ctx.fill()

          ctx.fillStyle = '#4d4d4d'
          ctx.beginPath()
          ctx.ellipse(x + 5, y + 5, 2.5, 2.5, 0, 0, 0)
          ctx.closePath()
          ctx.fill()

          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.ellipse(x + 5, y + 5, 1.5, 1.5, 0, 0, 0)
          ctx.closePath()
          ctx.fill()
        }
      }

      ctx.restore()
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

          const nucleotides = this.getAttribute('nucleotides') as string
          const position = parseInt(this.getAttribute('position') as string)
          const x = parseInt(this.getAttribute('x') as string)
          const y = parseInt(this.getAttribute('y') as string)

          that.drawNucleotide(ctx, nucleotides, position, x, y)

          // White border overlay.
          ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE)
        })

      ctx.restore()
    },
    // mouseEventToCell(event: MouseEvent): Cell {
    //   const [x, y] = d3.pointer(event)
    //   const col = Math.floor(x / CELL_SIZE)
    //   const row = Math.floor(y / CELL_SIZE)
    //   return {
    //     col,
    //     row,
    //   }
    // },
    // cellToPosition({ row, col }: Cell): Position {
    //   return {
    //     x: col * CELL_SIZE,
    //     y: row * CELL_SIZE,
    //   }
    // },
    // onMouseMove(event: MouseEvent) {
    //   if (!this.hasAllData) return

    //   const cell = this.mouseEventToCell(event)
    //   const position = this.cellToPosition(cell)

    //   if (this.hoverRowIndex !== cell.row) {
    //     this.hoverRowIndex = cell.row
    //     this.dragUpdate(cell.row)
    //   }

    //   // Only update data if values actually changed.
    //   if (!isEqual(position, this.hoverPosition)) {
    //     this.hoverPosition = position
    //     // this.setTooltipDebounced?.(cell)
    //   }
    // },
    // onMouseLeave() {
    //   // this.setTooltipDebounced?.cancel()
    //   // this.tooltip = null
    //   this.hoverPosition = null
    //   this.hoverRowIndex = null
    // },
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
  // created() {
  //   this.setTooltipDebounced = debounce((cell: Cell) => {
  //     const position = this.cellToPosition(cell)
  //     const mRNA_index = this.sortedDataIndices[cell.row]

  //     const apIndex = mRNA_index * this.selectedRegionLength + cell.col
  //     const alignedPosition = this.cells[apIndex]

  //     this.tooltip = {
  //       position,
  //       alignedPosition,
  //     }
  //   }, 200)
  // },
  unmounted() {
    // this.setTooltipDebounced?.cancel()
    this.mutationObserver?.disconnect()
  },
  watch: {
    alignedPositions() {
      this.drawCells()
    },
    cellTheme() {
      this.drawCanvas()
    },
    hasAllData() {
      this.drawCells()
    },
    referenceMrnaId() {
      this.drawCanvas()
    },
    selectedRegion() {
      this.drawCells()
    },
    sortedDataIndicesCollapsed() {
      console.log('sortedDataIndicesCollapsed changed')
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
    ></canvas>
    <LoadingBox v-show="!hasAllData" :height="120" />

    <!--
    @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
      -->

    <!--
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
  --></div>
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
