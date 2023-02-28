<script lang="ts">
import * as d3 from 'd3'
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE, DEFAULT_METADATA_BOOLEAN_LABELS } from '@/constants'
import type {
  DataIndexCollapsed,
  ConfigMetadataBoolean,
  MetadataBoolean,
} from '@/types'
import { eventIndex } from '@/helpers/eventIndex'
import { valueKey } from '@/helpers/valueKey'
import { isGroup } from '@/helpers/isGroup'
import { mapCountBy } from '@/helpers/mapCountBy'
import { uniq } from 'lodash'
import { useTooltipStore } from '@/stores/tooltip'
import { groupName } from '@/helpers/groupName'
import type { PropType } from 'vue'
import colors from '@/assets/colors.module.scss'

type GroupCounts = Map<MetadataBoolean, number>

type GroupAggregates = Record<
  number,
  {
    // Counts per value in this position.
    counts: GroupCounts
    // Unique values within the group in this position.
    values: MetadataBoolean[]
  }
>

export default {
  props: {
    column: {
      type: Object as PropType<ConfigMetadataBoolean>,
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
      'groupsFiltered',
      'mrnaIds',
      'selectedDataIndicesSet',
      'sequences',
      'sequenceCount',
      'sortedDataIndicesCollapsed',
      'transitionTime',
    ]),
    ...mapWritableState(useDataStore, ['hoverRowIndex']),
    height(): number {
      return this.sequenceCount * CELL_SIZE
    },
    name(): string {
      return `metadata-${this.column.column}`
    },
    width(): number {
      return this.padding * 2 + CELL_SIZE
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
  },
  methods: {
    ...mapActions(useTooltipStore, ['showTooltip', 'hideTooltip']),
    ...mapActions(useDataStore, [
      'addSequenceFilter',
      'dragEnd',
      'dragStart',
      'dragUpdate',
    ]),
    valueAtDataIndex(dataIndex: number): MetadataBoolean {
      return this.sequences[dataIndex].metadata[
        this.column.column
      ] as MetadataBoolean
    },
    svg() {
      return d3.select(`#${this.name}`)
    },
    labelForValue(value: MetadataBoolean) {
      const labels = this.column.labels || DEFAULT_METADATA_BOOLEAN_LABELS
      return labels[`${value}`]
    },
    circleRadius(values: MetadataBoolean[]) {
      if (values.length === 1) {
        if (values[0] === true) return 4
        if (values[0] === false) return 4
        return 1
      }
      // Diagonal hatch.
      return 4
    },
    circleStroke(values: MetadataBoolean[]) {
      if (values.length === 1) {
        if (values[0] === true) return 'transparent'
        if (values[0] === false) return colors['gray-6']
        return colors['gray-6']
      }
      // Diagonal hatch.
      return colors['gray-6']
    },
    circleFill(values: MetadataBoolean[]) {
      if (values.length === 1) {
        if (values[0] === true) return colors['gray-8']
        if (values[0] === false) return colors['gray-1']
        return colors['gray-6']
      }
      // Diagonal hatch.
      return 'url(#diagonalHatch)'
    },
    draw() {
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
        .attr('data-index', (data, index) => index)
        .attr('data-selected', (data) => {
          if (isGroup(data)) return false
          return this.selectedDataIndicesSet.has(data)
        })
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

          // Shift key is pressed, consider this to be a sequence filter.
          if (event.shiftKey) {
            const data = this.sortedDataIndicesCollapsed[index]

            // Can't filter on groups.
            if (isGroup(data)) return

            const value = this.valueAtDataIndex(data)

            this.addSequenceFilter({
              column: this.column.column,
              type: 'boolean',
              values: [`${value}`],
              operator: 'in',
            })
            return
          }

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
            key: this.name,
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
                    <ADescriptions size="small" layout="horizontal" :column="1" bordered>
                      <ADescriptionsItem v-for="(count, label) in labeledCounts" :label="label">
                        {{ count }}
                      </ADescriptionsItem>
                    </ADescriptions>
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
    this.draw()
  },
  watch: {
    sortedDataIndicesCollapsed() {
      this.draw()
    },
    metadata() {
      this.draw()
    },
    selectedDataIndicesSet() {
      this.draw()
    },
  },
}
</script>

<template>
  <svg :id="name" :width="width" :height="height" class="metadata-boolean">
    <component is="style" type="text/css">
      <!-- prettier-ignore -->
      <template v-if="hoverRowIndex !== null">
        #{{ name }} circle[data-index="{{ hoverRowIndex }}"] {
          stroke: {{ colors.hover }} !important;
        }
      </template>
    </component>

    <defs>
      <pattern
        id="diagonalHatch"
        patternUnits="userSpaceOnUse"
        width="4"
        height="4"
      >
        <path
          d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2"
          :stroke="colors['gray-13']"
          stroke-width="1"
        ></path>
      </pattern>
    </defs>
  </svg>
</template>

<style lang="scss">
@import '@/assets/colors.module.scss';

.metadata-boolean {
  margin-left: 4px;

  flex: 0 0 auto;

  rect {
    cursor: crosshair;
  }

  circle {
    &[data-selected='true'] {
      stroke: $selection;
    }
  }
}
</style>
