<template>
  <BarChart
    name="G1_Chr1"
    genomeNr="1"
    title="chr1"
    xKey="amount"
    yKey="name"
    :data="barChartData_1"
  />
  <BarChart
    name="G2_Chr1"
    genomeNr="2"
    title="chr1"
    xKey="amount"
    yKey="name"
    :data="barChartData_2"
  />
</template>

<script lang="ts">
import { mapActions, mapState } from 'pinia'

import { useGeneSetStore } from '@/stores/geneSet'
import { useGlobalStore } from '@/stores/global'
import type { SequenceMetrics } from '@/types'

import BarChart from './BarChart.vue'

export default {
  components: {
    BarChart,
  },
  data: () => ({
    barChartData_1: [
      {
        index: 1,
        name: '1_A',
        amount: 58690000,
      },
      {
        index: 2,
        name: '1_B',
        amount: 76150000,
      },
      {
        index: 3,
        name: '1_C',
        amount: 58770000,
      },
      {
        index: 4,
        name: '1_D',
        amount: 66569999,
      },
    ],
    barChartData_2: [
      {
        index: 5,
        name: '1_A',
        amount: 16690000,
      },
      {
        index: 6,
        name: '1_B',
        amount: 76150000,
      },
      {
        index: 7,
        name: '1_C',
        amount: 88770000,
      },
      {
        index: 8,
        name: '1_D',
        amount: 36569999,
      },
    ],
  }),
  computed: {
    ...mapState(useGeneSetStore, ['sequences']),
    phasedChromosomesLengths() {
      let chromosomes = this.sequences.map(
        ({
          genome_number,
          phasing_id,
          sequence_length,
          gene_density_per_Mbp,
        }) => ({
          genome_number,
          phasing_id,
          sequence_length,
          gene_density_per_Mbp,
        })
      )
      console.log(chromosomes)
      return chromosomes
    },
  },
  methods: {
    getChromosomesFromGenome(genome_nr) {
      return this.phasedChromosomesLengths.filter(
        (i) => i.genome_number == genome_nr
      )
    },
  },
  mounted() {
    console.log(this.phasedChromosomesLengths)
    console.log(this.getChromosomesFromGenome(2))
    console.log(this.getChromosomesFromGenome(3))
  },
}
</script>
