<template>
  <!-- <div><svg id="zoom-example"></svg></div> -->
  <ACard
    :title="`${name}`"
    :style="{
      width: `${containerWidth - 6}px`,
      //   height: `${
      //     svgHeight + cardHeaderHeight + padding.cardBody + margin.top
      //   }px`,
      height: `${100}%`,
    }"
    :bordered="false"
    size="small"
  >
    <template #extra
      ><AButton type="text" size="small" @click="deleteChromosome(`${name}`)"
        ><CloseCircleOutlined key="edit" /></AButton
    ></template>
    <svg
      :id="`container_${name}`"
      :width="containerWidth"
      :height="svgHeight"
    ></svg>
  </ACard>
</template>

<script lang="ts">
import { CloseCircleOutlined } from '@ant-design/icons-vue'
import { Button, Card } from 'ant-design-vue'
import * as d3 from 'd3'
import { range } from 'lodash'
import { mapActions, mapState } from 'pinia'

import { useGeneSetStore } from '@/stores/geneSet'
import { useGlobalStore } from '@/stores/global'
import type { SequenceMetrics } from '@/types'

export default {
  name: 'Sequences',
  props: {
    chromosomeNr: Number,
    name: String,
    data: Array,
    dataGenes: Array,
    dataMin: Number,
    dataMax: Number,
    nrColumns: Number,
    maxGC: Number,
    minGC: Number,
  },
  components: {
    ACard: Card,
    AButton: Button,
    CloseCircleOutlined: CloseCircleOutlined,
  },
  data: () => ({
    svgWidth: 0,
    svgHeight: 0,
    svgWidthScaleFactor: 1,
    svgHeightScaleFactor: 0.95,
    // resizeObserver: null as ResizeObserver | null,
    margin: {
      top: 10,
      bottom: 10,
      right: 10,
      left: 10,
      yAxis: 40,
    },
    padding: {
      cardBody: 12,
    },
    cardHeaderHeight: 40,
    transitionTime: 750,
    numberOfCols: 2,
    barHeight: 15,
    sortedSequenceIds: [],
  }),
  computed: {
    ...mapState(useGeneSetStore, [
      'sortedChromosomeSequenceIndices',
      'sortedGroupInfoLookup',
      'groupInfoLookup',
      'sequenceIdLookup',
      'sortedMrnaIndices',
      'chromosomes',
      'numberOfChromosomes',
    ]),
    containerWidth() {
      return Math.floor(this.svgWidth / this.numberOfChromosomes)
    },
    visWidth() {
      return this.containerWidth - 12 - 12 - 10 - 17.5
    },
    visHeight() {
      return this.svgHeight
    },
    xScale() {
      return d3
        .scaleLinear()
        .domain([this.dataMin > 0 ? 0 : this.dataMin, this.dataMax])
        .rangeRound([
          0,
          this.visWidth - this.margin.yAxis + this.margin.left * 4,
        ])
    },
    ticksXdomain() {
      const stepFactor = this.dataMax / 1000000
      const stepSize = Math.ceil(stepFactor) * this.numberOfChromosomes * 100000
      const ticks = range(stepSize, this.dataMax, stepSize).concat([
        this.dataMax,
      ])
      ticks.unshift(0)

      // If the last "rounded" tick and the "geneLength" tick are too close together.
      const [beforeLast, last] = ticks.slice(-2)
      if (last - beforeLast < stepSize * 0.5) {
        // Remove the last "rounded" tick and keep the "geneLength" tick.
        ticks.splice(-2, 1)
      }

      return ticks
    },
    colorScale() {
      return (
        d3
          .scaleOrdinal()
          // .domain([
          //   [
          //     232273544, 232274322, 232273685, 232256926, 232274335, 232290464,
          //     232256927, 232273967, 232289205, 232273851, 232273853, 232291136,
          //     232273731, 232290249, 232273868, 232289749, 232273892, 232289646,
          //     232292464, 232273529,
          //   ],
          // ])
          .domain([
            232290464, 232273731, 232273544, 232290249, 232273868, 232273967,
            232292464, 232273685, 232273529, 232274335,
          ])
          // .domain([232273529, 232288684])
          // https://sashamaps.net/docs/resources/20-colors/
          // https://github.com/d3/d3-3.x-api-reference/blob/master/Ordinal-Scales.md
          // .range([
          //   '#ff7f0e',
          //   '#1f77b4',
          //   '#9467bd',
          //   '#2ca02c',
          //   '#8c564b',
          //   '#d62728',
          //   '#e377c2',
          //   '#bcbd22',
          //   '#17becf',
          //   '#7f7f7f',
          //   '#ffbb78',
          //   '#98df8a',
          //   '#ff9896',
          //   '#c5b0d5',
          //   '#c49c94',
          //   '#f7b6d2',
          //   '#c7c7c7',
          //   '#dbdb8d',
          //   '#9edae5',
          // ])
          .range(d3.schemeSet3)
        // http://vrl.cs.brown.edu/color
        // .range([
        //   '#41bbc5',
        //   '#bf3854',
        //   '#6bdd8c',
        //   '#e84fe1',
        //   '#09f54c',
        //   '#7c338b',
        //   '#b1e632',
        //   '#4533d6',
        //   '#f4d403',
        //   '#22577a',
        //   '#a8c280',
        //   '#a17bf2',
        //   '#638123',
        //   '#fcc2fb',
        //   '#1c9820',
        //   '#ff0087',
        //   '#a3c9fe',
        //   '#713529',
        //   '#fba55c',
        //   '#ee0d0e',
        // ])
      )
      // .range(d3.schemeCategory10)
    },
    colorScaleGC() {
      return d3
        .scaleSequential()
        .domain([this.minGC, this.maxGC])
        .interpolator(d3.interpolateGreys)
    },
  },
  methods: {
    ...mapActions(useGeneSetStore, ['deleteChromosome']),
    // onResize() {
    //   // Card width minus the padding.
    //   this.svgWidth = this.$el.offsetWidth - 24
    //   this.draw()
    // },
    observeWidth() {
      let vis = this
      const resizeObserver = new ResizeObserver(function () {
        vis.svgWidth =
          document.getElementById('content').offsetWidth *
          vis.svgWidthScaleFactor
      })
      resizeObserver.observe(document.getElementById('content'))
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
    svg() {
      return d3.select(`#container_${this.name}`)
    },
    // onDelete(chromosome) {
    //   console.log('click delete', chromosome)

    // },
    sortGenomes(order) {
      this.genomesLookup = order
      console.log('hello from click', this.genomesLookup)
      this.draw()
    },
    sortSequences() {
      this.sortedDataIndeces = this.sortedDataIndeces.reverse()
      this.draw()
    },
    drawBars() {
      let vis = this

      this.svg()
        .selectAll('rect.bar-chr')
        // .data(this.getChromosome(5), (d) => d.sequence_id)
        .data(this.data, (d) => d.sequence_id)
        .join(
          (enter) =>
            enter
              .append('rect')
              .attr(
                'transform',
                `translate(${this.margin.left * 3},${this.margin.top * 2})`
              )
              .attr('class', 'bar-chr')
              .attr('x', this.xScale(0))
              // .attr('y', (d, i) => i * (this.barHeight + 10))
              .attr(
                'y',
                (d, i) =>
                  this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] *
                  (this.barHeight + 10)
              )
              .attr('width', function (d) {
                return vis.xScale(d.sequence_length)
              })
              .attr('height', this.barHeight)
              .attr('fill', '#f0f2f5'),
          // .attr('fill', (d) => vis.colorScaleGC(d.GC_content_percent)),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr(
                'y',
                (d, i) =>
                  this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] *
                  (this.barHeight + 10)
              )
              .attr('width', function (d) {
                return vis.xScale(d.sequence_length)
              }),
          (exit) => exit.remove()
        )
    },
    drawContextBars() {
      let vis = this

      this.svg()
        .selectAll('rect.bar-chr-context')
        // .data(this.getChromosome(5), (d) => d.sequence_id)
        .data(this.data, (d) => d.sequence_id)
        .join(
          (enter) =>
            enter
              .append('rect')
              .attr(
                'transform',
                `translate(${this.margin.left * 3},${this.margin.top * 2})`
              )
              .attr('class', 'bar-chr-context')
              .attr('x', this.xScale(0))
              // .attr('y', (d, i) => i * (this.barHeight + 10))
              .attr(
                'y',
                (d, i) =>
                  this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] *
                  (this.barHeight + 10)
              )
              .attr('width', function (d) {
                return vis.xScale(d.sequence_length)
              })
              .attr('height', this.barHeight / 4)
              // .attr('fill', '#f0f2f5'),
              .attr('fill', (d) => vis.colorScaleGC(d.GC_content_percent)),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr(
                'y',
                (d, i) =>
                  this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] *
                  (this.barHeight + 10)
              )
              .attr('width', function (d) {
                return vis.xScale(d.sequence_length)
              }),
          (exit) => exit.remove()
        )
    },
    draw() {
      if (this.chromosomeNr !== 'unphased') {
        this.drawBars()
        this.drawContextBars()
        //   this.addValues()
        this.addLabels()
        this.drawGenes()
      }
    },
    addLabels() {
      let vis = this
      this.svg()
        .selectAll('text.label-chr')
        .data(this.data, (d) => d.sequence_id)
        .join(
          (enter) =>
            enter
              .append('text')
              .attr('transform', `translate(0,${this.margin.top * 2})`)
              .attr('class', 'label-chr')
              .attr('dominant-baseline', 'hanging')
              .attr('x', 0)
              .attr(
                'y',
                (d, i) =>
                  this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] *
                  (this.barHeight + 10)
              )

              .attr('dy', this.barHeight / 3)
              // .text((d) => d.sequence_id.split('_')[0]),
              .text((d) => d.sequence_id),

          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              // .attr(
              //   'y',
              //   (d, i) =>
              //     this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] *
              //     (this.barHeight + 10)
              // ),
              .attr('y', function (d, i) {
                console.log(
                  'd',
                  d.sequence_id,
                  'i',
                  i,
                  vis.sortedChromosomeSequenceIndices[vis.chromosomeNr][i]
                )
                return (
                  vis.sortedChromosomeSequenceIndices[vis.chromosomeNr][i] *
                  (vis.barHeight + 10)
                )
              }),
          (exit) => exit.remove()
        )
    },
    addValues() {
      this.svg()
        .selectAll('text.value-chr')
        .data(this.data, (d) => d.sequence_id)
        .join(
          (enter) =>
            enter
              .append('text')
              .attr(
                'transform',
                `translate(${this.margin.left * 1},${this.margin.top * 2})`
              )
              .attr('class', 'value-chr')
              .attr('dominant-baseline', 'hanging')
              .attr('x', 0)
              .attr('dx', 2)
              .attr(
                'y',
                (d, i) =>
                  this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] *
                  (this.barHeight + 10)
              )
              .attr('dy', this.barHeight / 4)
              .text((d) => Math.floor(d.sequence_length).toLocaleString()),

          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr(
                'y',
                (d, i) =>
                  this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] *
                  (this.barHeight + 10)
              ),
          (exit) => exit.remove()
        )
    },
    drawXAxis() {
      this.svg().select('g.x-axis').remove() //needed because otherwise draws twice in some cases. To-do: fix side effect

      this.svg()
        .append('g')
        .attr('class', 'x-axis')
        .attr(
          'transform',
          'translate(' + this.margin.left * 3 + ',' + this.margin.top * 2 + ')'
        )
        .call(
          d3
            .axisTop(this.xScale)
            .tickValues(this.ticksXdomain)
            .tickFormat(d3.format('~s'))
        )
        .call((g) => g.select('.domain').remove())
        .call((g) => g.selectAll('line').attr('stroke', '#c0c0c0'))
        .call((g) => g.selectAll('text').attr('fill', '#c0c0c0'))
    },

    drawGenes() {
      let vis = this

      //   console.log('sortedMrnaIndices', vis.sortedMrnaIndices)

      if (this.dataGenes !== undefined) {
        this.svg()
          .selectAll('path.gene')
          .data(this.dataGenes, (d) => d.mRNA_id)
          .join(
            (enter) =>
              enter
                .append('path')
                .attr(
                  'd',
                  d3
                    .symbol()
                    .type(d3.symbolTriangle)
                    .size(this.barHeight * 4)
                )
                .attr('transform', function (d, i) {
                  const key = `${d.genome_number}_${d.sequence_number}`

                  return `translate(${
                    vis.margin.left * 3 + vis.xScale(d.gene_start_position)
                  },${vis.margin.top * 2 + vis.barHeight / 2 + vis.sortedMrnaIndices[vis.chromosomeNr][i] * (vis.barHeight + 10)}
                    )rotate(-270)`
                })
                .attr('class', 'gene')
                .attr('z-index', 100)
                .attr('fill', (d) => vis.colorScale(d.homology_id))
                .attr('opacity', 0.8),

            (update) =>
              update
                .transition()
                .duration(this.transitionTime)
                .attr('transform', function (d, i) {
                  const key = `${d.genome_number}_${d.sequence_number}`

                  return `translate(${
                    vis.margin.left * 3 + vis.xScale(d.gene_start_position)
                  },${vis.margin.top * 2 + vis.barHeight / 2 + vis.sortedMrnaIndices[vis.chromosomeNr][i] * (vis.barHeight + 10)}
                    )rotate(-270)`
                }),
            (exit) => exit.remove()
          )
      }
    },
  },
  mounted() {
    this.svgWidth =
      document.getElementById('content').offsetWidth * this.svgWidthScaleFactor

    if (this.chromosomeNr == 'unphased') {
      this.sortedChromosomeSequenceIndices[12].length * (this.barHeight + 10) +
        this.margin.top * 2
    } else {
      this.svgHeight =
        this.sortedChromosomeSequenceIndices[this.chromosomeNr].length *
          (this.barHeight + 10) +
        this.margin.top * 2
    }

    this.drawXAxis() // draw axis once
    this.draw()

    this.observeWidth()

    console.log('GC', this.minGC, this.maxGC)

    // this.resizeObserver = new ResizeObserver(this.onResize)
    // this.resizeObserver.observe(this.$el)
  },
  // unmounted() {
  //   this.resizeObserver?.disconnect()
  // },
  watch: {
    sortedChromosomeSequenceIndices() {
      this.draw()
    },
    numberOfChromosomes() {
      this.svg().select('g.x-axis').remove()
      this.drawXAxis() // redraw
      this.draw()
    },
    svgWidth() {
      this.svg().select('g.x-axis').remove()
      this.drawXAxis() // redraw
      this.draw()
    },
  },
}
</script>

<style lang="scss">
@import '@/assets/colors.module.scss';

.cell-chr {
  -webkit-filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
  filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
}

// .bar-chr {
//   fill: $gray-9;
//   transition: r 0.2s ease-in-out;
// }
// .bar-chr:hover {
//   fill: $gray-7;
// }

.value-chr {
  fill: #c0c0c0;
  font-size: 8;
  font-family: sans-serif;
}

.zoom {
  fill: none;
  stroke-width: 1px;
  stroke: black;
}

.label-chr {
  fill: #c0c0c0;
  font-size: 12;
  font-family: sans-serif;
}
</style>
