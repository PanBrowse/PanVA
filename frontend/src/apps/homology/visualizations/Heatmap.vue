<script lang="ts">
import * as d3 from 'd3'
import { keys, pickBy } from 'lodash'
import { mapActions, mapState, mapWritableState } from 'pinia'
import type { StyleValue } from 'vue'

import { CELL_SIZE } from '@/constants'
import { groupCounts } from '@/helpers/groupCounts'
import { groupName } from '@/helpers/groupName'
import { isGroup } from '@/helpers/isGroup'
import {
  drawNucleotide,
  simplifyNucleotideString,
  sortNucleotideString,
} from '@/helpers/nucleotide'
import { valueKey } from '@/helpers/valueKey'
import { useConfigStore } from '@/stores/config'
import { useHomologyStore } from '@/stores/homology'
import { useTooltipStore } from '@/stores/tooltip'
import type { Alignment, DataIndexCollapsed, Nucleotide } from '@/types'

type Cell = {
  column: number
  row: number
}

type GroupCounts = Partial<Record<Nucleotide, number>>

type GroupAggregates = Record<
  // Group id
  number,
  // Array aligns with filteredPositions.
  {
    // Counts per nucleotide in this position.
    counts: GroupCounts
    // String of nucleotides in this position (eg: AC-).
    nucleotides: string
  }[]
>

export default {
  data() {
    return {
      customNode: document.createElement('custom:node'),
      hoverColIndex: null as number | null,
      mutationObserver: null as MutationObserver | null,
    }
  },
  computed: {
    ...mapState(useHomologyStore, [
      'alignedPositions',
      'filteredPositions',
      'filteredPositionsCount',
      'geneLength',
      'groupsFiltered',
      'highDpiEnabled',
      'mrnaIds',
      'reference',
      'referenceNucleotides',
      'sequenceCount',
      'sortedDataIndicesCollapsed',
      'theme',
      'transitionTime',
    ]),
    ...mapWritableState(useHomologyStore, ['hoverRowIndex']),
    alignmentMetadata() {
      const config = useConfigStore()
      return config.homology.alignmentMetadata
    },
    width(): number {
      return this.filteredPositionsCount * CELL_SIZE
    },
    height(): number {
      return this.sequenceCount * CELL_SIZE
    },
    groupAggregates(): GroupAggregates {
      return Object.fromEntries(
        this.groupsFiltered.map(({ id, dataIndices }) => {
          const aggregates = this.filteredPositions.map((position) => {
            const counts: GroupCounts = {}

            dataIndices.forEach((dataIndex) => {
              const { nucleotide } = this.dataAtPosition(dataIndex, position)
              if (nucleotide in counts) {
                // @ts-ignore
                counts[nucleotide]++
              } else {
                counts[nucleotide] = 1
              }
            })

            const nucleotides = sortNucleotideString(
              simplifyNucleotideString(keys(pickBy(counts)).join(''))
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
    hoverColStyle(): StyleValue {
      if (this.hoverColIndex === null) return {}
      return {
        top: 0,
        left: this.hoverColIndex * CELL_SIZE + 'px',
        height: this.height + 'px',
      }
    },
  },
  methods: {
    ...mapActions(useTooltipStore, ['showTooltip', 'hideTooltip']),
    ...mapActions(useHomologyStore, ['dragUpdate']),
    dataAtPosition(dataIndex: number, position: number): Alignment {
      return this.alignedPositions[dataIndex * this.geneLength + position - 1]
    },
    nucleotidesForDataIndex(dataIndex: DataIndexCollapsed): string[] {
      if (isGroup(dataIndex)) {
        return this.groupAggregates[dataIndex.id].map(
          (aggr) => aggr.nucleotides
        )
      }

      return this.filteredPositions.map((position) => {
        const { nucleotide } = this.dataAtPosition(dataIndex, position)
        return nucleotide
      })
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
    getContext(canvas: HTMLCanvasElement) {
      if (this.highDpiEnabled) {
        const scaleFactor = 2
        canvas.setAttribute('width', '' + this.width * scaleFactor)
        canvas.setAttribute('height', '' + CELL_SIZE * scaleFactor)
        canvas.style.width = this.width + 'px'
        canvas.style.height = CELL_SIZE + 'px'

        const ctx = canvas.getContext('2d')!
        ctx.scale(scaleFactor, scaleFactor)

        return ctx
      }

      canvas.setAttribute('width', '' + this.width)
      canvas.setAttribute('height', '' + CELL_SIZE)
      canvas.style.removeProperty('width')
      canvas.style.removeProperty('height')

      const ctx = canvas.getContext('2d')!

      return ctx
    },
    drawRow(ctx: CanvasRenderingContext2D, data: DataIndexCollapsed) {
      const isRef = this.isReference(data)

      this.nucleotidesForDataIndex(data).forEach((nucl, column) => {
        const matchesReference =
          this.referenceNucleotides &&
          !isRef &&
          nucl.length === 1 &&
          this.referenceNucleotides![column].includes(nucl)

        drawNucleotide({
          ctx,
          nucleotides: matchesReference ? '' : nucl,
          x: column * CELL_SIZE,
          y: 0,
          theme: this.theme,
        })
      })
    },
    draw(updateDraw = true) {
      console.time('Heatmap#draw')

      const that = this

      d3.select('#heatmap')
        .selectAll<HTMLCanvasElement, DataIndexCollapsed>('canvas')
        .data<DataIndexCollapsed>(this.sortedDataIndicesCollapsed, valueKey)
        .join(
          (enter) =>
            enter
              .append('canvas')
              .attr('width', this.width)
              .attr('height', CELL_SIZE)
              .style('top', (data, index) => index * CELL_SIZE + 'px')
              .each(function (data) {
                const ctx = that.getContext(this)
                that.drawRow(ctx, data)
              }),

          (update) =>
            update
              .each(function (data) {
                if (updateDraw) {
                  const ctx = that.getContext(this)
                  that.drawRow(ctx, data)
                }
              })
              .transition()
              .duration(this.transitionTime)
              .style('top', (data, index) => index * CELL_SIZE + 'px'),

          (exit) => exit.remove()
        )

      console.timeEnd('Heatmap#draw')
    },
    mouseEventToCell(event: MouseEvent): Cell | undefined {
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
                    <ADescriptionsItem label="Position">
                      {{ position }}
                    </ADescriptionsItem>
                    <ADescriptionsItem label="Bases">
                      {{ nucleotides }}
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

          const alignment = this.dataAtPosition(data, position)
          const alignmentMetadata = this.alignmentMetadata.filter(
            (metadata) => {
              const value = alignment.metadata[metadata.column]
              if (value === null) return false
              if (value === undefined) return false
              if (value === '') return false
              return true
            }
          )

          return {
            title: this.mrnaIds[data],
            template: `
              <ADescriptions size="small" layout="horizontal" :column="1" bordered>
                <ADescriptionsItem label="Position">
                  {{ position }}
                </ADescriptionsItem>
                <ADescriptionsItem label="Base">
                  {{ alignment.nucleotide }}
                </ADescriptionsItem>
                <ADescriptionsItem
                  :label="metadata.label"
                  v-for="metadata in alignmentMetadata"
                  v-bind:key="metadata.column"
                >
                  <MetadataValue
                    :metadata="metadata"
                    :value="alignment.metadata[metadata.column]"
                  />
                </ADescriptionsItem>
              </ADescriptions>
            `,
            data: {
              position,
              alignment,
              alignmentMetadata,
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
  },
  mounted() {
    this.draw()
  },

  watch: {
    alignedPositions() {
      this.draw()
    },
    filteredPositions() {
      this.draw()
    },
    highDpiEnabled() {
      this.draw()
    },
    reference() {
      this.draw()
    },
    sortedDataIndicesCollapsed() {
      this.draw(false)
    },
    theme() {
      this.draw()
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
    }"
  >
    <div id="heatmap" @mousemove="onMouseMove" @mouseleave="onMouseLeave"></div>

    <div
      ref="hoverCell"
      class="heatmap-cell-hover"
      v-show="hoverColIndex !== null"
      :style="hoverCellStyle"
    />

    <div
      class="heatmap-col-hover"
      v-if="hoverColIndex !== null"
      :style="hoverColStyle"
    />

    <div
      class="heatmap-row-hover"
      v-if="hoverRowIndex !== null"
      :style="hoverRowStyle"
    />
  </div>
</template>

<style lang="scss">
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

.heatmap-col-hover {
  pointer-events: none;
  border-right: 1px solid $hover;
  border-left: 1px solid $hover;
  position: absolute;
  width: 10px;
}

.heatmap-wrapper {
  position: relative;
}

#heatmap {
  position: relative;

  canvas {
    background: white;
    position: absolute;
    left: 0;

    /* image-rendering: pixelated; */
  }
}
</style>
