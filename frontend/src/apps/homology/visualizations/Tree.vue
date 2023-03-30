<script lang="ts">
import type { HierarchyNode, HierarchyPointLink, HierarchyPointNode } from 'd3'
import * as d3 from 'd3'
import { flatten } from 'lodash'
import { mapState, mapWritableState } from 'pinia'

import { CELL_SIZE } from '@/constants'
import { leafNodes } from '@/helpers/tree'
import { useHomologyStore } from '@/stores/homology'
import type { TreeNode } from '@/types'

export default {
  data() {
    return {
      width: 200,
      circleRadius: 3.5,
    }
  },
  computed: {
    ...mapState(useHomologyStore, [
      'genomeMrnaIdsLookup',
      'groupLookup',
      'mrnaIdsLookup',
      'rowColors',
      'tree',
    ]),
    ...mapWritableState(useHomologyStore, ['selectedDataIndices']),
    hierarchy(): HierarchyNode<TreeNode> {
      if (this.tree.root === null) {
        throw Error('Tree.hierarchy called with missing treeData.')
      }
      return d3.hierarchy<TreeNode>(this.tree.root)
    },
    height(): number {
      if (this.tree.root === null) return 0
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
    draw() {
      this.svg()
        .selectAll('path')
        .data(this.links)
        .join(
          (enter) => enter.append('path').attr('d', (d) => this.linkPath(d)),
          (update) => update.attr('d', (d) => this.linkPath(d)),
          (exit) => exit.remove()
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
              .attr('cx', (d) => this.circleRadius + d.y)
              .attr('cy', (d) => d.x),
          (exit) => exit.remove()
        )
        .attr('data-leaf', (d) => d.height === 0 || d.depth === 0)
        .on('mousedown', (event, { data }) => {
          if (['dendroDefault', 'dendroCustom'].includes(this.tree.name)) {
            // The leaf nodes of dendrograms are mRNA ids.
            this.selectedDataIndices = leafNodes(data)
              .map((mrnaId) => this.mrnaIdsLookup[mrnaId])
              .filter((dataIndex) => !this.groupLookup[dataIndex])
          } else {
            this.selectedDataIndices = flatten(
              // The leaf nodes of custom trees are genome number strings.
              leafNodes(data).map((leaf) => {
                const genomeNr = Number(leaf)

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
          }
        })
    },
  },
  mounted() {
    this.draw()
  },
  watch: {
    rowColors() {
      this.draw()
    },
    tree() {
      this.draw()
    },
  },
}
</script>

<template>
  <svg id="tree" :width="width" :height="height"></svg>
</template>

<style lang="scss">
@import '@/assets/colors.module.scss';

#tree {
  flex: 0 0 auto;

  path {
    pointer-events: none;
    fill: none;
    stroke: $gray-5;
  }

  circle {
    cursor: pointer;
    fill: $gray-6;
    stroke: $gray-6;
    fill-opacity: 0.5;

    &[data-leaf='true'] {
      fill: $gray-1;
    }

    &:hover {
      stroke: $hover;
    }
  }
}
</style>
