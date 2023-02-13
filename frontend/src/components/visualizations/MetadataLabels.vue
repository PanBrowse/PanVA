<script lang="ts">
import * as d3 from 'd3'
import { mapState, mapActions } from 'pinia'
import { sum } from 'lodash'
import type { ConfigMetadata } from '@/types'
import { useDataStore } from '@/stores/data'
import { useConfigStore } from '@/stores/config'

export default {
  computed: {
    ...mapState(useConfigStore, ['metadata']),
    ...mapState(useDataStore, ['sorting']),
    height(): number {
      return 60
    },
    width(): number {
      return sum(this.metadata.map(this.columnWidth))
    },
    xPositions(): number[] {
      const result: number[] = []
      let total = 0

      this.metadata.forEach((column) => {
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
    sortingMetadata(): string | null {
      if (this.sorting.name === 'metadata') {
        return this.sorting.field
      }
      return null
    },
  },
  methods: {
    ...mapActions(useDataStore, ['changeSorting']),
    columnWidth(column: ConfigMetadata): number {
      if (column.type === 'boolean') return 18
      if (column.type === 'categorical') return column.width
      if (column.type === 'quantitative') return column.width
      return 0
    },
    svg() {
      return d3.select('#metadata-labels')
    },
    draw() {
      this.svg()
        .selectAll('text')
        .data(this.metadata, (d) => (d as ConfigMetadata).label)
        .join(
          (enter) =>
            enter
              .append('text')
              .attr('transform', (d, index) => {
                const x = this.xPositions[index] + 5
                const y = this.height - 5
                return `translate(${x},${y}) rotate(-45)`
              })
              .on('click', (event, d) => {
                this.changeSorting({
                  name: 'metadata',
                  field: d.field,
                })
              })
              .text((d) => d.label),
          (update) => update,
          (exit) => exit.remove()
        )
        .attr('data-sorted', (d) => this.sortingMetadata === d.field)
    },
  },
  mounted() {
    this.draw()
  },
  watch: {
    metadata() {
      this.draw()
    },
    sortingMetadata() {
      this.draw()
    },
  },
}
</script>

<template>
  <svg id="metadata-labels" :width="width" :height="height"></svg>
</template>

<style lang="scss">
#metadata-labels {
  text {
    fill: darkgrey;
    font-size: 10px;
    cursor: pointer;

    &:hover {
      fill: #1890ff;
    }

    &[data-sorted='true'] {
      fill: #333;
    }
  }

  flex: 0 0 auto;
}
</style>
