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
      'phenos',
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
    drawBipartite() {
      if (!this.hasAllData) return

      this.svg()
        .selectAll('path')
        .data(this.links, (d: any) => d.sourceIndex)
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
              .attr('d', (d) => this.linkPath(d)),
          (exit) =>
            exit
              .transition()
              .duration(this.transitionTime)
              .attr('stroke', 'rgba(192, 192, 192, 0)')
              .remove()
        )
        .attr('stroke', ({ targetIndex, color }) => {
          if (this.hoverRowIndex === targetIndex) return '#1890ff'
          if (color) return color
          return 'rgba(192, 192, 192, 0.5)'
        })
    },
  },
  mounted() {
    this.drawBipartite()
  },
  watch: {
    hasAllData() {
      this.drawBipartite()
    },
    hoverRowIndex() {
      this.drawBipartite()
    },
    sortedDataIndicesCollapsed() {
      this.drawBipartite()
    },
    treeData() {
      this.drawBipartite()
    },
  },
}
</script>

<template>
  <svg id="bipartite" :width="width" :height="height" v-if="hasAllData"></svg>
</template>

<style lang="scss">
#bipartite {
  flex: 0 0 auto;
}
</style>
