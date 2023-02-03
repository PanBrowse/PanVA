<script lang="ts">
import * as d3 from 'd3'
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/constants'
import type { DataIndexCollapsed, PhenoColumnCategoricalData } from '@/types'
import { valueKey } from '@/helpers/valueKey'
import { isGroup } from '@/helpers/isGroup'
import { eventIndex } from '@/helpers/eventIndex'
import { countBy, uniq } from 'lodash'
import { useTooltipStore } from '@/stores/tooltip'
import { groupName } from '@/helpers/groupName'

type GroupCounts = Record<PhenoColumnCategoricalData, number>

type GroupAggregates = Record<
  number,
  {
    // Counts per value in this position.
    counts: GroupCounts
    // Unique values within the group in this position.
    values: PhenoColumnCategoricalData[]
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
    width: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ...mapState(useDataStore, [
      'groups',
      'rowColors',
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
    rowValues(): (string | null)[] {
      return this.sortedDataIndicesCollapsed.map((data) => {
        if (isGroup(data)) {
          const { values } = this.groupAggregates[data.id]
          if (values.length === 1) {
            return values[0]
          }
          return null
        }
        return this.phenos[data][this.field] as PhenoColumnCategoricalData
      })
    },
    groupAggregates(): GroupAggregates {
      return Object.fromEntries(
        this.groups.map(({ id, dataIndices }) => {
          const allValues = dataIndices.map(
            (dataIndex) =>
              this.phenos[dataIndex][this.field] as PhenoColumnCategoricalData
          )
          const counts = countBy(allValues)
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
    drawPheno() {
      if (!this.hasAllData) return

      this.svg()
        .selectAll('foreignObject')
        .data<DataIndexCollapsed>(this.sortedDataIndicesCollapsed, valueKey)
        .join(
          (enter) =>
            enter
              .append('foreignObject')
              .attr('x', 3)
              .attr('y', (data, index) => index * CELL_SIZE)
              .attr('width', this.width)
              .attr('height', CELL_SIZE),

          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('y', (data, index) => index * CELL_SIZE),

          (exit) => exit.remove()
        )
        .text((data, index) => {
          const value = this.rowValues[index]
          if (value === null) return 'multiple'
          return value
        })
        .style('color', (data) => {
          if (isGroup(data)) {
            if (data.isColorized) return data.color
            return ''
          }
          return this.rowColors[data]
        })
        .attr('data-index', (data, index) => index)
        .attr('data-selected', (data) => {
          if (isGroup(data)) return false
          return this.selectedDataIndices.includes(data)
        })
        .attr('data-hovered', (data, index) => this.hoverRowIndex === index)
        .attr('data-similar', (data, index) => {
          if (this.hoverRowIndex === null) return false

          return (
            this.hoverRowIndex !== index &&
            this.rowValues[this.hoverRowIndex] === this.rowValues[index]
          )
        })
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

          const data = this.sortedDataIndicesCollapsed[index]
          if (isGroup(data)) {
            this.showTooltip({
              key: `pheno-${this.field}-${index}`,
              element: event.target,
              generateContent: () => {
                const { counts } = this.groupAggregates[data.id]

                return {
                  title: groupName(data),
                  template: `
                      <ADescriptions size="small" layout="horizontal" :column="1" bordered>
                        <ADescriptionsItem :label="value" v-for="(count, value) in counts">
                          {{ count }}
                        </ADescriptionsItem>
                      </ADescriptions>
                    `,
                  data: {
                    counts,
                  },
                  isCompact: true,
                  isPinnable: true,
                }
              },
            })
          }
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
  <svg
    :id="name"
    :width="width"
    :height="height"
    class="pheno-categorical"
  ></svg>
</template>

<style lang="scss">
.pheno-categorical {
  flex: 0 0 auto;

  foreignObject {
    user-select: none;
    color: darkgrey;
    font-size: 9px;
    line-height: 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: crosshair;

    &[data-selected='true'] {
      font-weight: 500;
      color: #333;
    }

    &[data-hovered='true'] {
      color: #1890ff;
    }

    &[data-similar='true'] {
      color: #7c9dda;
    }
  }
}
</style>
