<script lang="ts">
import * as d3 from 'd3'
import { mapState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/config'

export default {
  data() {
    return {
      width: 200,
    }
  },
  computed: {
    ...mapState(useDataStore, ['mrnaIdsSorted', 'transitionTime']),
    hasAllData(): boolean {
      return this.mrnaIdsSorted.length !== 0
    },
    height(): number {
      return this.mrnaIdsSorted.length * CELL_SIZE
    },
  },
  methods: {
    svg() {
      return d3.select('#names')
    },
    drawNames() {
      if (!this.hasAllData) return

      console.time('Names#drawNames')

      this.svg()
        .selectAll('foreignObject')
        .data(this.mrnaIdsSorted, (d) => d)
        .join(
          (enter) =>
            enter
              .append('foreignObject')
              .attr('x', 3)
              .attr('y', (d, index) => index * CELL_SIZE)
              .attr('width', 200)
              .attr('height', CELL_SIZE)
              .text((d) => d),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('y', (d, index) => index * CELL_SIZE)
              .text((d) => d),

          (exit) => exit.transition().duration(this.transitionTime).remove()
        )
      console.timeEnd('Names#drawNames')
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
  }

  flex: 0 0 auto;
}
</style>
