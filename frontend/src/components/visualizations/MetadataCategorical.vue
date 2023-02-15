<script lang="ts">
import * as d3 from 'd3'
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/constants'
import type { DataIndexCollapsed, MetadataCategorical } from '@/types'
import { valueKey } from '@/helpers/valueKey'
import { isGroup } from '@/helpers/isGroup'
import { eventIndex } from '@/helpers/eventIndex'
import { uniq } from 'lodash'
import { useTooltipStore } from '@/stores/tooltip'
import { groupName } from '@/helpers/groupName'
import { mapCountBy } from '@/helpers/mapCountBy'
import colors from '@/assets/colors.module.scss'

type GroupCounts = Map<MetadataCategorical, number>

type GroupAggregates = Record<
  number,
  {
    // Counts per value in this position.
    counts: GroupCounts
    // Unique values within the group in this position.
    values: MetadataCategorical[]
  }
>

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
      'selectedDataIndicesSet',
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
    name(): string {
      return `metadata-${this.id}-${this.field}`
    },
    rowValues(): (MetadataCategorical | null)[] {
      // Value `null` is used to indicate multiple values.
      return this.sortedDataIndicesCollapsed.map((data) => {
        if (isGroup(data)) {
          const { values } = this.groupAggregates[data.id]
          if (values.length === 1) {
            return values[0]
          }
          return null
        }
        return this.valueAtDataIndex(data)
      })
    },
    valueIndexLookup() {
      const map = new Map()
      let lastIndex = 0
      this.metadata.forEach(({ [this.field]: value }) => {
        if (!map.has(value)) {
          map.set(value, ++lastIndex)
        }
      })

      return map
    },
    hoverValueIndex() {
      if (this.hoverRowIndex === null) return
      const value = this.rowValues[this.hoverRowIndex]
      if (value === null) return
      return this.valueIndexLookup.get(value)
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
    colors() {
      return colors
    },
  },
  methods: {
    ...mapActions(useTooltipStore, ['showTooltip', 'hideTooltip']),
    ...mapActions(useDataStore, ['dragStart', 'dragEnd', 'dragUpdate']),
    valueAtDataIndex(dataIndex: number): MetadataCategorical {
      return this.metadata[dataIndex][this.field] as MetadataCategorical
    },
    svg() {
      return d3.select(`#${this.name}`)
    },
    textY(index: number) {
      return (index + 1) * CELL_SIZE - 2
    },
    draw() {
      if (!this.hasAllData) return

      this.svg()
        .selectAll('text')
        .data<DataIndexCollapsed>(this.sortedDataIndicesCollapsed, valueKey)
        .join(
          (enter) =>
            enter
              .append('text')
              .attr('x', 3)
              .attr('y', (data, index) => this.textY(index)),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('y', (data, index) => this.textY(index)),

          (exit) => exit.remove()
        )
        .text((data, index) => {
          const value = this.rowValues[index]
          if (value === null) return 'multiple'
          return value
        })
        .style('fill', (data) => {
          if (isGroup(data)) {
            if (data.isColorized) return data.color
            return ''
          }
          return this.rowColors[data]
        })
        .attr('data-index', (data, index) => index)
        .attr('data-value-index', (data, index) => {
          const value = this.rowValues[index]
          if (value === null) return ''
          return this.valueIndexLookup.get(value)
        })
        .attr('data-selected', (data) => {
          if (isGroup(data)) return false
          return this.selectedDataIndicesSet.has(data)
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
              key: this.name,
              element: event.target,
              generateContent: () => {
                const { counts } = this.groupAggregates[data.id]

                return {
                  title: groupName(data),
                  template: `
                      <ADescriptions size="small" layout="horizontal" :column="1" bordered>
                        <ADescriptionsItem :label="value" v-for="[value, count] in counts">
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
    selectedDataIndicesSet() {
      this.draw()
    },
  },
}
</script>

<template>
  <svg :id="name" :width="width" :height="height" class="metadata-categorical">
    <component is="style" type="text/css">
      <!-- prettier-ignore -->
      <template v-if="hoverRowIndex !== null">
        #{{ name }} text[data-value-index="{{ hoverValueIndex }}"]:not([data-selected="true"]) {
          fill: {{ colors.similar }};
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

.metadata-categorical {
  flex: 0 0 auto;

  text {
    fill: $gray-7;
    font-size: 9px;
    cursor: crosshair;

    &[data-selected='true'] {
      fill: $selection;
    }
  }
}
</style>
