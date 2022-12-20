<script lang="ts">
import * as d3 from 'd3'
import { CELL_SIZE } from '@/config'
import { phenoColumns } from '@dataset'
import { map, sum } from 'lodash'
import type { PhenoColumn } from '@/types'

export default {
  computed: {
    height() {
      return 60
    },
    width() {
      return sum(phenoColumns.map(this.columnWidth))
    },
    labels() {
      return map(phenoColumns, 'label')
    },
    xPositions() {
      const result: number[] = []
      let total = 0

      phenoColumns.forEach((column) => {
        const width = this.columnWidth(column)

        // We move over the boolean label slightly, to align with the circles.
        if (column.type === 'boolean') {
          result.push(total + 4)
        } else {
          result.push(total)
        }

        total += width
      })

      return result
    },
  },
  methods: {
    columnWidth(column: PhenoColumn): number {
      // See PhenoBoolean#width for details.
      if (column.type === 'boolean') return 18
      if (column.type === 'categorical') return column.width
      if (column.type === 'quantitative') return 80
      return 0
    },
    svg() {
      return d3.select('#pheno-labels')
    },
    drawLabels() {
      this.svg()
        .selectAll('foreignObject')
        .data(this.labels, (d) => d as string)
        .join((enter) =>
          enter
            .append('foreignObject')
            .attr('width', 200)
            .attr('height', CELL_SIZE)
            .attr('transform', (d, index) => {
              const x = this.xPositions[index]
              const y = this.height - 10
              return `translate(${x},${y}) rotate(-45)`
            })
            .text((d) => d)
        )
    },
  },
  mounted() {
    this.drawLabels()
  },
}
</script>

<template>
  <svg id="pheno-labels" :width="width" :height="height"></svg>
</template>

<style lang="scss">
#pheno-labels {
  foreignObject {
    user-select: none;
    color: #888;
    font-size: 10px;
    line-height: 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: 500;
    cursor: pointer;

    &:hover {
      color: #1890ff;
    }
  }

  flex: 0 0 auto;
}
</style>
