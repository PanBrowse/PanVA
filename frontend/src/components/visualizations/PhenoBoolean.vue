<script lang="ts">
import * as d3 from 'd3'
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/config'
import type { DataIndexCollapsed, PhenoColumnBooleanData } from '@/types'
import { eventIndex } from '@/helpers/eventIndex'
import { valueKey } from '@/helpers/valueKey'
import { isGroup } from '@/helpers/isGroup'
import { mapCountBy } from '@/helpers/mapCountBy'
import { uniq } from 'lodash'

type GroupCounts = Map<PhenoColumnBooleanData, number>

type GroupAggregates = Record<
  number,
  {
    // Counts per value in this position.
    counts: GroupCounts
    // Unique values within the group in this position.
    values: PhenoColumnBooleanData[]
  }
>

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
      'groups',
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
    groupAggregates(): GroupAggregates {
      return Object.fromEntries(
        this.groups.map(({ id, dataIndices }) => {
          const allValues = dataIndices.map(
            (dataIndex) =>
              this.phenos[dataIndex][this.field] as PhenoColumnBooleanData
          )
          const counts = mapCountBy(allValues)
          const values = uniq(allValues)

          return [id, { counts, values }]
        })
      )
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
    circleRadius(values: PhenoColumnBooleanData[]) {
      if (values.length === 1) {
        if (values[0] === true) return 4
        if (values[0] === false) return 4
        return 1
      }
      // Diagonal hatch.
      return 4
    },
    circleStroke(values: PhenoColumnBooleanData[]) {
      if (values.length === 1) {
        if (values[0] === true) return 'transparent'
        if (values[0] === false) return '#aaa'
        return '#ccc'
      }
      // Diagonal hatch.
      return '#aaa'
    },
    circleFill(values: PhenoColumnBooleanData[]) {
      if (values.length === 1) {
        if (values[0] === true) return '#666'
        if (values[0] === false) return 'white'
        return '#ccc'
      }
      // Diagonal hatch.
      return 'url(#diagonalHatch)'
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
        .select('circle')
        .attr('r', (data) => {
          if (isGroup(data)) {
            const { values } = this.groupAggregates[data.id]
            return this.circleRadius(values)
          }

          const value = this.phenos[data][this.field] as PhenoColumnBooleanData
          return this.circleRadius([value])
        })

        .attr('stroke', (data) => {
          if (isGroup(data)) {
            const { values } = this.groupAggregates[data.id]
            if (data.isColorized) return data.color
            return this.circleStroke(values)
          }

          const value = this.phenos[data][this.field] as PhenoColumnBooleanData
          return this.circleStroke([value])
        })
        .attr('fill', (data) => {
          if (isGroup(data)) {
            const { values } = this.groupAggregates[data.id]
            return this.circleFill(values)
          }

          const value = this.phenos[data][this.field] as PhenoColumnBooleanData
          return this.circleFill([value])
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
