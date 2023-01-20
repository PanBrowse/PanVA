<script lang="ts">
import * as d3 from 'd3'
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/config'
import type { Pheno, PhenoColumnBooleanData } from '@/types'

export default {
  props: {
    field: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      padding: 4,
    }
  },
  computed: {
    ...mapState(useDataStore, [
      'phenos',
      'selectedMrnaIds',
      'sortedMrnaPositions',
      'transitionTime',
    ]),
    ...mapWritableState(useDataStore, ['hoverRowIndex']),
    hasAllData(): boolean {
      return this.phenos.length !== 0 && this.sortedMrnaPositions.length !== 0
    },
    height(): number {
      return this.sortedMrnaPositions.length * CELL_SIZE
    },
    name(): string {
      return `pheno-${this.field}`
    },
    width(): number {
      return this.padding * 2 + CELL_SIZE
    },
  },
  methods: {
    ...mapActions(useDataStore, ['dragStart', 'dragEnd', 'dragUpdate']),
    svg() {
      return d3.select(`#${this.name}`)
    },
    positionTransform({ index }: Pheno) {
      const y = this.sortedMrnaPositions[index] * CELL_SIZE
      return `translate(0,${y})`
    },
    drawPheno() {
      if (!this.hasAllData) return

      this.svg()
        .selectAll('g')
        .data(this.phenos, (d) => (d as Pheno).mRNA_id)
        .join(
          (enter) => {
            const g = enter
              .append('g')
              .attr('transform', this.positionTransform)

            g.append('rect')
              .attr('height', CELL_SIZE)
              .attr('width', this.padding * 2 + CELL_SIZE)
              .attr('fill', 'transparent')

            g.append('circle')
              .attr('cx', this.padding + 0.5 * CELL_SIZE)
              .attr('cy', 0.5 * CELL_SIZE)
              .attr('r', (d) => {
                const value = d[this.field] as PhenoColumnBooleanData
                if (value === true) return 4
                if (value === false) return 4
                return 1
              })
              .attr('stroke', (d) => {
                const value = d[this.field] as PhenoColumnBooleanData
                if (value === true) return 'transparent'
                if (value === false) return '#aaa'
                return '#ccc'
              })
              .attr('fill', (d) => {
                const value = d[this.field] as PhenoColumnBooleanData
                if (value === true) return '#666'
                if (value === false) return 'white'
                return '#ccc'
              })
            return g
          },
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('transform', this.positionTransform),
          (exit) => exit.remove()
        )
        .attr('data-selected', ({ mRNA_id }) =>
          this.selectedMrnaIds.includes(mRNA_id)
        )
        .attr(
          'data-hovered',
          ({ index }) => this.hoverRowIndex === this.sortedMrnaPositions[index]
        )
        .on('mousedown', (event: MouseEvent, { index: idx }) => {
          const index = this.sortedMrnaPositions[idx]
          this.dragStart(index, event.ctrlKey)
        })
        .on('mouseover', (event, { index: idx }) => {
          const index = this.sortedMrnaPositions[idx]
          if (this.hoverRowIndex !== index) {
            this.hoverRowIndex = index
            this.dragUpdate(index)
          }
        })
        .on('mouseup', (event, { index: idx }) => {
          const index = this.sortedMrnaPositions[idx]
          this.dragEnd(index)
        })
        .on('mouseout', () => {
          this.hoverRowIndex = null
        })
    },
  },
  mounted() {
    this.drawPheno()
  },
  watch: {
    hasAllData() {
      this.drawPheno()
    },
    sortedMrnaPositions() {
      this.drawPheno()
    },
    phenos() {
      this.drawPheno()
    },
    selectedMrnaIds() {
      this.drawPheno()
    },
    hoverRowIndex() {
      this.drawPheno()
    },
  },
}
</script>

<template>
  <svg :id="name" :width="width" :height="height" class="pheno-boolean"></svg>
</template>

<style lang="scss">
.pheno-boolean {
  flex: 0 0 auto;

  g {
    cursor: crosshair;

    &[data-selected='true'] circle {
      stroke: #000;
    }

    &[data-hovered='true'] circle {
      stroke: #1890ff;
    }
  }
}
</style>
