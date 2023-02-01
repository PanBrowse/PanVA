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

export default {
  data() {
    return {
      width: 180,
    }
  },
  computed: {
    ...mapState(useDataStore, [
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
  },
  methods: {
    ...mapActions(useDataStore, ['dragStart', 'dragEnd', 'dragUpdate']),
    svg() {
      return d3.select('#names')
    },
    drawNames() {
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
              .attr('width', this.width - 3)
              .attr('height', CELL_SIZE)
              .text((data) => {
                if (isGroup(data)) {
                  return `${groupName(data)} (${data.dataIndices.length})`
                }
                return this.mrnaIds[data]
              }),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('y', (data, index) => index * CELL_SIZE),

          (exit) => exit.remove()
        )
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
    this.drawNames()
  },
  watch: {
    hasAllData() {
      this.drawNames()
    },
    hoverRowIndex() {
      this.drawNames()
    },
    selectedDataIndices() {
      this.drawNames()
    },
    sortedDataIndicesCollapsed() {
      this.drawNames()
    },
    rowColors() {
      this.drawNames()
    },
  },
}
</script>

<template>
  <svg id="names" :width="width" :height="height"></svg>
</template>

<style lang="scss">
#names {
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
      color: #1890ff !important;
    }
  }

  flex: 0 0 auto;
}
</style>
