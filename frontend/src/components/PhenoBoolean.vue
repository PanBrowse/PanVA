<script lang="ts">
import * as d3 from 'd3'
import { mapState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/config'
import type { Pheno } from '@/types'

export default {
  // props: {
  //   field: {
  //     type: String,
  //     required: true,
  //   },
  // },
  data() {
    return {
      padding: 4,
    }
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
      return `pheno-virulence`
    },
    width(): number {
      return this.padding * 2 + CELL_SIZE
    },
  },
  methods: {
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
              .attr('r', 4)
              .attr('stroke', 'black')
              .attr('fill', (d) => {
                const virulence = d.virulence
                if (virulence === true) {
                  return 'black'
                } else if (virulence === false) {
                  return 'white'
                } else {
                  return 'lightgrey'
                }
              }),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('cy', this.cellY),
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
  <svg :id="name" :width="width" :height="height" class="pheno-boolean"></svg>
</template>

<style lang="scss">
.pheno-boolean {
  flex: 0 0 auto;
}
</style>
