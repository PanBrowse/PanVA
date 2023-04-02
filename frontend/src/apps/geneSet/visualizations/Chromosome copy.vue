<template>
  <!-- <Axis chromosome="1" xKey="sequence_length" :data="groupedData" /> -->
  <div>
    <button @click="sortGenomes({ 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 })">
      sort ascending genome</button
    ><button @click="sortGenomes({ 1: 4, 2: 3, 3: 2, 4: 1, 5: 0 })">
      sort descending genome
    </button>
  </div>
  <!-- <div><svg id="zoom-example"></svg></div> -->
  <div id="content" style="width: 100%; height: 100%">
    <svg :width="svgWidth" :height="svgHeight">
      <g :id="name"></g>
    </svg>
  </div>
</template>

<script lang="ts">
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
  },
  data: () => ({
    svgWidth: 0,
    svgHeight: 0,
    svgWidthScaleFactor: 0.95,
    svgHeightScaleFactor: 0.95,
    name: 'chrTable',
    margin: { top: 10, bottom: 10, right: 10, left: 10, yAxis: 40 },
    numberOfCols: 1,
    numberOfRows: 5,
    genomes: [1, 2, 3, 4, 5],
    genomesLookup: { 1: 4, 2: 3, 3: 2, 4: 1, 5: 0 },
    sortedGenomes: [4, 3, 2, 1, 0],
    chromosomeCells: [
      {
        genome_number: 1,
        subgenomes: [
          {
            genome_phased_id: '1_1_unphased',
            phased_id: 'unphased',
            genome_number: 1,
            sequence_length: 88590000,
          },
        ],
        row: 1,
        col: 0,
      },
      {
        genome_number: 2,
        subgenomes: [
          {
            genome_phased_id: '2_1_A',
            phased_id: 'A',
            genome_number: 2,
            sequence_length: 58690000,
          },

          {
            genome_phased_id: '2_1_C',
            phased_id: 'C',
            genome_number: 2,
            sequence_length: 58770000,
          },

          {
            genome_phased_id: '2_1_D',
            phased_id: 'D',
            genome_number: 2,
            sequence_length: 66569999,
          },

          {
            genome_phased_id: '2_1_B',
            phased_id: 'B',
            genome_number: 2,
            sequence_length: 76150000,
          },
        ],
        row: 0,
        col: 0,
      },
      {
        genome_number: 3,
        subgenomes: [
          {
            genome_phased_id: '3_1_A',
            phased_id: 'A',
            genome_number: 3,
            sequence_length: 60550000,
          },
          {
            genome_phased_id: '3_1_B',
            phased_id: 'B',
            genome_number: 3,
            sequence_length: 44210000,
          },
          {
            genome_phased_id: '3_1_C',
            phased_id: 'C',
            genome_number: 3,
            sequence_length: 44430000,
          },
          {
            genome_phased_id: '3_1_D',
            phased_id: 'D',
            genome_number: 3,
            sequence_length: 54120000,
          },
        ],
        row: 2,
        col: 0,
      },
      {
        genome_number: 4,
        subgenomes: [
          {
            genome_phased_id: '4_1_A',
            phased_id: 'A',
            genome_number: 4,
            sequence_length: 96920000,
          },
          {
            genome_phased_id: '4_1_unphased',
            phased_id: 'unphased',
            genome_number: 4,
            sequence_length: 102830,
          },
          {
            genome_phased_id: '4_1_B',
            phased_id: 'B',
            genome_number: 4,
            sequence_length: 98770000,
          },
          {
            genome_phased_id: '4_1_C',
            phased_id: 'C',
            genome_number: 4,
            sequence_length: 99150000,
          },
          {
            genome_phased_id: '4_1_D',
            phased_id: 'D',
            genome_number: 4,
            sequence_length: 89280000,
          },
        ],
        row: 3,
        col: 0,
      },
      {
        genome_number: 5,
        subgenomes: [
          {
            genome_phased_id: '5_1_A',
            phased_id: 'A',
            genome_number: 5,
            sequence_length: 99470000,
          },
          {
            genome_phased_id: '5_1_B',
            phased_id: 'B',
            genome_number: 5,
            sequence_length: 94260000,
          },
          {
            genome_phased_id: '5_1_C',
            phased_id: 'C',
            genome_number: 5,
            sequence_length: 86650000,
          },
          {
            genome_phased_id: '5_1_D',
            phased_id: 'D',
            genome_number: 5,
            sequence_length: 93810000,
          },
        ],
        row: 4,
        col: 0,
      },
    ],
    chromosome5Cells: [
      {
        genome_number: 1,
        subgenomes: [
          {
            genome_number: 1,
            phased_chromosome_id: '5_U',
            genome_phased_id: '1_5_U',
            chromosome: 5,
            sequence_length: 55600000,
            gene_density_per_Mbp: 53,
          },
        ],
        genes: [
          {
            mrna_id: 'Soltu.DM.05G005140.1',
            gene_start_position: 4485531,
            phased_chromosome_id: '5_U',
            homology_id: 232273529,
          },
          {
            homology_id: 232273529,
            genome_number: 1,
            phased_chromosome_id: '5_U',
            gene_start_position: 4485531,
          },
          {
            homology_id: 232288684,
            genome_number: 1,
            phased_chromosome_id: '5_U',
            gene_start_position: 5139273,
          },
          {
            homology_id: 232288684,
            genome_number: 1,
            phased_chromosome_id: '5_U',
            gene_start_position: 5014527,
          },
          {
            homology_id: 232288684,
            genome_number: 1,
            phased_chromosome_id: '5_U',
            gene_start_position: 5139361,
          },
          {
            homology_id: 232288684,
            genome_number: 1,
            phased_chromosome_id: '5_U',
            gene_start_position: 5051788,
          },
          {
            homology_id: 232288684,
            genome_number: 1,
            phased_chromosome_id: '5_U',
            gene_start_position: 5051788,
          },
          {
            homology_id: 232288684,
            genome_number: 1,
            phased_chromosome_id: '5_U',
            gene_start_position: 5014527,
          },
          {
            homology_id: 232288684,
            genome_number: 1,
            phased_chromosome_id: '5_U',
            gene_start_position: 5139361,
          },
          {
            homology_id: 232288684,
            genome_number: 1,
            phased_chromosome_id: '5_U',
            gene_start_position: 5139361,
          },
          {
            homology_id: 232288684,
            genome_number: 1,
            phased_chromosome_id: '5_U',
            gene_start_position: 5124803,
          },
          {
            homology_id: 232288684,
            genome_number: 1,
            phased_chromosome_id: '5_U',
            gene_start_position: 5066653,
          },
          {
            homology_id: 232288684,
            genome_number: 1,
            phased_chromosome_id: '5_U',
            gene_start_position: 5029012,
          },
        ],
        row: 0,
        col: 0,
      },
      {
        genome_number: 2,
        subgenomes: [
          {
            genome_number: 2,
            phased_chromosome_id: '5_A',
            genome_phased_id: '2_5_A',
            chromosome: 5,
            sequence_length: 49980000,
            gene_density_per_Mbp: 36,
          },
          {
            genome_number: 2,
            phased_chromosome_id: '5_B',
            genome_phased_id: '2_5_B',
            chromosome: 5,
            sequence_length: 48690000,
            gene_density_per_Mbp: 39,
          },
          {
            genome_number: 2,
            phased_chromosome_id: '5_C',
            genome_phased_id: '2_5_C',
            chromosome: 5,
            sequence_length: 48910000,
            gene_density_per_Mbp: 37,
          },
          {
            genome_number: 2,
            phased_chromosome_id: '5_D',
            genome_phased_id: '2_5_D',
            chromosome: 5,
            sequence_length: 52450000,
            gene_density_per_Mbp: 33,
          },
        ],
        genes: [
          {
            mrna_id: 'Soltu.Atl.05_1G003780.1',
            gene_start_position: 3965022,
            phased_chromosome_id: '5_A',
            homology_id: 3965022,
          },
          {
            mrna_id: 'Soltu.Atl.05_1G003780.2',
            gene_start_position: 3965022,
            phased_chromosome_id: '5_A',
            homology_id: 232273529,
          },
          {
            mrna_id: 'Soltu.Atl.05_2G004540.1',
            gene_start_position: 4288942,
            phased_chromosome_id: '5_B',
            homology_id: 232273529,
          },
          {
            mrna_id: 'Soltu.Atl.05_4G004550.1',
            gene_start_position: 4572708,
            phased_chromosome_id: '5_D',
            homology_id: 232273529,
          },
          {
            mrna_id: 'Soltu.Atl.05_4G004550.2',
            gene_start_position: 4572708,
            phased_chromosome_id: '5_D',
            homology_id: 232273529,
          },
          {
            mrna_id: 'Soltu.Atl.05_0G001720.1',
            gene_start_position: 1589572,
            phased_chromosome_id: 'U',
            homology_id: 232273529,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_A',
            gene_start_position: 4670344,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_A',
            gene_start_position: 4670344,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_A',
            gene_start_position: 4534739,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_A',
            gene_start_position: 4556195,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_A',
            gene_start_position: 4645686,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: 'U',
            gene_start_position: 66,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_B',
            gene_start_position: 5006239,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '11_D',
            gene_start_position: 5071658,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: 'U',
            gene_start_position: 54493,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_B',
            gene_start_position: 4843825,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_A',
            gene_start_position: 4556195,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: 'U',
            gene_start_position: 66,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_B',
            gene_start_position: 4830796,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_B',
            gene_start_position: 4830796,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: 'U',
            gene_start_position: 66,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_A',
            gene_start_position: 4670344,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_A',
            gene_start_position: 4536851,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_B',
            gene_start_position: 4995605,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_A',
            gene_start_position: 4670344,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_A',
            gene_start_position: 4556195,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_A',
            gene_start_position: 4556195,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_A',
            gene_start_position: 4544732,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_B',
            gene_start_position: 5006239,
          },
          {
            homology_id: 232288684,
            genome_number: 2,
            phased_chromosome_id: '5_A',
            gene_start_position: 4645686,
          },
        ],
        row: 1,
        col: 0,
      },

      {
        genome_number: 3,
        subgenomes: [
          {
            genome_number: 3,
            phased_chromosome_id: '5_A',
            genome_phased_id: '3_5_A',
            chromosome: 5,
            sequence_length: 19800000,
            gene_density_per_Mbp: 64,
          },
          {
            genome_number: 3,
            phased_chromosome_id: '5_B',
            genome_phased_id: '3_5_B',
            chromosome: 5,
            sequence_length: 18860000,
            gene_density_per_Mbp: 64,
          },
          {
            genome_number: 3,
            phased_chromosome_id: '5_C',
            genome_phased_id: '3_5_C',
            chromosome: 5,
            sequence_length: 42470000,
            gene_density_per_Mbp: 38,
          },
          {
            genome_number: 3,
            phased_chromosome_id: '5_D',
            genome_phased_id: '3_5_D',
            chromosome: 5,
            sequence_length: 20370000,
            gene_density_per_Mbp: 66,
          },
        ],
        genes: [
          {
            mrna_id: 'Soltu.Cru.05_1G003010.1',
            gene_start_position: 3323753,
            phased_chromosome_id: '5_A',
            homology_id: 232273529,
          },
          {
            mrna_id: 'Soltu.Atl.05_4G004550.1',
            gene_start_position: 4572708,
            phased_chromosome_id: '5_B',
            homology_id: 232273529,
          },
          {
            mrna_id: 'Soltu.Cru.05_2G003730.1',
            gene_start_position: 3783539,
            phased_chromosome_id: '5_B',
            homology_id: 232273529,
          },
          {
            mrna_id: 'Soltu.Cru.05_3G001700.1',
            gene_start_position: 1803529,
            phased_chromosome_id: '5_C',
            homology_id: 232273529,
          },
          {
            mrna_id: 'Soltu.Cru.05_4G004950.1',
            gene_start_position: 4896609,
            phased_chromosome_id: '5_D',
            homology_id: 232273529,
          },
          {
            mrna_id: 'Soltu.Cru.05_4G004950.2',
            gene_start_position: 4896609,
            phased_chromosome_id: '5_D',
            homology_id: 232273529,
          },
          {
            homology_id: 232273529,
            genome_number: 3,
            phased_chromosome_id: '5_C',
            gene_start_position: 1803529,
          },
          {
            homology_id: 232273529,
            genome_number: 3,
            phased_chromosome_id: '5_D',
            gene_start_position: 4896609,
          },
          {
            homology_id: 232273529,
            genome_number: 3,
            phased_chromosome_id: '5_A',
            gene_start_position: 3323753,
          },
          {
            homology_id: 232273529,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 3783539,
          },
          {
            homology_id: 232273529,
            genome_number: 3,
            phased_chromosome_id: '5_D',
            gene_start_position: 4896609,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4523632,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_A',
            gene_start_position: 4027353,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_C',
            gene_start_position: 2408074,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_C',
            gene_start_position: 2430493,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_D',
            gene_start_position: 5595184,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_A',
            gene_start_position: 3954221,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_A',
            gene_start_position: 3945435,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_D',
            gene_start_position: 5537798,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4331442,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_A',
            gene_start_position: 4081777,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_C',
            gene_start_position: 2327481,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4501656,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4331442,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_C',
            gene_start_position: 2242586,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_A',
            gene_start_position: 4034559,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_A',
            gene_start_position: 3837242,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '11_A',
            gene_start_position: 5538904,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4295953,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_D',
            gene_start_position: 5595184,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_D',
            gene_start_position: 5485209,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_A',
            gene_start_position: 3954221,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_A',
            gene_start_position: 4081777,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_C',
            gene_start_position: 2242586,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_C',
            gene_start_position: 2408074,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_C',
            gene_start_position: 2408074,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_C',
            gene_start_position: 2529092,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4416922,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4331442,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_C',
            gene_start_position: 2292017,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: 'U',
            gene_start_position: 3499,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_A',
            gene_start_position: 4098897,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_D',
            gene_start_position: 5562240,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_D',
            gene_start_position: 5453446,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4416922,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_A',
            gene_start_position: 4081777,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4470472,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_A',
            gene_start_position: 4027353,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_D',
            gene_start_position: 5562240,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_D',
            gene_start_position: 5513213,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_D',
            gene_start_position: 5918789,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_C',
            gene_start_position: 2327481,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '11_C',
            gene_start_position: 4604944,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_C',
            gene_start_position: 2327481,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_C',
            gene_start_position: 2408074,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4331442,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4295953,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4416922,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4295953,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_A',
            gene_start_position: 4027353,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_D',
            gene_start_position: 5562240,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_A',
            gene_start_position: 4081777,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4481763,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4523632,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_D',
            gene_start_position: 5595184,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4501656,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4295953,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_A',
            gene_start_position: 3945435,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_D',
            gene_start_position: 5485209,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_C',
            gene_start_position: 2327481,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4470472,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_A',
            gene_start_position: 3837242,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_D',
            gene_start_position: 5595184,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_B',
            gene_start_position: 4523632,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_D',
            gene_start_position: 5562240,
          },
          {
            homology_id: 232288684,
            genome_number: 3,
            phased_chromosome_id: '5_A',
            gene_start_position: 3816811,
          },
        ],
        row: 2,
        col: 0,
      },

      {
        genome_number: 4,
        subgenomes: [
          {
            genome_number: 4,
            phased_chromosome_id: '5_A',
            genome_phased_id: '4_5_A',
            chromosome: 5,
            sequence_length: 69520000,
            gene_density_per_Mbp: 45,
          },
          {
            genome_number: 4,
            phased_chromosome_id: '5_B',
            genome_phased_id: '4_5_B',
            chromosome: 5,
            sequence_length: 74650000,
            gene_density_per_Mbp: 43,
          },
          {
            genome_number: 4,
            phased_chromosome_id: '5_C',
            genome_phased_id: '4_5_C',
            chromosome: 5,
            sequence_length: 69260000,
            gene_density_per_Mbp: 45,
          },
          {
            genome_number: 4,
            phased_chromosome_id: '5_D',
            genome_phased_id: '4_5_D',
            chromosome: 5,
            sequence_length: 73210000,
            gene_density_per_Mbp: 44,
          },
          {
            genome_number: 4,
            phased_chromosome_id: '5_U',
            genome_phased_id: '4_5_U',
            chromosome: 5,
            sequence_length: 50440,
            gene_density_per_Mbp: 0,
          },
        ],
        genes: [
          {
            mrna_id: 'rna-gnl|WGS:JAIVGD|St2-St05G125040.1',
            gene_start_position: 4712041,
            phased_chromosome_id: '5_A',
            homology_id: 232273529,
          },
          {
            mrna_id: 'Soltu.Atl.05_4G004550.1',
            gene_start_position: 5587194,
            phased_chromosome_id: '5_B',
            homology_id: 232273529,
          },
          {
            mrna_id: 'rna-gnl|WGS:JAIVGB|He2-St05G117160.1',
            gene_start_position: 3412673,
            phased_chromosome_id: '5_C',
            homology_id: 232273529,
          },
          {
            mrna_id: 'rna-gnl|WGS:JAIVGA|He1-St05G119040.1',
            gene_start_position: 3916154,
            phased_chromosome_id: '5_D',
            homology_id: 232273529,
          },
          {
            homology_id: 232273529,
            genome_number: 4,
            phased_chromosome_id: '5_D',
            gene_start_position: 3916154,
          },
          {
            homology_id: 232273529,
            genome_number: 4,
            phased_chromosome_id: '5_C',
            gene_start_position: 3412673,
          },
          {
            homology_id: 232273529,
            genome_number: 4,
            phased_chromosome_id: '5_A',
            gene_start_position: 4712041,
          },
          {
            homology_id: 232273529,
            genome_number: 4,
            phased_chromosome_id: '5_B',
            gene_start_position: 5587194,
          },
          {
            homology_id: 232288684,
            genome_number: 4,
            phased_chromosome_id: '5_A',
            gene_start_position: 5505357,
          },
          {
            homology_id: 232288684,
            genome_number: 4,
            phased_chromosome_id: '5_B',
            gene_start_position: 6342293,
          },
          {
            homology_id: 232288684,
            genome_number: 4,
            phased_chromosome_id: '5_A',
            gene_start_position: 5396043,
          },
          {
            homology_id: 232288684,
            genome_number: 4,
            phased_chromosome_id: '5_C',
            gene_start_position: 3855833,
          },
          {
            homology_id: 232288684,
            genome_number: 4,
            phased_chromosome_id: '5_D',
            gene_start_position: 4496792,
          },
          {
            homology_id: 232288684,
            genome_number: 4,
            phased_chromosome_id: '5_B',
            gene_start_position: 6246786,
          },
          {
            homology_id: 232288684,
            genome_number: 4,
            phased_chromosome_id: '5_B',
            gene_start_position: 6406792,
          },
          {
            homology_id: 232288684,
            genome_number: 4,
            phased_chromosome_id: '5_D',
            gene_start_position: 4554743,
          },
          {
            homology_id: 232288684,
            genome_number: 4,
            phased_chromosome_id: '5_B',
            gene_start_position: 6335460,
          },
          {
            homology_id: 232288684,
            genome_number: 4,
            phased_chromosome_id: '5_C',
            gene_start_position: 3870593,
          },
          {
            homology_id: 232288684,
            genome_number: 4,
            phased_chromosome_id: '5_B',
            gene_start_position: 6255463,
          },
          {
            homology_id: 232288684,
            genome_number: 4,
            phased_chromosome_id: '5_A',
            gene_start_position: 5563837,
          },
          {
            homology_id: 232288684,
            genome_number: 4,
            phased_chromosome_id: '5_B',
            gene_start_position: 6138465,
          },
          {
            homology_id: 232288684,
            genome_number: 4,
            phased_chromosome_id: '5_D',
            gene_start_position: 4444476,
          },
          {
            homology_id: 232288684,
            genome_number: 4,
            phased_chromosome_id: '5_B',
            gene_start_position: 6272785,
          },
          {
            homology_id: 232288684,
            genome_number: 4,
            phased_chromosome_id: '5_D',
            gene_start_position: 4481801,
          },
          {
            homology_id: 232288684,
            genome_number: 4,
            phased_chromosome_id: '5_A',
            gene_start_position: 5538524,
          },
        ],
        row: 3,
        col: 0,
      },
      {
        genome_number: 5,
        subgenomes: [
          {
            genome_number: 5,
            phased_chromosome_id: '5_A',
            genome_phased_id: '5_5_A',
            chromosome: 5,
            sequence_length: 59820000,
            gene_density_per_Mbp: 44,
          },
          {
            genome_number: 5,
            phased_chromosome_id: '5_B',
            genome_phased_id: '5_5_B',
            chromosome: 5,
            sequence_length: 53490000,
            gene_density_per_Mbp: 49,
          },
          {
            genome_number: 5,
            phased_chromosome_id: '5_C',
            genome_phased_id: '5_5_C',
            chromosome: 5,
            sequence_length: 56690000,
            gene_density_per_Mbp: 46,
          },
          {
            genome_number: 5,
            phased_chromosome_id: '5_D',
            genome_phased_id: '5_5_D',
            chromosome: 5,
            sequence_length: 55790000,
            gene_density_per_Mbp: 46,
          },
        ],
        genes: [
          {
            mrna_id: 'C88_C05H1G005110.1',
            gene_start_position: 4924459,
            phased_chromosome_id: '5_A',
            homology_id: 232273529,
          },
          {
            mrna_id: 'C88_C05H2G031990.1',
            gene_start_position: 4765093,
            phased_chromosome_id: '5_B',
            homology_id: 232273529,
          },
          {
            mrna_id: 'Soltu.Atl.05_4G004550.1',
            gene_start_position: 4572708,
            phased_chromosome_id: '5_C',
            homology_id: 232273529,
          },
          {
            mrna_id: 'C88_C05H3G058200.1',
            gene_start_position: 5397107,
            phased_chromosome_id: '5_C',
            homology_id: 232273529,
          },
          {
            mrna_id: 'C88_C05H3G058200.3',
            gene_start_position: 5397107,
            phased_chromosome_id: '5_C',
            homology_id: 232273529,
          },
          {
            mrna_id: 'C88_C05H4G084400.1',
            gene_start_position: 4598536,
            phased_chromosome_id: '5_D',
            homology_id: 232273529,
          },
          {
            homology_id: 232273529,
            genome_number: 5,
            phased_chromosome_id: '5_D',
            gene_start_position: 4598536,
          },
          {
            homology_id: 232273529,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 4924459,
          },
          {
            homology_id: 232273529,
            genome_number: 5,
            phased_chromosome_id: '5_C',
            gene_start_position: 5397107,
          },
          {
            homology_id: 232273529,
            genome_number: 5,
            phased_chromosome_id: '5_C',
            gene_start_position: 5397107,
          },
          {
            homology_id: 232273529,
            genome_number: 5,
            phased_chromosome_id: '5_B',
            gene_start_position: 4765093,
          },
          {
            homology_id: 232273529,
            genome_number: 5,
            phased_chromosome_id: '5_C',
            gene_start_position: 5397107,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5656215,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_D',
            gene_start_position: 5036544,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_B',
            gene_start_position: 5484394,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_B',
            gene_start_position: 5300474,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_B',
            gene_start_position: 5203101,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_B',
            gene_start_position: 5300474,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5706126,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '11_C',
            gene_start_position: 4986168,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5543541,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_D',
            gene_start_position: 5317837,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_C',
            gene_start_position_: 6134269,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 6059970,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_C',
            gene_start_position: 5966336,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5656215,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_C',
            gene_start_position: 6134269,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5656215,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_B',
            gene_start_position: 5403170,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_B',
            gene_start_position: 5381068,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 6059970,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_D',
            gene_start_position: 5133917,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_D',
            gene_start_position: 5036544,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_D',
            gene_start_position: 5214511,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_D',
            gene_start_position: 5133917,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5531281,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5543541,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_B',
            gene_start_position: 5203101,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_C',
            gene_start_position: 5966336,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_B',
            gene_start_position: 5381068,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_B',
            gene_start_position: 5203101,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5787658,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5462509,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_D',
            gene_start_position: 5133917,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '11_C',
            gene_start_position: 4986168,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 6059970,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5656215,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5531281,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_B',
            gene_start_position: 5300474,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5543541,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5656215,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5543541,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_C',
            gene_start_position: 5979256,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_C',
            gene_start_position: 6123552,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_D',
            gene_start_position: 5317837,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5543541,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_D',
            gene_start_position: 5236613,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_D',
            gene_start_position: 5133917,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_C',
            gene_start_position: 5979256,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5592617,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_B',
            gene_start_position: 5484394,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5706126,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_B',
            gene_start_position: 5300474,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 6059970,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_C',
            gene_start_position: 6123552,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_B',
            gene_start_position: 5203101,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5656215,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_D',
            gene_start_position: 5036544,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5706126,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 6059970,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '11_C',
            gene_start_position: 4986168,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5828966,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_C',
            gene_start_position: 6123552,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 6059970,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_C',
            gene_start_position: 6123552,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 6059970,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 6059970,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_B',
            gene_start_position: 5484394,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_D',
            gene_start_position: 5036544,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 6059970,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 6035144,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5729529,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 5592617,
          },
          {
            homology_id: 232288684,
            genome_number: 5,
            phased_chromosome_id: '5_A',
            gene_start_position: 6059970,
          },
        ],
        row: 4,
        col: 0,
      },
    ],
    genomeDataChr5: [
      {
        genome_number: 1,
        phased_chromosome_id: '5_U',
        genome_phased_id: '1_5_U',
        chromosome: 5,
        sequence_length: 55600000,
        gene_density_per_Mbp: 53,
      },
      {
        genome_number: 2,
        phased_chromosome_id: '5_A',
        genome_phased_id: '2_5_A',
        chromosome: 5,
        sequence_length: 49980000,
        gene_density_per_Mbp: 36,
      },
      {
        genome_number: 2,
        phased_chromosome_id: '5_B',
        genome_phased_id: '2_5_B',
        chromosome: 5,
        sequence_length: 48690000,
        gene_density_per_Mbp: 39,
      },
      {
        genome_number: 2,
        phased_chromosome_id: '5_C',
        genome_phased_id: '2_5_C',
        chromosome: 5,
        sequence_length: 48910000,
        gene_density_per_Mbp: 37,
      },
      {
        genome_number: 2,
        phased_chromosome_id: '5_D',
        genome_phased_id: '2_5_D',
        chromosome: 5,
        sequence_length: 52450000,
        gene_density_per_Mbp: 33,
      },
      {
        genome_number: 3,
        phased_chromosome_id: '5_A',
        genome_phased_id: '3_5_A',
        chromosome: 5,
        sequence_length: 19800000,
        gene_density_per_Mbp: 64,
      },
      {
        genome_number: 3,
        phased_chromosome_id: '5_B',
        genome_phased_id: '3_5_B',
        chromosome: 5,
        sequence_length: 18860000,
        gene_density_per_Mbp: 64,
      },
      {
        genome_number: 3,
        phased_chromosome_id: '5_C',
        genome_phased_id: '3_5_C',
        chromosome: 5,
        sequence_length: 42470000,
        gene_density_per_Mbp: 38,
      },
      {
        genome_number: 3,
        phased_chromosome_id: '5_D',
        genome_phased_id: '3_5_D',
        chromosome: 5,
        sequence_length: 20370000,
        gene_density_per_Mbp: 66,
      },
      {
        genome_number: 4,
        phased_chromosome_id: '5_A',
        genome_phased_id: '4_5_A',
        chromosome: 5,
        sequence_length: 69520000,
        gene_density_per_Mbp: 45,
      },
      {
        genome_number: 4,
        phased_chromosome_id: '5_B',
        genome_phased_id: '4_5_B',
        chromosome: 5,
        sequence_length: 74650000,
        gene_density_per_Mbp: 43,
      },
      {
        genome_number: 4,
        phased_chromosome_id: '5_U',
        genome_phased_id: '4_5_U',
        chromosome: 5,
        sequence_length: 24230,
        gene_density_per_Mbp: 0,
      },
      {
        genome_number: 4,
        phased_chromosome_id: '5_C',
        genome_phased_id: '4_5_C',
        chromosome: 5,
        sequence_length: 69260000,
        gene_density_per_Mbp: 45,
      },
      {
        genome_number: 4,
        phased_chromosome_id: '5_U',
        genome_phased_id: '4_5_U',
        chromosome: 5,
        sequence_length: 26210,
        gene_density_per_Mbp: 0,
      },
      {
        genome_number: 4,
        phased_chromosome_id: '5_D',
        genome_phased_id: '4_5_D',
        chromosome: 5,
        sequence_length: 73210000,
        gene_density_per_Mbp: 44,
      },
      {
        genome_number: 5,
        phased_chromosome_id: '5_A',
        genome_phased_id: '5_5_A',
        chromosome: 5,
        sequence_length: 59820000,
        gene_density_per_Mbp: 44,
      },
      {
        genome_number: 5,
        phased_chromosome_id: '5_B',
        genome_phased_id: '5_5_B',
        chromosome: 5,
        sequence_length: 53490000,
        gene_density_per_Mbp: 49,
      },
      {
        genome_number: 5,
        phased_chromosome_id: '5_C',
        genome_phased_id: '5_5_C',
        chromosome: 5,
        sequence_length: 56690000,
        gene_density_per_Mbp: 46,
      },
      {
        genome_number: 5,
        phased_chromosome_id: '5_D',
        genome_phased_id: '5_5_D',
        chromosome: 5,
        sequence_length: 55790000,
        gene_density_per_Mbp: 46,
      },
    ],
    genomeData: [
      {
        genome_number: 1,
        phased_chromosome_id: '1_unphased',
        genome_phased_id: '1_1_unphased',
        chromosome: 1,
        sequence_length: 88590000,
        gene_density_per_Mbp: 66,
      },
      {
        genome_number: 2,
        phased_chromosome_id: '1_A',
        genome_phased_id: '2_1_A',
        chromosome: 1,
        sequence_length: 58690000,
        gene_density_per_Mbp: 43,
      },
      {
        genome_number: 2,
        phased_chromosome_id: '1_B',
        genome_phased_id: '2_1_B',
        chromosome: 1,
        sequence_length: 76150000,
        gene_density_per_Mbp: 39,
      },
      {
        genome_number: 2,
        phased_chromosome_id: '1_C',
        genome_phased_id: '2_1_C',
        chromosome: 1,
        sequence_length: 58770000,
        gene_density_per_Mbp: 51,
      },
      {
        genome_number: 2,
        phased_chromosome_id: '1_D',
        genome_phased_id: '2_1_D',
        chromosome: 1,
        sequence_length: 66569999,
        gene_density_per_Mbp: 43,
      },
      {
        genome_number: 3,
        phased_chromosome_id: '1_A',
        genome_phased_id: '3_1_A',
        chromosome: 1,
        sequence_length: 60550000,
        gene_density_per_Mbp: 45,
      },
      {
        genome_number: 3,
        phased_chromosome_id: '1_B',
        genome_phased_id: '3_1_B',
        chromosome: 1,
        sequence_length: 44210000,
        gene_density_per_Mbp: 62,
      },
      {
        genome_number: 3,
        phased_chromosome_id: '1_C',
        genome_phased_id: '3_1_C',
        chromosome: 1,
        sequence_length: 44430000,
        gene_density_per_Mbp: 71,
      },
      {
        genome_number: 3,
        phased_chromosome_id: '1_D',
        genome_phased_id: '3_1_D',
        chromosome: 1,
        sequence_length: 54120000,
        gene_density_per_Mbp: 42,
      },
      {
        genome_number: 4,
        phased_chromosome_id: '1_A',
        genome_phased_id: '4_1_A',
        chromosome: 1,
        sequence_length: 96920000,
        gene_density_per_Mbp: 46,
      },
      {
        genome_number: 4,
        phased_chromosome_id: '1_unphased',
        genome_phased_id: '4_1_unphased',
        chromosome: 1,
        sequence_length: 15760,
        gene_density_per_Mbp: 0,
      },
      {
        genome_number: 4,
        phased_chromosome_id: '1_unphased',
        genome_phased_id: '4_1_unphased',
        chromosome: 1,
        sequence_length: 24580,
        gene_density_per_Mbp: 162,
      },
      {
        genome_number: 4,
        phased_chromosome_id: '1_unphased',
        genome_phased_id: '4_1_unphased',
        chromosome: 1,
        sequence_length: 22350,
        gene_density_per_Mbp: 134,
      },
      {
        genome_number: 4,
        phased_chromosome_id: '1_B',
        genome_phased_id: '4_1_B',
        chromosome: 1,
        sequence_length: 98770000,
        gene_density_per_Mbp: 49,
      },
      {
        genome_number: 4,
        phased_chromosome_id: '1_unphased',
        genome_phased_id: '4_1_unphased',
        chromosome: 1,
        sequence_length: 20470,
        gene_density_per_Mbp: 0,
      },
      {
        genome_number: 4,
        phased_chromosome_id: '1_C',
        genome_phased_id: '4_1_C',
        chromosome: 1,
        sequence_length: 99150000,
        gene_density_per_Mbp: 44,
      },
      {
        genome_number: 4,
        phased_chromosome_id: '1_unphased',
        genome_phased_id: '4_1_unphased',
        chromosome: 1,
        sequence_length: 19670,
        gene_density_per_Mbp: 0,
      },
      {
        genome_number: 4,
        phased_chromosome_id: '1_D',
        genome_phased_id: '4_1_D',
        chromosome: 1,
        sequence_length: 89280000,
        gene_density_per_Mbp: 52,
      },
      {
        genome_number: 5,
        phased_chromosome_id: '1_A',
        genome_phased_id: '5_1_A',
        chromosome: 1,
        sequence_length: 99470000,
        gene_density_per_Mbp: 47,
      },
      {
        genome_number: 5,
        phased_chromosome_id: '1_B',
        genome_phased_id: '5_1_B',
        chromosome: 1,
        sequence_length: 94260000,
        gene_density_per_Mbp: 50,
      },
      {
        genome_number: 5,
        phased_chromosome_id: '1_C',
        genome_phased_id: '5_1_C',
        chromosome: 1,
        sequence_length: 86650000,
        gene_density_per_Mbp: 53,
      },
      {
        genome_number: 5,
        phased_chromosome_id: '1_D',
        genome_phased_id: '5_1_D',
        chromosome: 1,
        sequence_length: 93810000,
        gene_density_per_Mbp: 51,
      },
    ],
  }),
  computed: {
    ...mapState(useGeneSetStore, ['sequences', 'groupInfo']),
    phasedChromosomesLengths() {
      let chromosomes = this.sequences.map(
        ({
          genome_number,
          phased_chromosome_id,
          chromosome,
          sequence_length,
          gene_density_per_Mbp,
        }) => ({
          genome_number,
          phased_chromosome_id,
          chromosome,
          sequence_length,
          gene_density_per_Mbp,
        })
      )
      return chromosomes
    },
    homologyGroupsSet() {
      let hgs = this.groupInfo.map(
        ({
          homology_id,
          genome_number,
          chromosome,
          gene_start_position,
          mRNA_id,
        }) => ({
          homology_id,
          genome_number,
          chromosome,
          gene_start_position,
          mRNA_id,
        })
      )
      return hgs
    },
    groupedData() {
      let groupedArray = d3.flatRollup(
        this.genomeDataChr5,
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
    visWidth() {
      return this.svgWidth - 4 * this.margin.left
    },
    visHeight() {
      return this.svgHeight
    },
    colScale() {
      return d3
        .scaleBand()
        .domain(d3.range(this.numberOfCols))
        .range([0, this.visWidth])
        .padding(0.05)
    },
    rowScale() {
      return d3
        .scaleBand()
        .domain(d3.range(this.numberOfRows))
        .range([0, this.visHeight])
        .padding(0.2)
    },
    xScale() {
      return d3
        .scaleLinear()
        .domain([this.dataMin > 0 ? 0 : this.dataMin, this.dataMax])
        .rangeRound([0, this.colScale.bandwidth()])
    },
    yScale() {
      return d3
        .scaleBand()
        .rangeRound([0, this.rowScale.bandwidth()])
        .domain(['5_A', '5_B', '5_C', '5_D', '5_U'])
        .padding(0.1)
    },
    colorScale() {
      return d3
        .scaleOrdinal()
        .domain([232273529, 232288684])
        .range(d3.schemeSet2)
    },
  },
  methods: {
    drawZoomExample() {
      const width = 500
      const height = 180
      const padding = { top: 10, bottom: 50, left: 40, right: 20 }

      const svg = d3
        .select('#zoom-example')
        .attr('width', width + padding.right + padding.left)
        .attr('height', height + padding.top + padding.bottom)

      const plotArea = svg
        .append('g')
        .attr('transform', 'translate(' + [padding.left, padding.top] + ')')

      const clippingRect = plotArea
        .append('clipPath')
        .attr('id', 'clippy')
        .append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'none')

      const data = d3.range(100).map(function (d) {
        return { value: Math.random(), sample: d }
      })

      const x = d3.scaleLinear().range([0, width]).domain([0, 100])
      let x2 = x.copy()
      const y = d3.scaleLinear().range([height, 0]).domain([0, 1])

      const line = d3
        .line()
        .x((d) => x2(d.sample))
        .y((d) => y(d.value))

      const xAxis = d3.axisBottom(x2)
      const xAxisG = plotArea
        .append('g')
        .attr('transform', 'translate(' + [0, height] + ')')
        .call(xAxis)

      const yAxis = d3.axisLeft(y)
      const yAxisG = plotArea.append('g').call(yAxis)

      const path = plotArea
        .append('path')
        .attr('class', 'zoom')
        .datum(data)
        .attr('d', line)
        .attr('clip-path', 'url(#clippy)')

      const zoom = d3.zoom().on('zoom', function (event) {
        x2 = event.transform.rescaleX(x)
        xAxisG.call(xAxis.scale(x2))
        path.attr('d', line)
      })

      svg.call(zoom)
    },
    svg() {
      return d3.select(`#${this.name}`)
    },
    g() {
      return this.svg().selectAll('g.cell')
    },
    getChromosomesFromGenome(genome_nr) {
      return this.phasedChromosomesLengths.filter(
        (i) => i.genome_number == genome_nr
      )
    },
    getSequencesWithChromosome(chromosome_nr) {
      return this.phasedChromosomesLengths.filter(
        (i) => i.chromosome == chromosome_nr
      )
    },
    getPhasedChromosomesForGenome(genome_nr) {
      return this.groupedData.filter((i) => i.genome_number == genome_nr)
    },
    getGenesForGenome(genome_nr) {
      return this.homologyGroupsSet.filter((i) => i.genome_number == genome_nr)
    },
    sortGenomes(order) {
      this.genomesLookup = order
      console.log('hello from click', this.genomesLookup)
      this.draw()
    },
    draw() {
      const t = this.svg().transition().duration(750)

      this.svg()
        .selectAll('g')
        .data(this.chromosome5Cells, (d) => d.genome_number)
        .join(
          (enter) =>
            enter
              .append('g')
              .attr('class', 'cell')
              .attr(
                'transform',
                (d) =>
                  `translate(${this.colScale(d.col)}, ${this.rowScale(
                    this.genomesLookup[d.genome_number]
                  )})`
              ),
          (update) =>
            update.call((update) =>
              update
                .transition(t)
                .attr(
                  'transform',
                  (d) =>
                    `translate(${this.colScale(d.col)}, ${this.rowScale(
                      this.genomesLookup[d.genome_number]
                    )})`
                )
            ),
          (exit) => exit.remove()
        )

      this.g()
        .selectAll('rect.cell-chr')
        .data((d) => [d.genome_number])
        .join(
          (enter) =>
            enter
              .append('rect')
              .attr('class', 'cell-chr')
              .attr('transform', `translate(${this.margin.yAxis}, 0)`)
              .attr(
                'width',
                this.colScale.bandwidth() +
                  this.margin.left * 4 +
                  this.margin.right
              )
              .attr('height', this.rowScale.bandwidth() + this.margin.top * 3)
              .attr('fill', 'white'),
          (update) => update,
          (exit) => exit.remove()
        )

      this.g()
        .selectAll('text')
        .data((d) => [d.genome_number])
        .join('text')
        .attr('font-size', 15)
        .attr('font-family', 'sans-serif')
        .attr('dominant-baseline', 'hanging')
        .attr('x', 0)
        .attr('y', this.margin.top)
        .text((d) => `G${d}`)

      this.drawBars()
      this.drawGenes()

      this.addXAxis()
      // this.addYAxis()
    },
    addXAxis() {
      this.g()
        .append('g')
        .attr('class', 'x-axis')
        .attr(
          'transform',
          'translate(' +
            (this.margin.yAxis + this.margin.left * 4) +
            ',' +
            this.margin.top * 3 +
            ')'
        )
        .call(d3.axisTop(this.xScale))
        .call((g) => g.select('.domain').remove())
        .call((g) => g.selectAll('line').attr('stroke', '#c0c0c0'))
        .call((g) => g.selectAll('text').attr('fill', '#c0c0c0'))
    },
    addYAxis() {
      this.g()
        .append('g')
        .attr('class', 'y-axis')
        .attr(
          'transform',
          'translate(' +
            (this.margin.yAxis + this.margin.left * 4) +
            ',' +
            this.margin.top * 3 +
            ')'
        )
        .call(d3.axisLeft(this.yScale))
        .call((g) => g.select('.domain').remove())
        .call((g) => g.selectAll('line').attr('stroke', '#c0c0c0'))
        .call((g) => g.selectAll('text').attr('fill', '#c0c0c0'))
    },
    drawBars() {
      let vis = this

      this.g()
        .selectAll('rect.bar-chr')
        .data((d) => d.subgenomes)
        .join(
          (enter) =>
            enter
              .append('rect')
              .attr(
                'transform',
                'translate(' +
                  (this.margin.yAxis + this.margin.left * 4) +
                  ',' +
                  this.margin.top * 3 +
                  ')'
              )
              .attr('class', 'bar-chr')
              .attr('x', vis.xScale(0))
              // .attr('y', function (d, i) {
              // not using yScale directly for position because of sorting
              //   return (
              //     i * vis.yScale.bandwidth() +
              //     (i + 1) * (0.1 * vis.yScale.bandwidth())
              //   )
              // })
              .attr('y', (d) => {
                return vis.yScale(d.phased_chromosome_id)
              })

              .attr('width', (d) => {
                return vis.xScale(d.sequence_length)
              })
              .attr('height', vis.yScale.bandwidth()),

          (update) =>
            update
              // .attr('y', function (d, i) {
              //   return (
              //     i * vis.yScale.bandwidth() +
              //     (i + 1) * (0.1 * vis.yScale.bandwidth())
              //   )
              // })
              .attr('y', (d) => {
                return vis.yScale(d.phased_chromosome_id)
              }),
          (exit) => exit.remove()
        )
    },
    drawGenes() {
      let vis = this

      this.g()
        .selectAll('path.gene')
        .data((d) => d.genes)
        .join(
          (enter) =>
            enter
              .append('path')
              .attr(
                'd',
                d3
                  .symbol()
                  .type(d3.symbolTriangle)
                  .size(this.rowScale.bandwidth())
              )
              .attr('transform', function (d, i) {
                return `translate(${
                  vis.margin.yAxis +
                  vis.margin.left * 3 +
                  vis.xScale(d.gene_start_position)
                },${vis.margin.top * 3 + vis.yScale.bandwidth() / 2.5 + 0.1 * vis.yScale.bandwidth() + vis.yScale(d.phased_chromosome_id)}
                )rotate(-270)`
              })
              // .attr('transform', function (d, i) {
              //   return `translate(${
              //     vis.margin.yAxis + vis.xScale(d.gene_start_position)
              //   },${vis.margin.top * 3 + vis.yScale.bandwidth() / 2 + (i * vis.yScale.bandwidth() + (i + 1) * (0.1 * vis.yScale.bandwidth()))}
              //   )rotate(-270)`
              // })
              .attr('class', 'gene')
              .attr('fill', (d) => vis.colorScale(d.homology_id))
              .attr('opacity', 0.4),

          (update) =>
            update.attr('transform', function (d, i) {
              return `translate(${
                vis.margin.yAxis +
                vis.margin.left * 3 +
                vis.xScale(d.gene_start_position)
              },${vis.margin.top * 3 + vis.yScale.bandwidth() / 2.5 + 0.1 * vis.yScale.bandwidth() + vis.yScale(d.phased_chromosome_id)}
                )rotate(-270)`
            }),
          // .attr('transform', function (d, i) {
          //   return `translate(${
          //     vis.margin.yAxis + vis.xScale(d.gene_start_position)
          //   },${vis.margin.top * 3 + vis.yScale.bandwidth() / 2 + (i * vis.yScale.bandwidth() + (i + 1) * (0.1 * vis.yScale.bandwidth()))}
          //     )rotate(-270)`
          // })
          (exit) => exit.remove()
        )
    },
  },
  mounted() {
    console.log(this.phasedChromosomesLengths)
    console.log(this.getChromosomesFromGenome(2))
    console.log(this.getSequencesWithChromosome(5))
    console.log(this.groupedData, this.dataMax, this.dataMin)
    console.log(this.getPhasedChromosomesForGenome(1))
    console.log(this.genomesLookup[1])

    console.log(this.groupInfo)
    console.log(this.getGenesForGenome(1))
    console.log(this.getGenesForGenome(2))
    console.log(this.getGenesForGenome(3))
    console.log(this.getGenesForGenome(4))
    console.log(this.getGenesForGenome(5))

    this.svgWidth =
      document.getElementById('content').offsetWidth * this.svgWidthScaleFactor

    this.svgHeight =
      document.getElementById('content').offsetHeight *
      this.svgHeightScaleFactor

    this.drawZoomExample()
    this.draw()
  },
}
</script>

<style lang="scss">
@import '@/assets/colors.module.scss';

.cell-chr {
  -webkit-filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
  filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
}

.bar-chr {
  fill: $gray-9;
  transition: r 0.2s ease-in-out;
}

.bar-chr:hover {
  fill: $gray-7;
}

.zoom {
  fill: none;
  stroke-width: 1px;
  stroke: black;
}
</style>
