<script lang="ts">
import * as d3 from 'd3'
import { mapState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/config'
import { isGroup } from '@/helpers/isGroup'
import { flatten } from 'lodash'

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
      'hoverRowIndex',
      'rowColors',
      'sequenceCount',
      'sortedDataIndicesCollapsed',
      'transitionTime',
    ]),
    hasAllData(): boolean {
      return this.sortedDataIndicesCollapsed.length !== 0
    },
    height(): number {
      return this.sequenceCount * CELL_SIZE
    },
    links(): Link[] {
      return flatten(
        this.sortedDataIndicesCollapsed.map((data, index) => {
          if (isGroup(data)) {
            return data.dataIndices.map((dataIndex) => ({
              sourceIndex: dataIndex,
              targetIndex: index,
              color: data.isColorized ? data.color : undefined,
            }))
          } else {
            return {
              sourceIndex: data,
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
