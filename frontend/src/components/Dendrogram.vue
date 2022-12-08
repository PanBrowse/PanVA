<script lang="ts">
import * as d3 from 'd3'
// import { containsAll } from '@/helpers/contains'
import { mapState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/config'
import type { Dendro } from '@/types'
import type { HierarchyNode, HierarchyPointLink, HierarchyPointNode } from 'd3'
import { containsAll } from '@/helpers/contains'

export default {
  data() {
    return {
      width: 200,
      circleRadius: 3.5,
    }
  },
  computed: {
    ...mapState(useDataStore, [
      'coreSNP',
      'dendroCustom',
      'dendroDefault',
      'selectedIds',
      'transitionTime',
      'sequenceCount',
    ]),
    hasAllData(): boolean {
      return this.dendroDefault !== null
    },
    dendroData(): Dendro | null {
      return this.dendroDefault
    },
    hierarchy(): HierarchyNode<Dendro> {
      if (!this.dendroData) {
        throw Error('Dendrogram.root called with missing dendroDefault.')
      }
      const h = d3.hierarchy<Dendro>(this.dendroData)
      console.log(h)
      return h
    },
    depths(): number[] {
      return this.hierarchy.leaves().map((e) => e.depth)
    },
    minDepth(): number {
      return d3.min(this.depths) || 1
    },
    maxDepth(): number {
      return d3.max(this.depths) || 1
    },
    height(): number {
      return this.sequenceCount * CELL_SIZE
    },
    links(): HierarchyPointLink<Dendro>[] {
      const cluster = d3
        .cluster<Dendro>()
        .size([this.height, this.width - 2 * this.circleRadius])
        // .separation((a, b) => a.parent === b.parent ? 1 : 1)
        .separation(() => 1)

      return cluster(this.hierarchy).links()
    },
    descendants(): HierarchyPointNode<Dendro>[] {
      return this.hierarchy.descendants() as HierarchyPointNode<Dendro>[]
    },
  },
  methods: {
    svg() {
      return d3.select('#dendrogram')
    },
    linkPath(d: HierarchyPointLink<Dendro>): string {
      return `M${d.source.y},${d.source.x}V${d.target.x}H${d.target.y}`
    },
    drawDendro() {
      if (!this.hasAllData) return

      console.time('Dendrogram#drawDendro')

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
            update.call((update) =>
              update
                .transition()
                .duration(this.transitionTime)
                .attr('d', (d) => this.linkPath(d))
                .attr('stroke', 'rgba(192, 192, 192, 0.5)')
            ),
          (exit) =>
            exit.call((exit) =>
              exit
                .transition()
                .duration(this.transitionTime)
                .attr('stroke', 'rgba(192, 192, 192, 0)')
                .remove()
            )
        )

      this.svg()
        .selectAll('circle')
        .data(this.descendants)
        .join(
          (enter) =>
            enter
              .append('circle')
              .attr('name', (d) => d.data.name)
              .attr('cx', (d) => this.circleRadius + d.y)
              .attr('cy', (d) => d.x)
              .attr('r', this.circleRadius)
              .attr('stroke', ({ data }) => {
                const ids = data.name.split('-')
                if (containsAll(this.selectedIds, ids)) {
                  return '#ff6251'
                }
                return 'rgba(192, 192, 192, 0.5)'
              })
              .attr('fill', function (d) {
                if (d.height === 0 || d.depth === 0) {
                  return 'none'
                }
                return 'rgba(192, 192, 192, 0.5)'
              }),
          (update) =>
            update
              .attr('name', function (d) {
                return d.data.name
              })
              .attr('stroke', ({ data }) => {
                const ids = data.name.split('-')
                if (containsAll(this.selectedIds, ids)) {
                  return '#ff6251'
                }
                return 'rgba(192, 192, 192, 0.5)'
              })
              .call((update) =>
                update
                  .transition()
                  .duration(this.transitionTime)
                  .attr('cx', (d) => this.circleRadius + d.y)
                  .attr('cy', (d) => d.x)
                  .attr('fill', (d) => {
                    if (d.height === 0 || d.depth === 0) {
                      return 'none'
                    }
                    return 'rgba(192, 192, 192, 0.5)'
                  })
              ),
          (exit) => exit.remove()
        )

      console.timeEnd('Dendrogram#drawDendro')
    },
  },
  mounted() {
    this.drawDendro()
  },
  watch: {
    hasAllData() {
      this.drawDendro()
    },
    dendroData() {
      this.drawDendro()
    },
  },
}
</script>

<template>
  <svg id="dendrogram" :width="width" :height="height"></svg>
</template>

<style lang="scss">
#dendrogram circle:hover {
  stroke: #1890ff;
  stroke-width: 1px;
}
</style>
