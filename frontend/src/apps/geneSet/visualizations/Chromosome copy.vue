<template>
  <a-row>
    <a-col :span="1"></a-col>
    <a-col :span="23"
      ><Axis chromosome="1" xKey="sequence_length" :data="groupedData"
    /></a-col>
  </a-row>
  <a-row>
    <a-col :span="1">
      <h1>G1</h1>
    </a-col>
    <a-col :span="23">
      <BarChart
        name="G1_Chr1"
        genomeNr="1"
        title="chr1"
        xKey="sequence_length"
        yKey="genome_phased_id"
        :data="getPhasedChromosomesForGenome(1)"
        :dataMinimum="dataMin"
        :dataMaximum="dataMax"
      />
    </a-col>
  </a-row>
  <a-row>
    <a-col :span="1">
      <h1>G2</h1>
    </a-col>
    <a-col :span="23">
      <BarChart
        name="G2_Chr1"
        genomeNr="2"
        title="chr1"
        xKey="sequence_length"
        yKey="genome_phased_id"
        :data="getPhasedChromosomesForGenome(2)"
        :dataMinimum="dataMin"
        :dataMaximum="dataMax"
      />
    </a-col>
  </a-row>
  <a-row>
    <a-col :span="1">
      <h1>G3</h1>
    </a-col>
    <a-col :span="23">
      <BarChart
        name="G3_Chr1"
        genomeNr="3"
        title="chr1"
        xKey="sequence_length"
        yKey="genome_phased_id"
        :data="getPhasedChromosomesForGenome(3)"
        :dataMinimum="dataMin"
        :dataMaximum="dataMax"
      />
    </a-col>
  </a-row>
  <a-row>
    <a-col :span="1">
      <h1>G4</h1>
    </a-col>
    <a-col :span="23">
      <BarChart
        name="G4_Chr1"
        genomeNr="4"
        title="chr1"
        xKey="sequence_length"
        yKey="genome_phased_id"
        :data="getPhasedChromosomesForGenome(4)"
        :dataMinimum="dataMin"
        :dataMaximum="dataMax"
      />
    </a-col>
  </a-row>
  <a-row>
    <a-col :span="1">
      <h1>G5</h1>
    </a-col>
    <a-col :span="23">
      <BarChart
        name="G5_Chr1"
        genomeNr="5"
        title="chr1"
        xKey="sequence_length"
        yKey="genome_phased_id"
        :data="getPhasedChromosomesForGenome(5)"
        :dataMinimum="dataMin"
        :dataMaximum="dataMax"
      />
    </a-col>
  </a-row>
</template>

<script lang="ts">
import { Col, Row } from 'ant-design-vue'
import * as d3 from 'd3'
import { mapActions, mapState } from 'pinia'

import { useGeneSetStore } from '@/stores/geneSet'
import { useGlobalStore } from '@/stores/global'
import type { SequenceMetrics } from '@/types'

import Axis from './Axis.vue'
import BarChart from './BarChart.vue'

export default {
  components: {
    BarChart,
    Axis,
    ARow: Row,
    ACol: Col,
  },
  data: () => ({
    genomeData: [
      {
        genome_number: 1,
        phasing_id: '1_unphased',
        genome_phased_id: '1_1_unphased',
        phasing_chromosome: 1,
        sequence_length: 88590000,
        gene_density_per_Mbp: 66,
      },
      {
        genome_number: 2,
        phasing_id: '1_A',
        genome_phased_id: '2_1_A',
        phasing_chromosome: 1,
        sequence_length: 58690000,
        gene_density_per_Mbp: 43,
      },
      {
        genome_number: 2,
        phasing_id: '1_B',
        genome_phased_id: '2_1_B',
        phasing_chromosome: 1,
        sequence_length: 76150000,
        gene_density_per_Mbp: 39,
      },
      {
        genome_number: 2,
        phasing_id: '1_C',
        genome_phased_id: '2_1_C',
        phasing_chromosome: 1,
        sequence_length: 58770000,
        gene_density_per_Mbp: 51,
      },
      {
        genome_number: 2,
        phasing_id: '1_D',
        genome_phased_id: '2_1_D',
        phasing_chromosome: 1,
        sequence_length: 66569999,
        gene_density_per_Mbp: 43,
      },
      {
        genome_number: 3,
        phasing_id: '1_A',
        genome_phased_id: '3_1_A',
        phasing_chromosome: 1,
        sequence_length: 60550000,
        gene_density_per_Mbp: 45,
      },
      {
        genome_number: 3,
        phasing_id: '1_B',
        genome_phased_id: '3_1_B',
        phasing_chromosome: 1,
        sequence_length: 44210000,
        gene_density_per_Mbp: 62,
      },
      {
        genome_number: 3,
        phasing_id: '1_C',
        genome_phased_id: '3_1_C',
        phasing_chromosome: 1,
        sequence_length: 44430000,
        gene_density_per_Mbp: 71,
      },
      {
        genome_number: 3,
        phasing_id: '1_D',
        genome_phased_id: '3_1_D',
        phasing_chromosome: 1,
        sequence_length: 54120000,
        gene_density_per_Mbp: 42,
      },
      {
        genome_number: 4,
        phasing_id: '1_A',
        genome_phased_id: '4_1_A',
        phasing_chromosome: 1,
        sequence_length: 96920000,
        gene_density_per_Mbp: 46,
      },
      {
        genome_number: 4,
        phasing_id: '1_unphased',
        genome_phased_id: '4_1_unphased',
        phasing_chromosome: 1,
        sequence_length: 15760,
        gene_density_per_Mbp: 0,
      },
      {
        genome_number: 4,
        phasing_id: '1_unphased',
        genome_phased_id: '4_1_unphased',
        phasing_chromosome: 1,
        sequence_length: 24580,
        gene_density_per_Mbp: 162,
      },
      {
        genome_number: 4,
        phasing_id: '1_unphased',
        genome_phased_id: '4_1_unphased',
        phasing_chromosome: 1,
        sequence_length: 22350,
        gene_density_per_Mbp: 134,
      },
      {
        genome_number: 4,
        phasing_id: '1_B',
        genome_phased_id: '4_1_B',
        phasing_chromosome: 1,
        sequence_length: 98770000,
        gene_density_per_Mbp: 49,
      },
      {
        genome_number: 4,
        phasing_id: '1_unphased',
        genome_phased_id: '4_1_unphased',
        phasing_chromosome: 1,
        sequence_length: 20470,
        gene_density_per_Mbp: 0,
      },
      {
        genome_number: 4,
        phasing_id: '1_C',
        genome_phased_id: '4_1_C',
        phasing_chromosome: 1,
        sequence_length: 99150000,
        gene_density_per_Mbp: 44,
      },
      {
        genome_number: 4,
        phasing_id: '1_unphased',
        genome_phased_id: '4_1_unphased',
        phasing_chromosome: 1,
        sequence_length: 19670,
        gene_density_per_Mbp: 0,
      },
      {
        genome_number: 4,
        phasing_id: '1_D',
        genome_phased_id: '4_1_D',
        phasing_chromosome: 1,
        sequence_length: 89280000,
        gene_density_per_Mbp: 52,
      },
      {
        genome_number: 5,
        phasing_id: '1_A',
        genome_phased_id: '5_1_A',
        phasing_chromosome: 1,
        sequence_length: 99470000,
        gene_density_per_Mbp: 47,
      },
      {
        genome_number: 5,
        phasing_id: '1_B',
        genome_phased_id: '5_1_B',
        phasing_chromosome: 1,
        sequence_length: 94260000,
        gene_density_per_Mbp: 50,
      },
      {
        genome_number: 5,
        phasing_id: '1_C',
        genome_phased_id: '5_1_C',
        phasing_chromosome: 1,
        sequence_length: 86650000,
        gene_density_per_Mbp: 53,
      },
      {
        genome_number: 5,
        phasing_id: '1_D',
        genome_phased_id: '5_1_D',
        phasing_chromosome: 1,
        sequence_length: 93810000,
        gene_density_per_Mbp: 51,
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
          phasing_chromosome,
          sequence_length,
          gene_density_per_Mbp,
        }) => ({
          genome_number,
          phasing_id,
          phasing_chromosome,
          sequence_length,
          gene_density_per_Mbp,
        })
      )
      return chromosomes
    },
    groupedData() {
      let groupedArray = d3.flatRollup(
        this.genomeData,
        (v) => d3.sum(v, (d) => d.sequence_length),
        (d) => d.genome_phased_id,
        (d) => d.genome_number
      )

      return groupedArray.map(
        ([genome_phased_id, genome_number, sequence_length]) => ({
          genome_phased_id,
          genome_number,
          sequence_length,
        })
      )
    },
    dataMax() {
      return d3.max(this.groupedData, (d) => d.sequence_length)
    },
    dataMin() {
      return d3.min(this.groupedData, (d) => d.sequence_length)
    },
  },
  methods: {
    getChromosomesFromGenome(genome_nr) {
      return this.phasedChromosomesLengths.filter(
        (i) => i.genome_number == genome_nr
      )
    },
    getSequencesWithChromosome(chromosome_nr) {
      return this.phasedChromosomesLengths.filter(
        (i) => i.phasing_chromosome == chromosome_nr
      )
    },
    getPhasedChromosomesForGenome(genome_nr) {
      return this.groupedData.filter((i) => i.genome_number == genome_nr)
    },
  },
  mounted() {
    console.log(this.phasedChromosomesLengths)
    console.log(this.getChromosomesFromGenome(2))
    console.log(this.getSequencesWithChromosome(1))
    console.log(this.groupedData, this.dataMax, this.dataMin)
    console.log(this.getPhasedChromosomesForGenome(1))
  },
}
</script>
