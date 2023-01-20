<script lang="ts">
import * as d3 from 'd3'
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/config'

export default {
  data() {
    return {
      width: 180,
    }
  },
  computed: {
    ...mapState(useDataStore, [
      'mrnaIdsSorted',
      'selectedMrnaIds',
      'transitionTime',
    ]),
    ...mapWritableState(useDataStore, ['hoverRowIndex']),
    hasAllData(): boolean {
      return this.mrnaIdsSorted.length !== 0
    },
    height(): number {
      return this.mrnaIdsSorted.length * CELL_SIZE
    },
  },
  methods: {
    ...mapActions(useDataStore, ['toggleSelectedId']),
    svg() {
      return d3.select('#names')
    },
    drawNames() {
      if (!this.hasAllData) return

      this.svg()
        .selectAll('foreignObject')
        .data(this.mrnaIdsSorted.entries(), ([, mrnaId]: any) => mrnaId)
        .join(
          (enter) =>
            enter
              .append('foreignObject')
              .attr('x', 3)
              .attr('y', ([index]) => index * CELL_SIZE)
              .attr('width', this.width - 3)
              .attr('height', CELL_SIZE)
              .text(([, id]) => id),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('y', ([index]) => index * CELL_SIZE),

          (exit) => exit.remove()
        )
        .attr('data-selected', ([, id]) => this.selectedMrnaIds.includes(id))
        .attr('data-hovered', ([index]) => this.hoverRowIndex === index)
        .on('mouseover', (event, [index]) => {
          this.hoverRowIndex = index
        })
        .on('mouseout', () => {
          this.hoverRowIndex = null
        })
        .on('click', (event, [, id]) => {
          this.toggleSelectedId(id)
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
    mrnaIdsSorted() {
      this.drawNames()
    },
    selectedMrnaIds() {
      this.drawNames()
    },
    hoverRowIndex() {
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
      color: #1890ff;
    }
  }

  flex: 0 0 auto;
}
</style>
