<script lang="ts">
import * as d3 from 'd3'
import { useDataStore } from '@/stores/data'
import { mapActions, mapState, mapWritableState } from 'pinia'
import { CELL_SIZE } from '@/constants'

import LoadingBox from '@/components/common/LoadingBox.vue'

import type { DataIndexCollapsed, Nucleotide } from '@/types'
import { valueKey } from '@/helpers/valueKey'
import { isGroup } from '@/helpers/isGroup'
import { keys, pickBy } from 'lodash'
import { useTooltipStore } from '@/stores/tooltip'
import { groupName } from '@/helpers/groupName'
import { groupCounts } from '@/helpers/groupCounts'
import { drawNucleotide, sortNucleotideString } from '@/helpers/nucleotide'
import type { StyleValue } from 'vue'
import { useConfigStore } from '@/stores/config'

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
      'filteredPositions',
      'filteredPositionsCount',
      'geneLength',
      'groups',
      'homologyId',
      'mrnaIds',
      'nucleotideColor',
      'reference',
      'referenceNucleotides',
      'sequenceCount',
      'sortedDataIndicesCollapsed',
      'transitionTime',
      'variablePositions',
    ]),
    ...mapState(useConfigStore, ['filters']),
    ...mapWritableState(useDataStore, ['hoverRowIndex']),
    hasAllData(): boolean {
      return (
        this.sequenceCount !== 0 &&
        this.sortedDataIndicesCollapsed.length !== 0 &&
        this.alignedPositions.length !== 0
      )
    },
    width(): number {
      return this.filteredPositionsCount * CELL_SIZE
    },
    height(): number {
      return this.sequenceCount * CELL_SIZE
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
        this.filteredPositions.forEach((position, column) => {
          result.push({ data, position, column, row })
        })
      })

      return result
    },
    groupAggregates(): GroupAggregates {
      return Object.fromEntries(
        this.groups.map(({ id, dataIndices }) => {
          const aggregates = this.filteredPositions.map((position) => {
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
              const nucleotide = this.nucleotideAtPosition(dataIndex, position)
              counts[nucleotide]++
            })

            const nucleotides = sortNucleotideString(
              keys(pickBy(counts)).join('')
            )

            return { counts, nucleotides }
          })

          return [id, aggregates]
        })
      )
    },
    hoverCellStyle(): StyleValue {
      if (this.hoverColIndex === null || this.hoverRowIndex === null) return {}
      return {
        left: this.hoverColIndex * CELL_SIZE + 'px',
        top: this.hoverRowIndex * CELL_SIZE + 'px',
      }
    },
    hoverRowStyle(): StyleValue {
      if (this.hoverRowIndex === null) return {}
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
    nucleotideAtPosition(dataIndex: number, position: number): Nucleotide {
      return this.alignedPositions[dataIndex * this.geneLength + position - 1]
    },
    isReference(data: DataIndexCollapsed): boolean {
      if (!this.reference) return false

      if (this.reference.type === 'group') {
        return isGroup(data) && this.reference.id === data.id
      }

      if (this.reference.type === 'data') {
        return this.reference.dataIndex === data
      }

      return false
    },
    draw() {
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
            return nucleotides
          }

          return this.nucleotideAtPosition(data, position)
        })
    },
    updateCanvasCell(
      ctx: CanvasRenderingContext2D,
      nucleotides: string,
      column: number,
      x: number,
      y: number,
      isReference: boolean
    ) {
      const matchesReference =
        this.referenceNucleotides &&
        !isReference &&
        this.referenceNucleotides[column] === nucleotides

      drawNucleotide({
        ctx,
        nucleotides: matchesReference ? '' : nucleotides,
        x,
        y,
        colorFn: this.nucleotideColor,
      })
    },
    updateCanvas() {
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
      ctx.clearRect(0, 0, this.width, this.height)

      const that = this

      d3.select(this.customNode)
        .selectAll<HTMLElement, any>('c')
        .each(function ({ data, column }) {
          if (!this) return

          const nucleotides = this.getAttribute('nucleotides') as string
          const x = parseInt(this.getAttribute('x') as string)
          const y = parseInt(this.getAttribute('y') as string)

          that.updateCanvasCell(
            ctx,
            nucleotides,
            column,
            x,
            y,
            that.isReference(data)
          )
        })
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
          const position = this.filteredPositions[column]

          if (isGroup(data)) {
            const { counts } = this.groupAggregates[data.id][column]
            const nucleotides = groupCounts(counts)

            return {
              title: groupName(data),
              template: `
                  <ADescriptions size="small" layout="horizontal" :column="1" bordered>
                    <ADescriptionsItem label="Bases">
                      {{ nucleotides }}
                    </ADescriptionsItem>
                    <ADescriptionsItem label="Position">
                      {{ position }}
                    </ADescriptionsItem>
                  </ADescriptions>
                `,
              data: {
                nucleotides,
                position,
              },
              isCompact: true,
              isPinnable: true,
            }
          }

          const nucleotide = this.nucleotideAtPosition(data, position)
          const varPos = this.variablePositions[position - 1]

          return {
            title: this.mrnaIds[data],
            template: `
                <ADescriptions size="small" layout="horizontal" :column="1" bordered>
                  <ADescriptionsItem label="Base">
                    {{ nucleotide }}
                  </ADescriptionsItem>
                  <ADescriptionsItem label="Position">
                    {{ position }}
                  </ADescriptionsItem>
                  <ADescriptionsItem label="Variable">
                    <BooleanIndicator :value="!!varPos" />
                  </ADescriptionsItem>
                  <template v-if="varPos">
                    <ADescriptionsItem label="Informative">
                      <BooleanIndicator :value="varPos.properties.informative" />
                    </ADescriptionsItem>
                    <ADescriptionsItem :label="property.label" v-for="property in properties">
                      <BooleanIndicator :value="varPos.properties[property.column]" />
                    </ADescriptionsItem>
                  </template>
                </ADescriptions>
              `,
            data: {
              nucleotide,
              position,
              properties: this.filters,
              varPos,
            },
            isCompact: true,
            isPinnable: true,
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
    this.mutationObserver = new MutationObserver(() => this.updateCanvas())
    this.mutationObserver.observe(this.customNode, {
      attributes: true,
      childList: true,
      subtree: true,
    })
    this.draw()
  },
  unmounted() {
    this.mutationObserver?.disconnect()
  },
  watch: {
    alignedPositions() {
      this.draw()
    },
    cellTheme() {
      this.updateCanvas()
    },
    hasAllData() {
      this.draw()
    },
    reference() {
      this.updateCanvas()
    },
    filteredPositions() {
      this.draw()
    },
    sortedDataIndicesCollapsed(newData, oldData) {
      // Don't redraw unless data actually changed.
      if (!this.isDataEqual(newData, oldData)) {
        this.draw()
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
@import '@/assets/colors.module.scss';

.heatmap-tooltip-virtual-element {
  pointer-events: none;
  position: absolute;
  width: 10px;
  height: 10px;
}

.heatmap-cell-hover {
  pointer-events: none;
  border: 1px solid $hover;
  position: absolute;
  width: 10px;
  height: 10px;
}

.heatmap-row-hover {
  pointer-events: none;
  border-top: 1px solid $hover;
  border-bottom: 1px solid $hover;
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
