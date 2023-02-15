<script lang="ts">
import * as d3 from 'd3'
import { mapState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/constants'
import { isGroup } from '@/helpers/isGroup'
import { flatten } from 'lodash'
import type { TreeNode, TreeOption } from '@/types'
import { leafNodes } from '@/helpers/tree'

import colors from '@/assets/colors.module.scss'

type Link = {
  treeIndex: number
  rowIndex: number
  color?: string
}

export default {
  data() {
    return {
      width: 120,
    }
  },
  computed: {
    ...mapState(useDataStore, [
      'coreSNP',
      'dendroCustom',
      'dendroDefault',
      'genomeNrs',
      'hoverRowIndex',
      'mrnaIds',
      'rowColors',
      'sortedDataIndicesCollapsed',
      'transitionTime',
      'tree',
    ]),
    hasAllData(): boolean {
      return (
        this.treeData !== null && this.sortedDataIndicesCollapsed.length !== 0
      )
    },
    height(): number {
      if (this.treeData === null) return 0
      return leafNodes(this.treeData).length * CELL_SIZE
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
    leafNodes(): string[] {
      if (this.treeData === null) {
        throw Error('Bipartite.leafNodes called with missing treeData.')
      }
      return leafNodes(this.treeData)
    },
    leafNodesLookup(): Record<string, number> {
      return Object.fromEntries(
        this.leafNodes.map((leafNode, index) => [leafNode, index])
      )
    },
    links(): Link[] {
      return flatten(
        this.sortedDataIndicesCollapsed.map((data, index) => {
          if (isGroup(data)) {
            return data.dataIndices.map((dataIndex) => ({
              treeIndex: this.getTreeIndex(dataIndex),
              rowIndex: index,
              color: data.isColorized ? data.color : undefined,
            }))
          } else {
            return {
              treeIndex: this.getTreeIndex(data),
              rowIndex: index,
              color: this.rowColors[data],
            }
          }
        })
      )
    },
    colors() {
      return colors
    },
  },
  methods: {
    svg() {
      return d3.select('#bipartite')
    },
    getTreeIndex(dataIndex: number): number {
      let leafNodeValue = this.mrnaIds[dataIndex]

      if (this.treeSource === 'coreSNP') {
        leafNodeValue = `${this.genomeNrs[dataIndex]}`
      }

      return this.leafNodesLookup[leafNodeValue]
    },
    linkPath({ treeIndex, rowIndex }: Link): string {
      const yOffset = 0.5 * CELL_SIZE
      return (
        d3.linkHorizontal()({
          source: [0, treeIndex * CELL_SIZE + yOffset],
          target: [this.width, rowIndex * CELL_SIZE + yOffset],
        }) || ''
      )
    },
    draw() {
      if (!this.hasAllData) return

      this.svg()
        .selectAll('path')
        .data(this.links, (d: any) => d.treeIndex)
        .join(
          (enter) => enter.append('path').attr('d', (d) => this.linkPath(d)),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('d', (d) => this.linkPath(d)),
          (exit) => exit.remove()
        )
        .style('stroke', ({ color }) => {
          return color || ''
        })
        .attr('data-index', ({ rowIndex }) => rowIndex)
    },
  },
  mounted() {
    this.draw()
  },
  watch: {
    hasAllData() {
      this.draw()
    },
    sortedDataIndicesCollapsed() {
      this.draw()
    },
    treeData() {
      this.draw()
    },
  },
}
</script>

<template>
  <svg id="bipartite" :width="width" :height="height">
    <component is="style" type="text/css">
      <!-- prettier-ignore -->
      <template v-if="hoverRowIndex !== null">
        path[data-index="{{ hoverRowIndex }}"] {
          stroke: {{ colors.hover }} !important;
        }
      </template>
    </component>
  </svg>
</template>

<style lang="scss">
@import '@/assets/colors.module.scss';

#bipartite {
  flex: 0 0 auto;

  path {
    fill: none;

    /* Looks like gray-5 on white, but darkens when overlapping with other lines. */
    stroke: rgba(0, 0, 0, 0.15);
  }
}
</style>
