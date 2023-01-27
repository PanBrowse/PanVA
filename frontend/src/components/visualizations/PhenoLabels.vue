<script lang="ts">
import * as d3 from 'd3'
import { CELL_SIZE } from '@/config'
import { phenoColumns } from '@dataset'
import { mapState, mapActions } from 'pinia'
import { sum } from 'lodash'
import type { PhenoColumn } from '@/types'
import { useDataStore } from '@/stores/data'

export default {
  computed: {
    ...mapState(useDataStore, ['sorting']),
    height(): number {
      return 60
    },
    width(): number {
      return sum(phenoColumns.map(this.columnWidth))
    },
    xPositions(): number[] {
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
    sortingPheno(): string | null {
      if (this.sorting.field === 'pheno') {
        return this.sorting.pheno
      }
      return null
    },
  },
  methods: {
    ...mapActions(useDataStore, ['changeSorting']),
    columnWidth(column: PhenoColumn): number {
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
        .data(phenoColumns, (d) => (d as PhenoColumn).label)
        .join(
          (enter) =>
            enter
              .append('foreignObject')
              .attr('width', 200)
              .attr('height', CELL_SIZE)
              .attr('transform', (d, index) => {
                const x = this.xPositions[index]
                const y = this.height - 10
                return `translate(${x},${y}) rotate(-45)`
              })
              .append('xhtml:div')
              .on('click', (event, d) => {
                this.changeSorting({
                  field: 'pheno',
                  pheno: d.field,
                })
              })
              .text((d) => d.label),
          (update) => update,
          (exit) => exit.remove()
        )
        .attr('class', (d) => (this.sortingPheno === d.field ? 'sorted' : ''))
    },
  },
  mounted() {
    this.drawLabels()
  },
  watch: {
    sortingPheno() {
      this.drawLabels()
    },
  },
}
</script>

<template>
  <svg id="pheno-labels" :width="width" :height="height"></svg>
</template>

<style lang="scss">
#pheno-labels {
  foreignObject {
    div {
      display: inline-block;
      position: absolute;
      user-select: none;
      color: darkgrey;
      font-size: 10px;
      line-height: 10px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      cursor: pointer;

      &:hover {
        color: #1890ff;
      }
    }

    &.sorted div {
      color: black;
    }
  }

  flex: 0 0 auto;
}
</style>
