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
      'tree',
    ]),
    ...mapWritableState(useDataStore, ['selectedDataIndices']),
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
    this.draw()
  },
  watch: {
    rowColors() {
      this.draw()
    },
    treeData() {
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
