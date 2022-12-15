<script lang="ts">
import * as d3 from 'd3'
import { mapState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { CELL_SIZE } from '@/config'

type Value = boolean | null

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
      'sortedMrnaIndices',
      'transitionTime',
    ]),
    hasAllData(): boolean {
      return this.phenos.length !== 0 && this.sortedMrnaIndices.length !== 0
    },
    height(): number {
      return this.sortedMrnaIndices.length * CELL_SIZE
    },
    name(): string {
      return `pheno-virulence`
    },
    values(): Value[] {
      if (!this.hasAllData) return []
      return this.sortedMrnaIndices.map((index) => this.phenos[index].virulence)
    },
    width(): number {
      return this.padding * 2 + CELL_SIZE
    },
  },
  methods: {
    svg() {
      return d3.select(`#${this.name}`)
    },
    drawPheno() {
      if (!this.hasAllData) return

      this.svg()
        .selectAll('circle')
        .data(this.values, (d, index) => index)
        .join(
          (enter) =>
            enter
              .append('circle')
              .attr('cx', this.padding + 0.5 * CELL_SIZE)
              .attr('cy', (d, index) => (index + 0.5) * CELL_SIZE)
              .attr('r', 4)
              .attr('stroke', 'black')
              .attr('fill', (d) => {
                if (d === true) {
                  return 'black'
                } else if (d === false) {
                  return 'white'
                } else {
                  return 'lightgrey'
                }
              }),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('cy', (d, index) => (index + 0.5) * CELL_SIZE),
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
    sortedMrnaIndices() {
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
