<script lang="ts">
import * as d3 from 'd3'
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/config'
import type { DataIndexCollapsed, PhenoColumnCategoricalData } from '@/types'
import { valueKey } from '@/helpers/valueKey'
import { isGroup } from '@/helpers/isGroup'
import { eventIndex } from '@/helpers/eventIndex'

export default {
  props: {
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
      return `pheno-${this.field}`
    },
  },
  methods: {
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
        .text((data) => {
          if (isGroup(data)) {
            // TODO: Count unique values
            return 'multiple'
          }
          return this.phenos[data][this.field] as PhenoColumnCategoricalData
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
  }
}
</style>
