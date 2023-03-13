<script lang="ts">
import * as d3 from 'd3'
import { sum } from 'lodash'
import { mapActions, mapState } from 'pinia'

import { useHomologyStore } from '@/stores/homology'
import type { ConfigMetadata } from '@/types'

export default {
  data() {
    return {
      height: 60,
      metadataGap: 4,
      paddingRight: 32,
    }
  },
  computed: {
    ...mapState(useHomologyStore, ['sorting', 'visibleSequenceMetadata']),
    width(): number {
      //
      return (
        sum(this.visibleSequenceMetadata.map(this.columnWidth)) +
        this.paddingRight
      )
    },
    xPositions(): number[] {
      const result: number[] = []
      let total = this.metadataGap

      this.visibleSequenceMetadata.forEach((column) => {
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
        return this.sorting.column
      }
      return null
    },
  },
  methods: {
    ...mapActions(useHomologyStore, ['changeSorting']),
    columnWidth(column: ConfigMetadata): number {
      if (column.type === 'boolean') return 18 + this.metadataGap
      if (column.type === 'categorical')
        return (column.width || 120) + this.metadataGap
      if (column.type === 'quantitative')
        return (column.width || 120) + this.metadataGap
      return 0
    },
    svg() {
      return d3.select('#metadata-labels')
    },
    positionTransform(index: number) {
      const x = this.xPositions[index] + 5
      const y = this.height - 5
      return `translate(${x},${y}) rotate(-45)`
    },
    draw() {
      this.svg()
        .selectAll('text')
        .data(this.visibleSequenceMetadata, (d) => (d as ConfigMetadata).column)
        .join(
          (enter) =>
            enter
              .append('text')
              .on('click', (event, d) => {
                this.changeSorting({
                  name: 'metadata',
                  column: d.column,
                })
              })
              .text((d) => d.label),
          (update) => update,
          (exit) => exit.remove()
        )
        .attr('data-sorted', (d) => this.sortingMetadata === d.column)
        .attr('transform', (d, index) => this.positionTransform(index))
    },
  },
  mounted() {
    this.draw()
  },
  watch: {
    visibleSequenceMetadata() {
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
@import '@/assets/colors.module.scss';

#metadata-labels {
  text {
    fill: $gray-7;
    font-size: 10px;
    cursor: pointer;

    &:hover {
      fill: $hover;
    }

    &[data-sorted='true'] {
      font-weight: 500;
      fill: $gray-10;
    }
  }

  flex: 0 0 auto;
}
</style>
