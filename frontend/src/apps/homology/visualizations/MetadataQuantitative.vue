<script lang="ts">
import * as d3 from 'd3'
import { max, mean, uniq } from 'lodash'
import { mapActions, mapState, mapWritableState } from 'pinia'
import type { PropType } from 'vue'

import colors from '@/assets/colors.module.scss'
import { CELL_SIZE } from '@/constants'
import { eventIndex } from '@/helpers/eventIndex'
import { groupName } from '@/helpers/groupName'
import { isGroup } from '@/helpers/isGroup'
import { mapCountBy } from '@/helpers/mapCountBy'
import { formatNumber } from '@/helpers/number'
import { valueKey } from '@/helpers/valueKey'
import { useHomologyStore } from '@/stores/homology'
import { useTooltipStore } from '@/stores/tooltip'
import type {
  ConfigMetadataQuantitative,
  DataIndexCollapsed,
  MetadataQuantitative,
} from '@/types'

type GroupCounts = Map<MetadataQuantitative, number>

type GroupAggregates = Record<
  number,
  {
    // Counts per value in this position.
    counts: GroupCounts
    // Unique values within the group in this position.
    values: MetadataQuantitative[]
  }
>

type GroupValue = {
  meanValue: number
  nullCount: number
}

export default {
  props: {
    column: {
      type: Object as PropType<ConfigMetadataQuantitative>,
      required: true,
    },
  },
  computed: {
    ...mapState(useHomologyStore, [
      'groupsFiltered',
      'rowColors',
      'selectedDataIndicesSet',
      'sequenceCount',
      'sequences',
      'sortedDataIndicesCollapsed',
      'transitionTime',
    ]),
    ...mapWritableState(useHomologyStore, ['hoverRowIndex']),
    height(): number {
      return this.sequenceCount * CELL_SIZE
    },
    maximumValue(): number {
      if (this.column.maxValue) return this.column.maxValue
      const maximum = max(
        this.sequences
          .map(
            ({ metadata }) =>
              metadata[this.column.column] as MetadataQuantitative
          )
          .filter((value) => value !== null)
      )
      return maximum || 0
    },
    name(): string {
      return `metadata-${this.column.column}`
    },
    rowValues(): (MetadataQuantitative | GroupValue)[] {
      return this.sortedDataIndicesCollapsed.map((data) => {
        if (isGroup(data)) {
          const { values } = this.groupAggregates[data.id]

          const meanValue = mean(values.filter((value) => value !== null))
          const nullCount = values.filter((value) => value === null).length

          return {
            meanValue,
            nullCount,
          }
        }

        const value = this.valueAtDataIndex(data)
        if (value !== null) return value

        return null
      })
    },
    groupAggregates(): GroupAggregates {
      return Object.fromEntries(
        this.groupsFiltered.map(({ id, dataIndices }) => {
          const allValues = dataIndices.map(this.valueAtDataIndex)
          const counts = mapCountBy(allValues)
          const values = uniq(allValues)

          return [id, { counts, values }]
        })
      )
    },
    colors() {
      return colors
    },
    width(): number {
      return this.column.width || 120
    },
  },
  methods: {
    ...mapActions(useTooltipStore, ['showTooltip', 'hideTooltip']),
    ...mapActions(useHomologyStore, ['dragStart', 'dragEnd', 'dragUpdate']),
    widthForIndex(value: number): number {
      if (value >= this.maximumValue) return this.width
      return (value * this.width) / this.maximumValue
    },
    barWidth(data: DataIndexCollapsed, index: number): number {
      const value = this.rowValues[index]
      if (isGroup(data)) {
        const { meanValue, nullCount } = value as GroupValue
        if (nullCount === data.dataIndices.length) return 0
        return this.widthForIndex(meanValue)
      }
      if (value !== null) return this.widthForIndex(value as number)
      return 0
    },
    barText(data: DataIndexCollapsed, index: number): string {
      const value = this.rowValues[index]
      if (isGroup(data)) {
        const { meanValue, nullCount } = value as GroupValue
        if (nullCount === data.dataIndices.length) return '?'
        if (nullCount)
          return (
            formatNumber(meanValue, this.column.decimals, this.column.suffix) +
            ` +${nullCount}?`
          )
        return formatNumber(meanValue, this.column.decimals, this.column.suffix)
      }
      if (value === null) return '?'
      return formatNumber(
        value as MetadataQuantitative,
        this.column.decimals,
        this.column.suffix
      )
    },
    fillColor(data: DataIndexCollapsed): string {
      if (isGroup(data)) {
        if (data.isColorized) return data.color
        return ''
      }
      return this.rowColors[data] || ''
    },
    valueAtDataIndex(dataIndex: number): MetadataQuantitative {
      return this.sequences[dataIndex].metadata[
        this.column.column
      ] as MetadataQuantitative
    },
    textY(index: number) {
      return (index + 1) * CELL_SIZE - 2
    },
    svg() {
      return d3.select(`#${this.name}`)
    },
    draw() {
      this.svg()
        .selectAll('rect.bar')
        .data<DataIndexCollapsed>(this.sortedDataIndicesCollapsed, valueKey)
        .join(
          (enter) =>
            enter
              .append('rect')
              .attr('class', 'bar')
              .attr('x', 0)
              .attr('rx', 2)
              .attr('ry', 2)
              .attr('y', (data, index) => index * CELL_SIZE)
              .attr('width', (data, index) => this.barWidth(data, index))
              .attr('height', CELL_SIZE - 1),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('y', (data, index) => index * CELL_SIZE),

          (exit) => exit.remove()
        )
        .style('fill', (data) => this.fillColor(data))
        .attr('data-index', (data, index) => index)
        .attr('data-selected', (data) => {
          if (isGroup(data)) return false
          return this.selectedDataIndicesSet.has(data)
        })

      this.svg()
        .selectAll('text')
        .data<DataIndexCollapsed>(this.sortedDataIndicesCollapsed, valueKey)
        .join(
          (enter) =>
            enter
              .append('text')
              .attr('x', 2)
              .attr('y', (data, index) => this.textY(index))
              .text((data, index) => this.barText(data, index)),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('y', (data, index) => this.textY(index)),

          (exit) => exit.remove()
        )
        .style('fill', (data) => this.fillColor(data))
        .attr('data-index', (data, index) => index)
        .attr('data-selected', (data) => {
          if (isGroup(data)) return false
          return this.selectedDataIndicesSet.has(data)
        })

      this.svg()
        .selectAll('rect.events')
        .data<DataIndexCollapsed>(this.sortedDataIndicesCollapsed, valueKey)
        .join(
          (enter) =>
            enter
              .append('rect')
              .attr('class', 'events')
              .attr('x', 0)
              .attr('y', (data, index) => index * CELL_SIZE)
              .attr('width', this.width)
              .attr('height', CELL_SIZE),
          (update) => update.attr('y', (data, index) => index * CELL_SIZE),

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

          const data = this.sortedDataIndicesCollapsed[index]
          if (isGroup(data)) {
            this.showTooltip({
              key: this.name,
              element: event.target,
              generateContent: () => {
                const { counts } = this.groupAggregates[data.id]

                return {
                  title: groupName(data),
                  template: `
                      <ADescriptions size="small" layout="horizontal" :column="1" bordered>
                        <ADescriptionsItem :label="value === null ? '?' : value" v-for="[value, count] in counts">
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
    this.draw()
  },
  watch: {
    sortedDataIndicesCollapsed() {
      this.draw()
    },
    selectedDataIndicesSet() {
      this.draw()
    },
  },
}
</script>

<template>
  <svg :id="name" :width="width" :height="height" class="metadata-quantitative">
    <component is="style" type="text/css">
      <!-- prettier-ignore -->
      <template v-if="hoverRowIndex !== null">
        #{{ name }} rect.bar[data-index="{{ hoverRowIndex }}"] {
          fill: {{ colors.hover }} !important;
        }
        
        #{{ name }} text[data-index="{{ hoverRowIndex }}"] {
          fill: {{ colors.hover }} !important;
        }
      </template>
    </component>
  </svg>
</template>

<style lang="scss">
@import '@/assets/colors.module.scss';

.metadata-quantitative {
  margin-left: 4px;

  flex: 0 0 auto;

  rect.bar {
    pointer-events: none;
    fill: $gray-7;
    fill-opacity: 0.2;

    &[data-selected='true'] {
      fill: $selection;
    }
  }

  text {
    pointer-events: none;
    fill: $gray-7;
    font-size: 9px;

    &[data-selected='true'] {
      fill: $selection;
    }
  }

  rect.events {
    fill: transparent;
    cursor: crosshair;
    pointer-events: all;
  }
}
</style>
