<script lang="ts">
import * as d3 from 'd3'
import { mapState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/config'
import type { Position } from '@/types'
import { zipEqual } from '@/helpers/zipEqual'

type Link = [Position, Position]

export default {
  data() {
    return {
      width: 120,
    }
  },
  computed: {
    ...mapState(useDataStore, [
      'mrnaIds',
      'mrnaIdsSorted',
      'sequenceCount',
      'transitionTime',
    ]),
    hasAllData(): boolean {
      return this.mrnaIds.length !== 0
    },
    height(): number {
      return this.sequenceCount * CELL_SIZE
    },
    links(): Link[] {
      const yOffset = 0.5 * CELL_SIZE

      const fromPositions = this.mrnaIds.map<Position>((mRNA_id, index) => ({
        x: 0,
        y: index * CELL_SIZE + yOffset,
      }))

      const toPositions = this.mrnaIds.map<Position>((mrnaId) => ({
        x: this.width,
        y: this.mrnaIdsSorted.indexOf(mrnaId) * CELL_SIZE + yOffset,
      }))

      return zipEqual(fromPositions, toPositions)
    },
  },
  methods: {
    svg() {
      return d3.select('#bipartite')
    },
    linkPath([source, target]: Link): string {
      return (
        d3.linkHorizontal()({
          source: [source.x, source.y],
          target: [target.x, target.y],
        }) || ''
      )
    },
    drawBipartite() {
      if (!this.hasAllData) return

      console.time('Bipartite#drawBipartite')

      this.svg()
        .selectAll('path')
        .data(this.links)
        .join(
          (enter) =>
            enter
              .append('path')
              .attr('fill', 'none')
              .attr('stroke', 'rgba(192, 192, 192, 0.5)')
              .attr('d', (d) => this.linkPath(d)),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('d', (d) => this.linkPath(d))
              .attr('stroke', 'rgba(192, 192, 192, 0.5)'),
          (exit) =>
            exit
              .transition()
              .duration(this.transitionTime)
              .attr('stroke', 'rgba(192, 192, 192, 0)')
              .remove()
        )

      console.timeEnd('Bipartite#drawBipartite')
    },
  },
  mounted() {
    this.drawBipartite()
  },
  watch: {
    hasAllData() {
      this.drawBipartite()
    },
    links() {
      this.drawBipartite()
    },
  },
}
</script>

<template>
  <svg id="bipartite" :width="width" :height="height"></svg>
</template>

<style lang="scss">
#bipartite {
  flex: 0 0 auto;
}
</style>
