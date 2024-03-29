<script lang="ts">
import * as d3 from 'd3'
import { max } from 'lodash'
import { mapActions, mapState, mapWritableState } from 'pinia'

import colors from '@/assets/colors.module.scss'
import { CELL_SIZE } from '@/constants'
import { eventIndex } from '@/helpers/eventIndex'
import { groupName } from '@/helpers/groupName'
import { isGroup } from '@/helpers/isGroup'
import { naturalSort } from '@/helpers/sorting'
import { valueKey } from '@/helpers/valueKey'
import { useHomologyStore } from '@/stores/homology'
import { useTooltipStore } from '@/stores/tooltip'
import type { DataIndexCollapsed, Group } from '@/types'

export default {
  data() {
    return {
      width: 180,
    }
  },
  computed: {
    ...mapState(useHomologyStore, [
      'groupsFiltered',
      'mrnaIds',
      'rowColors',
      'sequenceCount',
      'selectedDataIndicesSet',
      'sortedDataIndicesCollapsed',
      'transitionTime',
    ]),
    ...mapWritableState(useHomologyStore, ['hoverRowIndex']),
    height(): number {
      return this.sequenceCount * CELL_SIZE
    },
    maximumGroupSize(): number {
      const maximum = max(
        this.groupsFiltered.map(({ dataIndices }) => dataIndices.length)
      )
      return maximum || 0
    },
    indexedGroups(): [Group, number][] {
      return this.sortedDataIndicesCollapsed
        .map<[DataIndexCollapsed, number]>((dataIndex, index) => [
          dataIndex,
          index,
        ])
        .filter(([dataIndex]) => isGroup(dataIndex)) as [Group, number][]
    },
    colors() {
      return colors
    },
  },
  methods: {
    ...mapActions(useHomologyStore, ['dragStart', 'dragEnd', 'dragUpdate']),
    ...mapActions(useTooltipStore, ['showTooltip', 'hideTooltip']),
    svg() {
      return d3.select('#names')
    },
    barWidth(data: DataIndexCollapsed): number {
      if (isGroup(data)) {
        return (
          (data.dataIndices.length / this.maximumGroupSize) * (this.width - 8)
        )
      }
      return 0
    },
    fillColor(data: DataIndexCollapsed) {
      if (isGroup(data)) {
        if (data.isColorized) return data.color
        return ''
      }
      return this.rowColors[data]
    },
    textY(index: number) {
      return (index + 1) * CELL_SIZE - 2
    },
    draw() {
      // Only draw rects for groups.
      this.svg()
        .selectAll('rect')
        .data<[Group, number]>(this.indexedGroups, valueKey)
        .join(
          (enter) =>
            enter
              .append('rect')
              .attr('x', 0)
              .attr('rx', 2)
              .attr('ry', 2)
              .attr('y', ([, index]) => index * CELL_SIZE)
              .attr('width', ([data]) => this.barWidth(data))
              .attr('height', CELL_SIZE - 1),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('width', ([data]) => this.barWidth(data))
              .attr('y', ([, index]) => index * CELL_SIZE),

          (exit) => exit.remove()
        )
        .style('fill', ([data]) => this.fillColor(data))
        .attr('data-index', ([, index]) => index)
        .attr('data-selected', ([data]) => {
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
              .attr('x', 3)
              .attr('y', (data, index) => this.textY(index)),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('y', (data, index) => this.textY(index)),

          (exit) => exit.remove()
        )
        .text((data) => {
          if (isGroup(data)) {
            // Sequences are filtered, we show the original group size as well.
            if (data.size > data.dataIndices.length) {
              return `${groupName(data)} (${data.dataIndices.length}/${
                data.size
              })`
            }
            return `${groupName(data)} (${data.dataIndices.length})`
          }
          return this.mrnaIds[data]
        })
        .style('fill', (data) => this.fillColor(data))
        .attr('data-index', (data, index) => index)
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
              key: `names-${index}`,
              element: event.target,
              generateContent: () => {
                const names = naturalSort(
                  data.dataIndices.map((index) => this.mrnaIds[index])
                )

                return {
                  title: groupName(data),
                  template: `
                    <AList size="small" bordered :dataSource="names">
                      <template #renderItem="{ item }">
                        <AListItem>{{ item }}</AListItem>
                      </template>
                    </AList>
                  `,
                  data: {
                    names,
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
    selectedDataIndicesSet() {
      this.draw()
    },
    sortedDataIndicesCollapsed() {
      this.draw()
    },
    rowColors() {
      this.draw()
    },
    maximumGroupSize() {
      this.draw()
    },
  },
}
</script>

<template>
  <svg id="names" :width="width" :height="height">
    <component is="style" type="text/css">
      <!-- prettier-ignore -->
      <template v-if="hoverRowIndex !== null">
        #names rect[data-index="{{ hoverRowIndex }}"] {
          fill: {{ colors.hover }} !important;
        }
        
        #names text[data-index="{{ hoverRowIndex }}"] {
          fill: {{ colors.hover }} !important;
        }
      </template>
    </component>
  </svg>
</template>

<style lang="scss">
@import '@/assets/colors.module.scss';

#names {
  rect {
    pointer-events: none;
    fill: $gray-7;
    fill-opacity: 0.2;

    &[data-selected='true'] {
      fill: $selection;
    }
  }

  text {
    fill: $gray-7;
    font-size: 9px;
    cursor: crosshair;

    &[data-selected='true'] {
      fill: $selection;
    }
  }

  flex: 0 0 auto;
}
</style>
