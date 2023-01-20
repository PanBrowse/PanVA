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
    ...mapActions(useDataStore, ['toggleSelectedId']),
    svg() {
      return d3.select(`#${this.name}`)
    },
    cellY({ index }: Pheno): number {
      return (this.sortedMrnaPositions[index] + 0.5) * CELL_SIZE
    },
    drawPheno() {
      if (!this.hasAllData) return

      this.svg()
        .selectAll('circle')
        .data(this.phenos, (d) => (d as Pheno).mRNA_id)
        .join(
          (enter) =>
            enter
              .append('circle')
              .attr('cx', this.padding + 0.5 * CELL_SIZE)
              .attr('cy', this.cellY)
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
              }),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('cy', this.cellY),
          (exit) => exit.remove()
        )
        .attr('data-selected', ({ mRNA_id }) =>
          this.selectedMrnaIds.includes(mRNA_id)
        )
        .attr(
          'data-hovered',
          ({ index }) => this.hoverRowIndex === this.sortedMrnaPositions[index]
        )
        .on('mouseover', (event, { index }) => {
          this.hoverRowIndex = this.sortedMrnaPositions[index]
        })
        .on('mouseout', () => {
          this.hoverRowIndex = null
        })
        .on('click', (event, { mRNA_id }) => {
          this.toggleSelectedId(mRNA_id)
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

  circle {
    cursor: crosshair;

    &[data-selected='true'] {
      stroke: #000;
    }

    &[data-hovered='true'] {
      stroke: #1890ff;
    }
  }
}
</style>
