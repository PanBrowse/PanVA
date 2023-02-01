<script lang="ts">
import * as d3 from 'd3'
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/constants'
import type {
  DataIndexCollapsed,
  PhenoColumnBoolean,
  PhenoColumnBooleanData,
} from '@/types'
import { eventIndex } from '@/helpers/eventIndex'
import { valueKey } from '@/helpers/valueKey'
import { isGroup } from '@/helpers/isGroup'
import { mapCountBy } from '@/helpers/mapCountBy'
import { uniq } from 'lodash'
import { useTooltipStore } from '@/stores/tooltip'
import { groupName } from '@/helpers/groupName'
import type { PropType } from 'vue'

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
    /**
     * Since a field can be reused in multiple columns, for different
     * visualizations of the same data, we use the index in the
     * `phenoColumns` configuration option in the unique identifier
     * for this component.
     */
    id: {
      type: Number,
      required: true,
    },
    field: {
      type: String,
      required: true,
    },
    labels: {
      type: Object as PropType<PhenoColumnBoolean['labels']>,
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
      'mrnaIds',
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
      return `pheno-${this.id}-${this.field}`
    },
    width(): number {
      return this.padding * 2 + CELL_SIZE
    },
    groupAggregates(): GroupAggregates {
      return Object.fromEntries(
        this.groups.map(({ id, dataIndices }) => {
          const allValues = dataIndices.map(this.valueAtDataIndex)
          const counts = mapCountBy(allValues)
          const values = uniq(allValues)

          return [id, { counts, values }]
        })
      )
    },
  },
  methods: {
    ...mapActions(useTooltipStore, ['showTooltip', 'hideTooltip']),
    ...mapActions(useDataStore, ['dragStart', 'dragEnd', 'dragUpdate']),
    svg() {
      return d3.select(`#${this.name}`)
    },
    valueAtDataIndex(dataIndex: number): PhenoColumnBooleanData {
      return this.phenos[dataIndex][this.field] as PhenoColumnBooleanData
    },
    labelForValue(value: PhenoColumnBooleanData) {
      return this.labels[`${value}`]
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
        .selectAll('circle')
        .data<DataIndexCollapsed>(this.sortedDataIndicesCollapsed, valueKey)
        .join(
          (enter) =>
            enter
              .append('circle')
              .attr('cx', this.padding + 0.5 * CELL_SIZE)
              .attr('cy', (data, index) => (index + 0.5) * CELL_SIZE)
              .attr('r', (data) => {
                if (isGroup(data)) {
                  const { values } = this.groupAggregates[data.id]
                  return this.circleRadius(values)
                }

                const value = this.valueAtDataIndex(data)
                return this.circleRadius([value])
              })

              .attr('fill', (data) => {
                if (isGroup(data)) {
                  const { values } = this.groupAggregates[data.id]
                  return this.circleFill(values)
                }

                const value = this.valueAtDataIndex(data)
                return this.circleFill([value])
              }),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('cy', (data, index) => (index + 0.5) * CELL_SIZE),
          (exit) => exit.remove()
        )
        .attr('data-selected', (data) => {
          if (isGroup(data)) return false
          return this.selectedDataIndices.includes(data)
        })
        .attr('data-hovered', (data, index) => this.hoverRowIndex === index)
        .attr('stroke', (data) => {
          if (isGroup(data)) {
            const { values } = this.groupAggregates[data.id]
            if (data.isColorized) return data.color
            return this.circleStroke(values)
          }

          const value = this.valueAtDataIndex(data)
          return this.circleStroke([value])
        })

      // We want to have interactivity on the whole cell, so we draw a rect on
      // top of the actual graphics to receive mouse events on a larger area.
      this.svg()
        .selectAll('rect')
        .data<DataIndexCollapsed>(this.sortedDataIndicesCollapsed, valueKey)
        .join(
          (enter) =>
            enter
              .append('rect')
              .attr('y', (data, index) => index * CELL_SIZE)
              .attr('height', CELL_SIZE)
              .attr('width', this.padding * 2 + CELL_SIZE)
              .attr('fill', 'transparent'),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('y', (data, index) => index * CELL_SIZE),
          (exit) => exit.remove()
        )
        .attr('data-index', (data, index) => index)
        .on('mousedown', (event: MouseEvent) => {
          const index = eventIndex(event)
          if (index === null) return

          this.dragStart(index, event.ctrlKey || event.altKey)
        })
        .on('mouseover', (event) => {
          const index = eventIndex(event)
          if (index === null) return

          if (this.hoverRowIndex !== index) {
            this.hoverRowIndex = index
            this.dragUpdate(index)
          }

          this.showTooltip({
            key: `pheno-${this.field}-${index}`,
            element: event.target,
            generateContent: () => {
              const data = this.sortedDataIndicesCollapsed[index]

              if (isGroup(data)) {
                const { counts } = this.groupAggregates[data.id]
                const labeledCounts = Object.fromEntries(
                  Array.from(counts).map(([value, count]) => [
                    this.labelForValue(value),
                    count,
                  ])
                )

                return {
                  title: groupName(data),
                  template: `
                  <a-descriptions size="small" layout="horizontal" :column="1" bordered>
                    <a-descriptions-item v-for="(count, label) in labeledCounts" :label="label">
                      {{ count }}
                    </a-descriptions-item>
                  </a-descriptions>
                `,
                  data: {
                    labeledCounts,
                  },
                  isCompact: true,
                }
              }

              const value = this.valueAtDataIndex(data)

              return {
                content: this.labelForValue(value),
              }
            },
          })
        })
        .on('mouseup', (event) => {
          const index = eventIndex(event)
          if (index === null) return

          this.dragEnd(index)
        })
        .on('mouseout', () => {
          this.hoverRowIndex = null
          this.hideTooltip()
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

  rect {
    cursor: crosshair;
  }

  circle {
    &[data-selected='true'] {
      stroke: #000;
    }

    &[data-hovered='true'] {
      stroke: #1890ff;
    }
  }
}
</style>
