<script lang="ts">
import * as d3 from 'd3'
import { useDataStore } from '@/stores/data'
import { mapActions, mapState, mapWritableState } from 'pinia'
import { CELL_SIZE } from '@/config'

import type { AlignedPosition } from '@/types'

import LoadingBox from '@/components/common/LoadingBox.vue'

import type { DataIndexCollapsed, Nucleotide } from '@/types'
import { valueKey } from '@/helpers/valueKey'
import { arrayRange } from '@/helpers/arrayRange'
import { isGroup } from '@/helpers/isGroup'
import { keys, pickBy } from 'lodash'
import { useTooltipStore } from '@/stores/tooltip'
import { groupName } from '@/helpers/groupName'
import { groupCounts } from '@/helpers/groupCounts'

type CellCoordinate = {
  column: number
  row: number
}

type Cell = {
  data: DataIndexCollapsed
  position: number
  column: number
  row: number
}

type GroupCounts = Record<Nucleotide, number>

type GroupAggregates = Record<
  number,
  {
    // Counts per nucleotide in this position.
    counts: GroupCounts
    // String of nucleotides in this position (eg: AC-).
    nucleotides: string
  }[]
>

export default {
  components: {
    LoadingBox,
  },
  data() {
    return {
      customNode: document.createElement('custom:node'),
      hoverColIndex: null as number | null,
      mutationObserver: null as MutationObserver | null,
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
          result.push({ data, position, column, row })
        })
      })

      return result
    },
    groupAggregates(): GroupAggregates {
      return Object.fromEntries(
        this.groups.map(({ id, dataIndices }) => {
          const aggregates = this.positions.map((position) => {
            const counts: GroupCounts = {
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
    hoverCellStyle() {
      if (this.hoverColIndex === null || this.hoverRowIndex === null) return
      return {
        left: this.hoverColIndex * CELL_SIZE + 'px',
        top: this.hoverRowIndex * CELL_SIZE + 'px',
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
    ...mapActions(useTooltipStore, ['showTooltip', 'hideTooltip']),
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
    mouseEventToCell(event: MouseEvent): CellCoordinate | undefined {
      const [x, y] = d3.pointer(event)
      const column = Math.floor(x / CELL_SIZE)
      const row = Math.floor(y / CELL_SIZE)

      // Some rows are collapsed into groups. The empty space at the
      // bottom of the canvas should no longer return a valid cell.
      if (row >= this.sortedDataIndicesCollapsed.length) return

      return {
        column,
        row,
      }
    },
    onMouseMove(event: MouseEvent) {
      if (!this.hasAllData) return

      const cell = this.mouseEventToCell(event)

      // We are on the canvas, but at a point where there are no cells.
      if (!cell) {
        this.onMouseLeave()
        return
      }

      const { row, column } = cell

      if (this.hoverRowIndex !== row) {
        this.hoverRowIndex = row
        this.dragUpdate(row)
      }
      this.hoverColIndex = column

      this.showTooltip({
        key: `heatmap-${row}-${column}`,
        element: this.$refs.hoverCell as HTMLDivElement,
        generateContent: () => {
          const data = this.sortedDataIndicesCollapsed[row]
          const position = this.positions[column]

          if (isGroup(data)) {
            const { counts } = this.groupAggregates[data.id][column]
            const nucleotides = groupCounts(counts)
            const mrnaIds = data.dataIndices
              .map((dataIndex) => this.mrnaIds[dataIndex])
              .join(', ')

            return {
              title: groupName(data),
              template: `
                  <a-descriptions size="small" layout="horizontal" :column="1" bordered>
                    <a-descriptions-item label="Bases">
                      {{ nucleotides }}
                    </a-descriptions-item>
                    <a-descriptions-item label="Position">
                      {{ position }}
                    </a-descriptions-item>
                  </a-descriptions>
                `,
              data: {
                mrnaIds,
                nucleotides,
                position,
              },
              isCompact: true,
            }
          }

          const alignedPosition = this.dataAtPosition(data, position)

          return {
            title: this.mrnaIds[data],
            template: `
                <a-descriptions size="small" layout="horizontal" :column="1" bordered>
                  <a-descriptions-item label="Base">
                    {{ alignedPosition.nucleotide }}
                  </a-descriptions-item>
                  <a-descriptions-item label="Position">
                    {{ alignedPosition.position }}
                  </a-descriptions-item>
                  <a-descriptions-item label="Variable">
                    <BooleanIndicator :value="alignedPosition.variable" />
                  </a-descriptions-item>
                </a-descriptions>
              `,
            data: {
              alignedPosition,
            },
            isCompact: true,
          }
        },
      })
    },
    onMouseLeave() {
      this.hideTooltip()
      this.hoverColIndex = null
      this.hoverRowIndex = null
    },
    isDataEqual(a: DataIndexCollapsed[], b: DataIndexCollapsed[]) {
      // Different lengths, so must have changed.
      if (a.length !== b.length) return false
      // We assume groups don't change internally when collapsed.
      return a.every((aData, index) => {
        const bData = b[index]
        const isGroupA = isGroup(aData)
        const isGroupB = isGroup(bData)
        if (isGroupA || isGroupB) return isGroupA === isGroupB
        return aData === bData
      })
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
    sortedDataIndicesCollapsed(newData, oldData) {
      // Don't redraw unless data actually changed.
      if (!this.isDataEqual(newData, oldData)) {
        this.drawCells()
      }
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

    <div
      ref="hoverCell"
      class="heatmap-cell-hover"
      v-show="hoverColIndex !== null && hasAllData"
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
</style>
