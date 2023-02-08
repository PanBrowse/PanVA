<script lang="ts">
import * as d3 from 'd3'
import { mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/constants'
import type { TreeNode, TreeOption } from '@/types'
import type { HierarchyNode, HierarchyPointLink, HierarchyPointNode } from 'd3'
import { leafNodes } from '@/helpers/tree'
import { flatten } from 'lodash'

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
      'genomeMrnaIdsLookup',
      'groupLookup',
      'mrnaIdsLookup',
      'rowColors',
      'sequenceCount',
      'transitionTime',
      'tree',
    ]),
    ...mapWritableState(useDataStore, ['selectedDataIndices']),
    hasAllData(): boolean {
      return this.treeData !== null && this.sequenceCount !== 0
    },
    treeSource(): TreeOption {
      if (this.tree === 'coreSNP' && this.coreSNP) {
        return 'coreSNP'
      }

      if (this.tree === 'dendroCustom' && this.dendroCustom) {
        return 'dendroCustom'
      }

      return 'dendroDefault'
    },
    treeData(): TreeNode | null {
      if (this.treeSource === 'coreSNP') return this.coreSNP
      if (this.treeSource === 'dendroCustom') return this.dendroCustom
      return this.dendroDefault
    },
    hierarchy(): HierarchyNode<TreeNode> {
      if (this.treeData === null) {
        throw Error('Tree.hierarchy called with missing treeData.')
      }
      return d3.hierarchy<TreeNode>(this.treeData)
    },
    height(): number {
      if (this.treeData === null) return 0
      return this.hierarchy.leaves().length * CELL_SIZE
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
        .attr('stroke', () => {
          return 'rgba(192, 192, 192, 0.5)'
        })
        .attr('fill', (d) => {
          if (d.height === 0 || d.depth === 0) {
            return '#ffffff'
          }
          return 'rgba(192, 192, 192, 0.5)'
        })
        .on('mousedown', (event, { data }) => {
          if (this.treeSource === 'coreSNP') {
            this.selectedDataIndices = flatten(
              // The leaf nodes of coreSNP are genome number strings.
              leafNodes(data).map((leaf) => {
                const genomeNr = parseInt(leaf)

                // Not all genome numbers occur in each homology
                // group, so lookup could result in undefined.
                if (genomeNr in this.genomeMrnaIdsLookup) {
                  return this.genomeMrnaIdsLookup[genomeNr]
                    .map((mrnaId) => this.mrnaIdsLookup[mrnaId])
                    .filter((dataIndex) => !this.groupLookup[dataIndex])
                }

                return []
              })
            )
          } else {
            this.selectedDataIndices = leafNodes(data)
              .map((mrnaId) => this.mrnaIdsLookup[mrnaId])
              .filter((dataIndex) => !this.groupLookup[dataIndex])
          }
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
