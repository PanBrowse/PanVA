<script lang="ts">
import * as d3 from 'd3'
import { mapState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/constants'
import type { TreeNode } from '@/types'
import type { HierarchyNode, HierarchyPointLink, HierarchyPointNode } from 'd3'

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
      'mrnaIdsLookup',
      'rowColors',
      'sequenceCount',
      'transitionTime',
      'tree',
    ]),
    hasAllData(): boolean {
      return this.treeData !== null && this.sequenceCount !== 0
    },
    treeData(): TreeNode | null {
      if (this.tree === 'dendroCustom' && this.dendroCustom) {
        return this.dendroCustom
      }
      return this.dendroDefault
    },
    hierarchy(): HierarchyNode<TreeNode> {
      if (this.treeData === null) {
        throw Error('Tree.root called with missing treeData.')
      }
      return d3.hierarchy<TreeNode>(this.treeData)
    },
    height(): number {
      return this.sequenceCount * CELL_SIZE
    },
    links(): HierarchyPointLink<TreeNode>[] {
      const cluster = d3
        .cluster<TreeNode>()
        .size([this.height, this.width - 2 * this.circleRadius])
        .separation(() => 1)

      return cluster(this.hierarchy).links()
    },
    descendants(): HierarchyPointNode<TreeNode>[] {
      return this.hierarchy.descendants() as HierarchyPointNode<TreeNode>[]
    },
  },
  methods: {
    svg() {
      return d3.select('#tree')
    },
    linkPath(d: HierarchyPointLink<TreeNode>): string {
      const sx = this.circleRadius + d.source.y
      const sy = d.source.x
      const tx = this.circleRadius + d.target.y
      const ty = d.target.x
      return `M${sx},${sy}V${ty}H${tx}`
    },
    drawTree() {
      if (!this.hasAllData) return

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

      this.svg()
        .selectAll('circle')
        .data(this.descendants)
        .join(
          (enter) =>
            enter
              .append('circle')
              .attr('cx', (d) => this.circleRadius + d.y)
              .attr('cy', (d) => d.x)
              .attr('r', this.circleRadius),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('cx', (d) => this.circleRadius + d.y)
              .attr('cy', (d) => d.x),
          (exit) => exit.remove()
        )
        .attr('stroke', (d) => {
          // Leaf nodes.
          if (d.height === 0) {
            const dataIndex = this.mrnaIdsLookup[d.data.name]
            const color = this.rowColors[dataIndex]
            if (color) return color
          }

          return 'rgba(192, 192, 192, 0.5)'
        })
        .attr('fill', function (d) {
          if (d.height === 0 || d.depth === 0) {
            return '#ffffff'
          }
          return 'rgba(192, 192, 192, 0.5)'
        })
    },
  },
  mounted() {
    this.drawTree()
  },
  watch: {
    hasAllData() {
      this.drawTree()
    },
    rowColors() {
      this.drawTree()
    },
    treeData() {
      this.drawTree()
    },
  },
}
</script>

<template>
  <svg id="tree" :width="width" :height="height"></svg>
</template>

<style lang="scss">
#tree {
  flex: 0 0 auto;

  path {
    pointer-events: none;
  }

  circle {
    cursor: pointer;

    &:hover {
      stroke: #1890ff;
    }
  }
}
</style>
