<template>
  <div
    id="content"
    style="
      width: 100%;
      height: 50%;
      display: flex;
      justify-content: space-between;
    "
  >
    <SequencesDetails
      v-bind:key="`chr${chrFocus}_focus`"
      :chromosomeNr="chrFocus"
      :name="`chr${chrFocus}_focus`"
      :data="getChromosome(chrFocus)"
      :dataGenes="getGroupInfo(chrFocus)"
      :dataMin="dataMin"
      :dataMax="dataMax"
      :maxGC="GCcontentMax"
      :minGC="GCcontentMin"
    />
  </div>
</template>

<script lang="ts">
import * as d3 from 'd3'
import { mapActions, mapState } from 'pinia'

import { useGeneSetStore } from '@/stores/geneSet'
import { useGlobalStore } from '@/stores/global'
import type { SequenceMetrics } from '@/types'

import SequencesDetails from './SequencesDetails.vue'

export default {
  components: {
    SequencesDetails,
  },
  data: () => ({
    // chromosomes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    // chromosomes: [5],
    svgWidth: 0,
    svgHeight: 0,
    svgWidthScaleFactor: 1,
    svgHeightScaleFactor: 1,
    margin: { top: 10, bottom: 10, right: 10, left: 10, yAxis: 40 },
    transitionTime: 750,
    // numberOfCols: 12,
    // sortedSequenceIds: [],
  }),
  computed: {
    ...mapState(useGeneSetStore, [
      'sequences',
      'groupInfo',
      'chromosomes',
      'numberOfChromosomes',
      'chrFocus',
      'chromosomeLookup',
      'groupInfoLookup',
      'sortedGroupInfoLookup',
      'sequenceIdLookup',
    ]),

    dataMax() {
      return d3.max(this.sequences, (d) => d.sequence_length)
    },
    dataMin() {
      return d3.min(this.sequences, (d) => d.sequence_length)
    },
    GCfiltered() {
      const CGcontentArray = this.sequences.map((d) => d.GC_content_percent)
      return this.filterOutliers(CGcontentArray)
    },
    GCcontentMax() {
      return d3.max(this.GCfiltered, (d) => d)
    },
    GCcontentMin() {
      return d3.min(this.GCfiltered, (d) => d)
    },
    colorScale() {
      return d3
        .scaleOrdinal()
        .domain([232273529, 232288684])
        .range(d3.schemeSet2)
    },
    numberOfChr() {
      return this.chromosomes.length
    },
  },
  methods: {
    ...mapActions(useGeneSetStore, [
      'getChromosome',
      'getGroupInfo',
      'changeSorting',
    ]),
    sortedSequenceIds(chr) {
      return [...Array(this.getChromosome(chr).length).keys()]
    },
    filterOutliers(someArray) {
      if (someArray.length < 4) return someArray

      let values, q1, q3, iqr, maxValue, minValue

      values = someArray.slice().sort((a, b) => a - b) //copy array fast and sort

      if ((values.length / 4) % 1 === 0) {
        //find quartiles
        q1 =
          (1 / 2) * (values[values.length / 4] + values[values.length / 4 + 1])
        q3 =
          (1 / 2) *
          (values[values.length * (3 / 4)] +
            values[values.length * (3 / 4) + 1])
      } else {
        q1 = values[Math.floor(values.length / 4 + 1)]
        q3 = values[Math.ceil(values.length * (3 / 4) + 1)]
      }

      iqr = q3 - q1
      maxValue = q3 + iqr * 1.5
      minValue = q1 - iqr * 1.5

      return values.filter((x) => x >= minValue && x <= maxValue)
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
  },
  created() {},
  mounted() {
    this.svgWidth =
      document.getElementById('content').offsetWidth * this.svgWidthScaleFactor

    this.svgHeight =
      document.getElementById('content').offsetHeight *
      this.svgHeightScaleFactor
  },
  watch: {
    svgWidth() {
      console.log('svg width change', this.svgWidth)
    },
  },
}
</script>

<style lang="scss">
@import '@/assets/colors.module.scss';

// .bar-chr {
//   fill: $gray-9;
//   transition: r 0.2s ease-in-out;
// }

// .bar-chr:hover {
//   fill: $gray-7;
// }

.zoom {
  fill: none;
  stroke-width: 1px;
  stroke: black;
}
</style>
