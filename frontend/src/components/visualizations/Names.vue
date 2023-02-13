<script lang="ts">
import * as d3 from 'd3'
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/constants'
import { isGroup } from '@/helpers/isGroup'
import { eventIndex } from '@/helpers/eventIndex'
import { valueKey } from '@/helpers/valueKey'
import type { DataIndexCollapsed } from '@/types'
import { groupName } from '@/helpers/groupName'
import { max } from 'lodash'

export default {
  data() {
    return {
      width: 180,
    }
  },
  computed: {
    ...mapState(useDataStore, [
      'groups',
      'mrnaIds',
      'rowColors',
      'sequenceCount',
      'sortedDataIndicesCollapsed',
      'transitionTime',
    ]),
    ...mapWritableState(useDataStore, ['hoverRowIndex', 'selectedDataIndices']),
    hasAllData(): boolean {
      return this.sortedDataIndicesCollapsed.length !== 0
    },
    height(): number {
      return this.sequenceCount * CELL_SIZE
    },
    maximumGroupSize(): number {
      const maximum = max(
        this.groups.map(({ dataIndices }) => dataIndices.length)
      )
      return maximum || 0
    },
  },
  methods: {
    ...mapActions(useDataStore, ['dragStart', 'dragEnd', 'dragUpdate']),
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
      if (!this.hasAllData) return

      this.svg()
        .selectAll('rect')
        .data<DataIndexCollapsed>(this.sortedDataIndicesCollapsed, valueKey)
        .join(
          (enter) =>
            enter
              .append('rect')
              .attr('x', 0)
              .attr('rx', 2)
              .attr('ry', 2)
              .attr('y', (data, index) => index * CELL_SIZE)
              .attr('width', (data) => this.barWidth(data))
              .attr('height', CELL_SIZE - 1),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('width', (data) => this.barWidth(data))
              .attr('y', (data, index) => index * CELL_SIZE),

          (exit) => exit.remove()
        )
        .style('fill', (data) => this.fillColor(data))
        .attr('data-selected', (data) => {
          if (isGroup(data)) return false
          return this.selectedDataIndices.includes(data)
        })
        .attr('data-hovered', (data, index) => this.hoverRowIndex === index)

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
            return `${groupName(data)} (${data.dataIndices.length})`
          }
          return this.mrnaIds[data]
        })
        .style('fill', (data) => this.fillColor(data))
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
    this.draw()
  },
  watch: {
    hasAllData() {
      this.draw()
    },
    hoverRowIndex() {
      this.draw()
    },
    selectedDataIndices() {
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
  <svg id="names" :width="width" :height="height"></svg>
</template>

<style lang="scss">
#names {
  rect {
    fill: darkgrey;
    fill-opacity: 0.2;

    &[data-selected='true'] {
      fill: #333;
    }

    &[data-hovered='true'] {
      fill: #1890ff !important;
    }
  }

  text {
    fill: darkgrey;
    font-size: 9px;
    cursor: crosshair;

    &[data-selected='true'] {
      fill: #333;
    }

    &[data-hovered='true'] {
      fill: #1890ff !important;
    }
  }

  flex: 0 0 auto;
}
</style>
