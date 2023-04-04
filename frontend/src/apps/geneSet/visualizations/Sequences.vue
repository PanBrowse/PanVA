<template>
  <!-- <div><svg id="zoom-example"></svg></div> -->
  <ACard
    :title="`${name}`"
    :style="{
      width: `${containerWidth - 2}px`,
      height: `${
        svgHeight + cardHeaderHeight + padding.cardBody + margin.top
      }px`,
    }"
    :bordered="false"
    size="small"
  >
    <template #extra
      ><AButton type="text" size="small" @click="onDelete(`${name}`)"
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
    name: String,
    sortedDataIndeces: Array,
    data: Array,
    dataMin: Number,
    dataMax: Number,
    nrColumns: Number,
  },
  components: {
    ACard: Card,
    AButton: Button,
    CloseCircleOutlined: CloseCircleOutlined,
  },
  data: () => ({
    svgWidth: 0,
    svgHeight: 0,
    svgWidthScaleFactor: 0.99,
    svgHeightScaleFactor: 0.95,
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
    containerWidth() {
      return Math.floor(this.svgWidth / this.nrColumns)
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
      const stepSize = Math.ceil(stepFactor) * this.nrColumns * 100000
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
      return d3
        .scaleOrdinal()
        .domain([232273529, 232288684])
        .range(d3.schemeSet2)
    },
    dataSequences() {
      return this.data
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
      return d3.select(`#container_${this.name}`)
    },
    onDelete(chromosome) {
      console.log('click delete', chromosome)
    },
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
                `translate(${this.margin.left * 1},${this.margin.top * 2})`
              )
              .attr('class', 'bar-chr')
              .attr('x', this.xScale(0))
              // .attr('y', (d, i) => i * (this.barHeight + 10))
              .attr(
                'y',
                (d, i) => this.sortedDataIndeces[i] * (this.barHeight + 10)
              )
              .attr('width', function (d) {
                return vis.xScale(d.sequence_length)
              })
              .attr('height', this.barHeight),

          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr(
                'y',
                (d, i) => this.sortedDataIndeces[i] * (this.barHeight + 10)
              ),
          (exit) => exit.remove()
        )
    },
    draw() {
      this.drawBars()
      this.addValues()
      this.addLabels()
      this.addXAxis()
    },
    addLabels() {
      this.svg()
        .selectAll('text.label-chr')
        .data(this.data, (d) => d.sequence_id)
        .join(
          (enter) =>
            enter
              .append('text')
              .attr('transform', `translate(0,${this.margin.top * 2})`)
              .attr('class', 'label-chr')
              .attr('font-size', 15)
              .attr('font-family', 'sans-serif')
              .attr('dominant-baseline', 'hanging')
              .attr('x', 0)
              .attr(
                'y',
                (d, i) => this.sortedDataIndeces[i] * (this.barHeight + 10)
              )
              .attr('dy', 2)
              .text((d) => d.sequence_id.split('_')[0]),

          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr(
                'y',
                (d, i) => this.sortedDataIndeces[i] * (this.barHeight + 10)
              ),
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
              .attr('font-size', 12)
              .attr('font-family', 'sans-serif')
              .attr('dominant-baseline', 'hanging')
              .attr('x', 0)
              .attr('dx', 2)
              .attr(
                'y',
                (d, i) => this.sortedDataIndeces[i] * (this.barHeight + 10)
              )
              .attr('dy', this.barHeight / 4)
              .text((d) => Math.floor(d.sequence_length).toLocaleString()),

          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr(
                'y',
                (d, i) => this.sortedDataIndeces[i] * (this.barHeight + 10)
              ),
          (exit) => exit.remove()
        )
    },
    addXAxis() {
      this.svg()
        .append('g')
        .attr('class', 'x-axis')
        .attr(
          'transform',
          'translate(' + this.margin.left * 1 + ',' + this.margin.top * 2 + ')'
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

      this.svg()
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
          (exit) => exit.remove()
        )
    },
  },
  mounted() {
    // console.log('this.name', this.name, this.data)
    // let vis = this
    this.svgWidth =
      document.getElementById('content').offsetWidth * this.svgWidthScaleFactor

    this.svgHeight =
      this.sortedDataIndeces.length * (this.barHeight + 10) +
      this.margin.top * 2

    //   document.getElementById('content').offsetHeight * this.svgWidthScaleFactor

    console.log(
      this.svgWidth,
      this.nrColumns,
      this.visWidth,
      this.containerWidth
    )
    // console.log(this.xScale.domain(), this.xScale.range())
    this.draw()
  },
  watch: {},
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

.value-chr {
  fill: #c0c0c0;
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
