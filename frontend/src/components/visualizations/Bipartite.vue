<script lang="ts">
import * as d3 from 'd3'
import { mapState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/constants'
import { isGroup } from '@/helpers/isGroup'
import { flatten } from 'lodash'
import type { TreeNode, TreeOption } from '@/types'
import { leafNodes } from '@/helpers/tree'

type Link = {
  sourceIndex: number
  targetIndex: number
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
              sourceIndex: this.getSourceIndex(dataIndex),
              targetIndex: index,
              color: data.isColorized ? data.color : undefined,
            }))
          } else {
            return {
              sourceIndex: this.getSourceIndex(data),
              targetIndex: index,
              color: this.rowColors[data],
            }
          }
        })
      )
    },
    hoverLinks(): Link[] {
      if (this.hoverRowIndex === null) return []
      return this.links.filter(
        ({ targetIndex }) => targetIndex === this.hoverRowIndex
      )
    },
  },
  methods: {
    svg() {
      return d3.select('#bipartite')
    },
    getSourceIndex(dataIndex: number): number {
      let leafNodeValue = this.mrnaIds[dataIndex]

      if (this.treeSource === 'coreSNP') {
        leafNodeValue = `${this.genomeNrs[dataIndex]}`
      }

      return this.leafNodesLookup[leafNodeValue]
    },
    linkPath({ sourceIndex, targetIndex }: Link): string {
      const yOffset = 0.5 * CELL_SIZE
      return (
        d3.linkHorizontal()({
          source: [0, sourceIndex * CELL_SIZE + yOffset],
          target: [this.width, targetIndex * CELL_SIZE + yOffset],
        }) || ''
      )
    },
    drawLines() {
      if (!this.hasAllData) return

      this.svg()
        .selectAll('path.line')
        .data(this.links, (d: any) => d.sourceIndex)
        .join(
          (enter) =>
            enter
              .append('path')
              .attr('class', 'line')
              .attr('d', (d) => this.linkPath(d)),
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
    },
    drawHover() {
      if (!this.hasAllData) return

      this.svg()
        .selectAll('path.hover')
        .data(this.hoverLinks, (d: any) => d.sourceIndex)
        .join(
          (enter) =>
            enter
              .append('path')
              .attr('class', 'hover')
              .attr('d', (d) => this.linkPath(d)),
          (update) => update,
          (exit) => exit.remove()
        )
    },
    draw() {
      this.drawLines()
      this.drawHover()
    },
  },
  mounted() {
    this.draw()
  },
  watch: {
    hasAllData() {
      this.draw()
    },
    hoverLinks() {
      this.drawHover()
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
  <svg id="bipartite" :width="width" :height="height"></svg>
</template>

<style lang="scss">
#bipartite {
  flex: 0 0 auto;

  path {
    fill: none;
    stroke: lightgrey;
  }

  path.hover {
    fill: none;
    stroke: #1890ff;
  }
}
</style>
