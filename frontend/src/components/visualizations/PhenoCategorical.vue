<script lang="ts">
import * as d3 from 'd3'
import { mapState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/config'
import type { Pheno, PhenoColumnCategoricalData } from '@/types'

export default {
  props: {
    field: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ...mapState(useDataStore, [
      'phenos',
      'sortedMrnaPositions',
      'transitionTime',
    ]),
    hasAllData(): boolean {
      return this.phenos.length !== 0 && this.sortedMrnaPositions.length !== 0
    },
    height(): number {
      return this.sortedMrnaPositions.length * CELL_SIZE
    },
    name(): string {
      return `pheno-${this.field}`
    },
  },
  methods: {
    svg() {
      return d3.select(`#${this.name}`)
    },
    cellY({ index }: Pheno): number {
      return this.sortedMrnaPositions[index] * CELL_SIZE
    },
    drawPheno() {
      if (!this.hasAllData) return

      this.svg()
        .selectAll('foreignObject')
        .data(this.phenos, (d) => (d as Pheno).mRNA_id)
        .join(
          (enter) =>
            enter
              .append('foreignObject')
              .attr('x', 3)
              .attr('y', this.cellY)
              .attr('width', this.width)
              .attr('height', CELL_SIZE)
              .text((d) => d[this.field] as PhenoColumnCategoricalData),

          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('y', this.cellY)
              .text((d) => d[this.field] as PhenoColumnCategoricalData),

          (exit) => exit.transition().duration(this.transitionTime).remove()
        )
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
  },
}
</script>

<template>
  <svg
    :id="name"
    :width="width"
    :height="height"
    class="pheno-categorical"
  ></svg>
</template>

<style lang="scss">
.pheno-categorical {
  flex: 0 0 auto;

  foreignObject {
    user-select: none;
    color: darkgrey;
    font-size: 9px;
    line-height: 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>
