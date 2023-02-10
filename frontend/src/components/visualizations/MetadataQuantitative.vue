<script lang="ts">
import * as d3 from 'd3'
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/constants'
import type { DataIndexCollapsed, MetadataQuantitative } from '@/types'
import { valueKey } from '@/helpers/valueKey'
import { isGroup } from '@/helpers/isGroup'
import { eventIndex } from '@/helpers/eventIndex'
import { max, mean, round, uniq } from 'lodash'
import { useTooltipStore } from '@/stores/tooltip'
import { groupName } from '@/helpers/groupName'
import { mapCountBy } from '@/helpers/mapCountBy'

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
    /**
     * Since a field can be reused in multiple columns, for different
     * visualizations of the same data, we use the index in the
     * `metadata` configuration option in the unique identifier
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
    decimals: {
      type: Number,
      required: false,
    },
    maxValue: {
      type: Number,
      required: false,
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
      'metadata',
      'selectedDataIndices',
      'sequenceCount',
      'sortedDataIndicesCollapsed',
      'transitionTime',
    ]),
    ...mapWritableState(useDataStore, ['hoverRowIndex']),
    hasAllData(): boolean {
      return (
        this.metadata.length !== 0 &&
        this.sortedDataIndicesCollapsed.length !== 0
      )
    },
    height(): number {
      return this.sequenceCount * CELL_SIZE
    },
    maximumValue(): number {
      if (this.maxValue) return this.maxValue
      const maximum = max(
        this.metadata
          .map((data) => data[this.field] as MetadataQuantitative)
          .filter((value) => value !== null)
      )
      return maximum || 0
    },
    name(): string {
      return `metadata-${this.id}-${this.field}`
    },
    rowValues(): (MetadataQuantitative | GroupValue)[] {
      const decimals = this.decimals || 0
      return this.sortedDataIndicesCollapsed.map((data) => {
        if (isGroup(data)) {
          const { values } = this.groupAggregates[data.id]

          const meanValue = round(
            mean(values.filter((value) => value !== null)),
            decimals
          )
          const nullCount = values.filter((value) => value === null).length

          return {
            meanValue,
            nullCount,
          }
        }

        const value = this.valueAtDataIndex(data)
        if (value !== null) return round(value, decimals)

        return null
      })
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
    isBarEmpty(data: DataIndexCollapsed, index: number): boolean {
      const value = this.rowValues[index]
      if (isGroup(data)) {
        const { nullCount } = value as GroupValue
        return nullCount === data.dataIndices.length
      }
      return value === null
    },
    barText(data: DataIndexCollapsed, index: number): string {
      if (this.isBarEmpty(data, index)) return '?'

      const value = this.rowValues[index]
      if (isGroup(data)) {
        const { meanValue, nullCount } = value as GroupValue
        if (nullCount) return `${meanValue} +${nullCount}?`
        return `${meanValue}`
      }
      return `${value}`
    },
    barColor(data: DataIndexCollapsed): string {
      if (isGroup(data)) {
        if (data.isColorized) return data.color
        return ''
      }
      return this.rowColors[data]
    },
    widthForIndex(value: number): number {
      if (value >= this.maximumValue) return this.width
      return (value * this.width) / this.maximumValue
    },
    valueAtDataIndex(dataIndex: number): MetadataQuantitative {
      return this.metadata[dataIndex][this.field] as MetadataQuantitative
    },
    svg() {
      return d3.select(`#${this.name}`)
    },
    draw() {
      if (!this.hasAllData) return

      this.svg()
        .selectAll('foreignObject')
        .data<DataIndexCollapsed>(this.sortedDataIndicesCollapsed, valueKey)
        .join(
          (enter) =>
            enter
              .append('foreignObject')
              .attr('x', 0)
              .attr('y', (data, index) => index * CELL_SIZE)
              .attr('width', this.width)
              .attr('height', CELL_SIZE)
              .append('xhtml:div')
              .attr('class', (data, index) =>
                this.barText(data, index) === '?' ? 'unknown' : ''
              )
              .style('background-color', (data, index) =>
                this.isBarEmpty(data, index) ? '' : this.barColor(data)
              )
              .style('color', (data, index) =>
                this.isBarEmpty(data, index) ? this.barColor(data) : ''
              )
              .style(
                'min-width',
                (data, index) => this.barWidth(data, index) + 'px'
              )
              .text((data, index) => this.barText(data, index)),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('y', (data, index) => index * CELL_SIZE),

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
    this.draw()
  },
  watch: {
    hasAllData() {
      this.draw()
    },
    sortedDataIndicesCollapsed() {
      this.draw()
    },
    metadata() {
      this.draw()
    },
    selectedDataIndices() {
      this.draw()
    },
    hoverRowIndex() {
      this.draw()
    },
  },
}
</script>

<template>
  <svg
    :id="name"
    :width="width"
    :height="height"
    class="metadata-quantitative"
  ></svg>
</template>

<style lang="scss">
.metadata-quantitative {
  flex: 0 0 auto;

  foreignObject {
    user-select: none;
    cursor: crosshair;

    div {
      pointer-events: none;

      background: darkgrey;
      position: absolute;

      display: inline-block;
      color: white;
      font-size: 9px;
      line-height: 9px;
      white-space: nowrap;
      text-overflow: ellipsis;

      padding: 0 2px;
      border-radius: 2px;
      text-align: right;

      &.unknown {
        background: transparent;
        color: darkgrey;
        padding: 0;
      }
    }

    &[data-selected='true'] div {
      font-weight: 500;

      &:not(.unknown) {
        background-color: #333;
      }

      &.unknown {
        color: #333;
      }
    }

    &[data-hovered='true'] div {
      &:not(.unknown) {
        background-color: #1890ff;
      }

      &.unknown {
        color: #1890ff;
      }
    }
  }
}
</style>
