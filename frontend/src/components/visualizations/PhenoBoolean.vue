<script lang="ts">
import * as d3 from 'd3'
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/config'
import type { DataIndexCollapsed, PhenoColumnBooleanData } from '@/types'
import { eventIndex } from '@/helpers/eventIndex'
import { valueKey } from '@/helpers/valueKey'
import { isGroup } from '@/helpers/isGroup'

export default {
  props: {
    field: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      padding: 4,
    }
  },
  computed: {
    ...mapState(useDataStore, [
      'phenos',
      'selectedDataIndices',
      'sequenceCount',
      'sortedDataIndicesCollapsed',
      'transitionTime',
    ]),
    ...mapWritableState(useDataStore, ['hoverRowIndex']),
    hasAllData(): boolean {
      return (
        this.phenos.length !== 0 && this.sortedDataIndicesCollapsed.length !== 0
      )
    },
    height(): number {
      return this.sequenceCount * CELL_SIZE
    },
    name(): string {
      return `pheno-${this.field}`
    },
    width(): number {
      return this.padding * 2 + CELL_SIZE
    },
  },
  methods: {
    ...mapActions(useDataStore, ['dragStart', 'dragEnd', 'dragUpdate']),
    svg() {
      return d3.select(`#${this.name}`)
    },
    positionTransform(index: number) {
      const y = index * CELL_SIZE
      return `translate(0,${y})`
    },
    drawPheno() {
      if (!this.hasAllData) return

      this.svg()
        .selectAll('g')
        .data<DataIndexCollapsed>(this.sortedDataIndicesCollapsed, valueKey)
        .join(
          (enter) => {
            const g = enter
              .append('g')
              .attr('transform', (data, index) => this.positionTransform(index))

            g.append('rect')
              .attr('height', CELL_SIZE)
              .attr('width', this.padding * 2 + CELL_SIZE)
              .attr('fill', 'transparent')

            g.append('circle')
              .attr('cx', this.padding + 0.5 * CELL_SIZE)
              .attr('cy', 0.5 * CELL_SIZE)
              .attr('r', (data) => {
                if (isGroup(data)) {
                  // TODO: Count unique values
                  return 4
                }

                const value = this.phenos[data][
                  this.field
                ] as PhenoColumnBooleanData

                if (value === true) return 4
                if (value === false) return 4
                return 1
              })
              .attr('stroke', (data) => {
                if (isGroup(data)) {
                  // TODO: Count unique values
                  return '#aaa'
                }

                const value = this.phenos[data][
                  this.field
                ] as PhenoColumnBooleanData

                if (value === true) return 'transparent'
                if (value === false) return '#aaa'
                return '#ccc'
              })
              .attr('fill', (data) => {
                if (isGroup(data)) {
                  // TODO: Count unique values
                  return 'url(#diagonalHatch)'
                }

                const value = this.phenos[data][
                  this.field
                ] as PhenoColumnBooleanData

                if (value === true) return '#666'
                if (value === false) return 'white'
                return '#ccc'
              })
            return g
          },
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('transform', (data, index) =>
                this.positionTransform(index)
              ),
          (exit) => exit.remove()
        )
        .attr('data-index', (data, index) => index)
        .attr('data-selected', (data) => {
          if (isGroup(data)) return false
          return this.selectedDataIndices.includes(data)
        })
        .attr('data-hovered', (data, index) => this.hoverRowIndex === index)
        .on('mousedown', (event: MouseEvent) => {
          const index = eventIndex(event)
          if (index === null) return

          this.dragStart(index, event.ctrlKey)
        })
        .on('mouseover', (event) => {
          const index = eventIndex(event)
          if (index === null) return

          if (this.hoverRowIndex !== index) {
            this.hoverRowIndex = index
            this.dragUpdate(index)
          }
        })
        .on('mouseup', (event) => {
          const index = eventIndex(event)
          if (index === null) return

          this.dragEnd(index)
        })
        .on('mouseout', () => {
          this.hoverRowIndex = null
        })
    },
  },
  mounted() {
    this.drawPheno()
  },
  watch: {
    hasAllData() {
      this.drawPheno()
    },
    sortedDataIndicesCollapsed() {
      this.drawPheno()
    },
    phenos() {
      this.drawPheno()
    },
    selectedDataIndices() {
      this.drawPheno()
    },
    hoverRowIndex() {
      this.drawPheno()
    },
  },
}
</script>

<template>
  <svg :id="name" :width="width" :height="height" class="pheno-boolean">
    <defs>
      <pattern
        id="diagonalHatch"
        patternUnits="userSpaceOnUse"
        width="4"
        height="4"
      >
        <path
          d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2"
          stroke="#000000"
          stroke-width="1"
        ></path>
      </pattern>
    </defs>
  </svg>
</template>

<style lang="scss">
.pheno-boolean {
  flex: 0 0 auto;

  g {
    cursor: crosshair;

    &[data-selected='true'] circle {
      stroke: #000;
    }

    &[data-hovered='true'] circle {
      stroke: #1890ff;
    }
  }
}
</style>
