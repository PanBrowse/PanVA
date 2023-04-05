<template>
  <div>
    <button @click="sortSequences()">sort by sequence_id</button>
  </div>
  <div
    id="content"
    style="
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: space-between;
    "
  >
    <!-- <div v-for="chr in chromosomes">
      {{ chr }}
    </div> -->
    <Sequences
      v-for="chr in chromosomes"
      v-bind:key="chr"
      :name="`chr${chr}`"
      :sortedDataIndeces="sortedSequenceIds(chr)"
      :data="getChromosome(chr)"
      :dataMin="dataMin"
      :dataMax="dataMax"
      :nrColumns="numberOfCols"
    />
    <!-- <Sequences
      :name="`chr${1}`"
      :sortedDataIndeces="sortedSequenceIds(1)"
      :data="getChromosome(1)"
      :dataMin="dataMin"
      :dataMax="dataMax"
      :nrColumns="numberOfCols"
    />
    <Sequences
      :name="`chr${5}`"
      :sortedDataIndeces="sortedSequenceIds(5)"
      :data="getChromosome(5)"
      :dataMin="dataMin"
      :dataMax="dataMax"
      :nrColumns="numberOfCols"
    /> -->
  </div>
</template>

<script lang="ts">
import * as d3 from 'd3'
import { mapActions, mapState } from 'pinia'

import {
  chromosomesLookup,
  sortedChromosomesIdsLookup,
} from '@/helpers/chromosome'
import { useGeneSetStore } from '@/stores/geneSet'
import { useGlobalStore } from '@/stores/global'
import type { SequenceMetrics } from '@/types'

import Sequences from './Sequences.vue'

export default {
  components: {
    Sequences,
  },
  data: () => ({
    chromosomes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    // chromosomes: [1, 2, 3, 4],
    svgWidth: 0,
    svgHeight: 0,
    svgWidthScaleFactor: 0.95,
    svgHeightScaleFactor: 0.95,
    margin: { top: 10, bottom: 10, right: 10, left: 10, yAxis: 40 },
    transitionTime: 750,
    // numberOfCols: 12,
    // sortedSequenceIds: [],
  }),
  computed: {
    ...mapState(useGeneSetStore, [
      'sequences',
      'groupInfo',
      'chromosomeLookup',
      'sortedChromosomeIdsLookup',
    ]),

    dataMax() {
      return d3.max(this.sequences, (d) => d.sequence_length)
    },
    dataMin() {
      return d3.min(this.sequences, (d) => d.sequence_length)
    },
    colorScale() {
      return d3
        .scaleOrdinal()
        .domain([232273529, 232288684])
        .range(d3.schemeSet2)
    },
    numberOfCols() {
      return this.chromosomes.length
    },
  },
  methods: {
    ...mapActions(useGeneSetStore, ['getChromosome', 'getSortedChromosomeIds']),
    sortedSequenceIds(chr) {
      return [...Array(this.getChromosome(chr).length).keys()]
    },
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
    sortGenomes(order) {
      this.genomesLookup = order
      console.log('hello from click', this.genomesLookup)
      this.draw()
    },
    sortSequences() {
      // this.sortedSequenceIds = this.sortedSequenceIds.reverse()
      // this.draw()
      console.log('hello')
    },
  },
  created() {},
  mounted() {
    this.svgWidth =
      document.getElementById('content').offsetWidth * this.svgWidthScaleFactor

    this.svgHeight =
      document.getElementById('content').offsetHeight *
      this.svgHeightScaleFactor

    console.log(
      'chromosomeLookup',
      this.chromosomeLookup,
      this.sortedChromosomeIdsLookup
    )

    console.log(
      // 'chromosomesLookup helper',
      // chromosomesLookup(this.sequences),
      sortedChromosomesIdsLookup(chromosomesLookup(this.sequences))
    )

    // console.log('chromosomeLookup', this.chromosomeLookup, [
    //   ...Array(this.chromosomeLookup[1].length).keys(),
    // ])

    // const lookup = {}

    // Object.keys(this.chromosomeLookup).forEach((key) => {
    //   console.log(key, this.chromosomeLookup[key], [
    //     ...Array(this.chromosomeLookup[key].length).keys(),
    //   ])

    //   const ids = lookup[key] || [
    //     ...Array(this.chromosomeLookup[key].length).keys(),
    //   ]
    //   lookup[key] = ids
    // })
    // console.log('lookup ids', lookup)
  },
}
</script>

<style lang="scss">
@import '@/assets/colors.module.scss';

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
