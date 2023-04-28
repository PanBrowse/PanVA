<template>
  <!-- <div><svg id="zoom-example"></svg></div> -->
  <ACard
    :title="`${name}`"
    :style="{
      width: `${containerWidth - 6}px`,
      // height: `${
      //   svgHeight + cardHeaderHeight + padding.cardBody + margin.top
      // }px`,
      height: `${100}%`,
      border: `1px solid ${selectedColor}`,
    }"
    :bordered="true"
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

import { groupInfoDensity } from '@/helpers/chromosome'
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
    barHeight: 20,
    sortedSequenceIds: [],
    idleTimeout: null,
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
      'homologyGroups',
      'overviewArrows',
      'chrFocus',
      'showNotificationsOverview',
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
    selectedColor() {
      return this.chrFocus == parseInt(this.name.substring(3))
        ? '#91d5ff'
        : '#FFF'
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
      return d3
        .scaleOrdinal()
        .domain(this.homologyGroups)
        .range(d3.schemeCategory10)
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
    addClipPath() {
      this.svg().select('defs').remove() //needed because otherwise draws twice in some cases. To-do: fix side effect

      this.svg()
        .append('defs')
        .append('svg:clipPath')
        .attr('id', 'clipOverview')
        .append('svg:rect')
        .attr('width', this.visWidth)
        .attr(
          'height',
          this.svgHeight +
            this.cardHeaderHeight +
            this.padding.cardBody +
            this.margin.top
        )
        .attr('x', 0)
        .attr('y', 0)
    },
    updateChart({ selection }) {
      console.log('brush selection', selection)

      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if (!selection) {
        if (!this.idleTimeout)
          return (this.idleTimeout = setTimeout(this.idled, 350)) // This allows to wait a little bit
        this.xScale.domain([this.dataMin > 0 ? 0 : this.dataMin, this.dataMax])
      } else {
        // x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])

        console.log(
          'range',

          this.xScale.invert(selection[0]),
          this.xScale.invert(selection[1])
        )
        this.xScale.domain([
          this.xScale.invert(selection[0]),
          this.xScale.invert(selection[1]),
        ])

        this.svg().select('.brush').call(this.brush.move, null) // This remove the grey brush area as soon as the selection has been done
        console.log('there is a selection')

        this.svg()
          .select('.x-axis')
          .transition()
          .duration(1000)
          .call(
            d3
              .axisTop(this.xScale)

              // .tickValues(this.ticksXdomain)
              .tickFormat(d3.format('~s'))
          )
          .call((g) => g.select('.domain').remove())
          .call((g) => g.selectAll('line').attr('stroke', '#c0c0c0'))
          .call((g) => g.selectAll('text').attr('fill', '#c0c0c0'))
        this.draw()
      }
    },
    resetZoom() {
      let vis = this
      this.svg().on('dblclick', function () {
        vis.xScale.domain([vis.dataMin > 0 ? 0 : vis.dataMin, vis.dataMax])

        vis
          .svg()
          .select('.x-axis')
          .transition()
          .duration(1000)
          .call(
            d3
              .axisTop(vis.xScale)
              .tickValues(vis.ticksXdomain)
              .tickFormat(d3.format('~s'))
          )
          .call((g) => g.select('.domain').remove())
          .call((g) => g.selectAll('line').attr('stroke', '#c0c0c0'))
          .call((g) => g.selectAll('text').attr('fill', '#c0c0c0'))
        vis.draw()
      })
    },

    idled() {
      this.idleTimeout = null
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
              .attr('fill', '#f0f2f5')
              // .attr('fill', '#fff')
              .attr('clip-path', 'url(#clipOverview)'),
          // .attr('fill', (d) => vis.colorScaleGC(d.GC_content_percent)),
          (update) =>
            update
              .attr('clip-path', 'url(#clipOverview)')
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
              .attr('fill', (d) => vis.colorScaleGC(d.GC_content_percent))
              .attr('clip-path', 'url(#clipOverview)'),
          (update) =>
            update
              .attr('clip-path', 'url(#clipOverview)')
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

        this.showNotificationsOverview
          ? this.drawNotifications()
          : this.hideNotifications()
      }
    },
    hideNotifications() {
      this.svg().selectAll('circle.density').remove()
      this.svg().selectAll('text.density-value').remove()
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
              .attr('transform', `translate(20,${this.margin.top * 2})`)
              .attr('class', 'label-chr')
              .attr('dominant-baseline', 'hanging')
              .attr('text-anchor', 'end')
              .attr('font-size', 10)
              .attr('x', 5)
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
                return (
                  vis.sortedChromosomeSequenceIndices[vis.chromosomeNr][i] *
                  (vis.barHeight + 10)
                )
              }),
          (exit) => exit.remove()
        )
      //   this.svg()
      //     .selectAll('path.genome')
      //     .data(this.data, (d) => d.sequence_id)
      //     .join(
      //       (enter) =>
      //         enter
      //           .append('path')
      //           .attr(
      //             'd',
      //             d3
      //               .symbol()
      //               .size(this.barHeight * 3)
      //               .type(function (d) {
      //                 console.log('d shape', d.genome_number)
      //                 if (d.genome_number === 1) {
      //                   return d3.symbolsFill[0]
      //                 }
      //                 if (d.genome_number === 2) {
      //                   return d3.symbolsFill[1]
      //                 }
      //                 if (d.genome_number === 3) {
      //                   return d3.symbolsFill[2]
      //                 }
      //                 if (d.genome_number === 4) {
      //                   return d3.symbolsFill[3]
      //                 }
      //                 if (d.genome_number === 5) {
      //                   return d3.symbolsFill[4]
      //                 } else {
      //                   return d3.symbolsFill[5]
      //                 }
      //               })
      //           )

      //           .attr('transform', function (d, i) {
      //             return `translate(${
      //               vis.margin.left
      //             },${vis.margin.top + vis.barHeight + vis.sortedChromosomeSequenceIndices[vis.chromosomeNr][i] * (vis.barHeight + 10)}
      //                 )`
      //           })
      //           .attr('class', 'genome')
      //           .attr('z-index', 100),
      //       // .attr('fill', '#c0c0c0'),
      //       // .attr('fill', (d) => vis.colorScale(d.homology_id)),
      //       // .attr('opacity', 0.8),

      //       (update) =>
      //         update
      //           .transition()
      //           .duration(this.transitionTime)
      //           .attr('transform', function (d, i) {
      //             return `translate(${
      //               vis.margin.left
      //             },${vis.margin.top + vis.barHeight + vis.sortedChromosomeSequenceIndices[vis.chromosomeNr][i] * (vis.barHeight + 10)}
      //                 )`
      //           }),
      //       (exit) => exit.remove()
      //     )
      // },
      // addValues() {
      //   this.svg()
      //     .selectAll('text.value-chr')
      //     .data(this.data, (d) => d.sequence_id)
      //     .join(
      //       (enter) =>
      //         enter
      //           .append('text')
      //           .attr(
      //             'transform',
      //             `translate(${this.margin.left * 1},${this.margin.top * 2})`
      //           )
      //           .attr('class', 'value-chr')
      //           .attr('dominant-baseline', 'hanging')
      //           .attr('x', 0)
      //           .attr('dx', 2)
      //           .attr(
      //             'y',
      //             (d, i) =>
      //               this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] *
      //               (this.barHeight + 10)
      //           )
      //           .attr('dy', this.barHeight / 4)
      //           .text((d) => Math.floor(d.sequence_length).toLocaleString()),

      //       (update) =>
      //         update
      //           .transition()
      //           .duration(this.transitionTime)
      //           .attr(
      //             'y',
      //             (d, i) =>
      //               this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] *
      //               (this.barHeight + 10)
      //           ),
      //       (exit) => exit.remove()
      //     )
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

      if (!this.overviewArrows) {
        if (this.dataGenes !== undefined) {
          this.svg()
            .selectAll('rect.gene')
            .data(this.dataGenes, (d) => d.mRNA_id)
            .join(
              (enter) =>
                enter
                  // .append('path')
                  .append('rect')
                  .attr(
                    'transform',
                    `translate(${this.margin.left * 3},${this.margin.top * 2})`
                  )
                  .attr('class', 'gene')
                  .attr('x', (d) => this.xScale(d.gene_start_position))
                  // .attr('y', (d, i) => i * (this.barHeight + 10))
                  .attr(
                    'y',
                    (d, i) =>
                      vis.sortedMrnaIndices[vis.chromosomeNr][i] *
                      (this.barHeight + 10)
                  )
                  .attr('width', 3.5)
                  .attr('height', this.barHeight)
                  .attr('z-index', 100)
                  .attr('fill', (d) => vis.colorScale(d.homology_id))
                  .attr('opacity', 0.8),

              (update) =>
                update
                  .transition()
                  .duration(this.transitionTime)
                  // .attr('x', vis.xScale(d.gene_start_position))
                  // .attr('y', (d, i) => i * (this.barHeight + 10))
                  .attr('x', (d) => vis.xScale(d.gene_start_position))
                  .attr(
                    'y',
                    (d, i) =>
                      vis.sortedMrnaIndices[vis.chromosomeNr][i] *
                      (this.barHeight + 10)
                  ),

              (exit) => exit.remove()
            )
        }
      } else {
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
                    let rotation

                    if (d.strand === '+') {
                      rotation = `translate(${
                        vis.margin.left * 3 + vis.xScale(d.gene_start_position)
                      },${
                        vis.margin.top * 2 +
                        vis.barHeight / 2 +
                        vis.sortedMrnaIndices[vis.chromosomeNr][i] *
                          (vis.barHeight + 10)
                      }
      )rotate(-270)`
                    } else {
                      return `translate(${
                        vis.margin.left * 3 + vis.xScale(d.gene_start_position)
                      },${
                        vis.margin.top * 2 +
                        vis.barHeight / 2 +
                        vis.sortedMrnaIndices[vis.chromosomeNr][i] *
                          (vis.barHeight + 10)
                      }
      )rotate(-450)`
                    }

                    return rotation
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

                    let rotation

                    if (d.strand === '+') {
                      rotation = `translate(${
                        vis.margin.left * 3 + vis.xScale(d.gene_start_position)
                      },${
                        vis.margin.top * 2 +
                        vis.barHeight / 2 +
                        vis.sortedMrnaIndices[vis.chromosomeNr][i] *
                          (vis.barHeight + 10)
                      }
                        )rotate(-270)`
                    } else {
                      return `translate(${
                        vis.margin.left * 3 + vis.xScale(d.gene_start_position)
                      },${
                        vis.margin.top * 2 +
                        vis.barHeight / 2 +
                        vis.sortedMrnaIndices[vis.chromosomeNr][i] *
                          (vis.barHeight + 10)
                      }
                        )rotate(-450)`
                    }

                    return rotation
                  }),
              (exit) => exit.remove()
            )
        }
      }
    },
    drawNotifications() {
      let vis = this

      if (this.dataGenes !== undefined) {
        const densityObjects = groupInfoDensity(this.dataGenes)

        const dataDensity = {}
        Object.keys(densityObjects).forEach((key) => {
          dataDensity[key] = densityObjects[key].map(
            (item) => item.gene_start_position
          )
        })
        console.log('densityData', dataDensity)

        const thresholds = this.xScale.ticks(20)
        console.log('thresholds', thresholds)

        let allBins = []
        Object.keys(dataDensity).forEach((key) => {
          const bins = d3
            .bin()
            .domain(vis.xScale.domain())
            .thresholds(thresholds)(dataDensity[key])

          //first filter bins
          const binsFiltered = bins.filter((bin) => bin.length > 1)
          const binsFilteredwithSeq = binsFiltered.map((bin) => ({
            ...bin,
            sequence_id: key,
          }))

          // allBins.push(binsFilteredwithSeq)
          allBins = allBins.concat(binsFilteredwithSeq)
        })
        console.log('allBins', allBins)

        this.svg()
          .selectAll('circle.density')
          .data(allBins, (d) => d.sequence_id)
          .join(
            (enter) =>
              enter
                .append('circle')
                .attr(
                  'transform',
                  `translate(${this.margin.left * 3},${
                    this.margin.top * 2 + vis.barHeight
                  })`
                )

                .attr('class', 'density')
                .attr(
                  'cx',
                  (d) =>
                    this.xScale(d.x0) +
                    1 +
                    (this.xScale(d.x1) - this.xScale(d.x0) - 1) / 2
                )
                .attr('cy', (d, i) => {
                  return (
                    (this.sequenceIdLookup[this.chromosomeNr][d.sequence_id] -
                      1) *
                      (this.barHeight + 10) +
                    10

                    // return (
                    //   (this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] -
                    //     1) *
                    //   (this.barHeight + 10)
                  )
                })
                .attr('r', 7),
            (update) =>
              update
                .transition()
                .duration(this.transitionTime)
                .attr(
                  'cx',
                  (d) =>
                    this.xScale(d.x0) +
                    1 +
                    (this.xScale(d.x1) - this.xScale(d.x0) - 1) / 2
                )
                .attr('cy', (d, i) => {
                  return (
                    (this.sequenceIdLookup[this.chromosomeNr][d.sequence_id] -
                      1) *
                      (this.barHeight + 10) +
                    10

                    // return (
                    //   (this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] -
                    //     1) *
                    //   (this.barHeight + 10)
                  )
                }),

            (exit) => exit.remove()
          )

        this.svg()
          .selectAll('text.density-value')
          .data(allBins, (d) => d.sequence_id)
          .join(
            (enter) =>
              enter
                .append('text')
                .attr(
                  'transform',
                  `translate(${this.margin.left * 3},${
                    this.margin.top * 2 + this.barHeight
                  })`
                )
                .attr('class', 'density-value')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'hanging')
                .attr(
                  'x',
                  (d) =>
                    this.xScale(d.x0) +
                    1 +
                    (this.xScale(d.x1) - this.xScale(d.x0) - 1) / 2
                )
                // .attr('dx', (d) =>
                //   Object.keys(d).filter(
                //     (i) => i !== 'x0' && i !== 'x1' && i !== 'sequence_id'
                //   ).length < 10
                //     ? -2
                //     : -5
                // )
                .attr('dy', -4)
                .attr('y', (d, i) => {
                  console.log(
                    d.sequence_id,
                    i,
                    this.sequenceIdLookup[5][d.sequence_id]
                  )
                  return (
                    (this.sequenceIdLookup[this.chromosomeNr][d.sequence_id] -
                      1) *
                      (this.barHeight + 10) +
                    10

                    // return (
                    //   (this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] -
                    //     1) *
                    //   (this.barHeight + 10)
                  )
                })
                // .attr('dy', this.barHeight / 4)
                .text(
                  (d) =>
                    Object.keys(d).filter(
                      (i) => i !== 'x0' && i !== 'x1' && i !== 'sequence_id'
                    ).length
                ),
            (update) =>
              update
                .transition()
                .duration(this.transitionTime)
                // .attr(
                //   'x',
                //   (d) =>
                //     this.xScale(d.x0) +
                //     1 +
                //     (this.xScale(d.x1) - this.xScale(d.x0) - 1)
                // )
                // .attr('dx', (d) =>
                //   Object.keys(d).filter(
                //     (i) => i !== 'x0' && i !== 'x1' && i !== 'sequence_id'
                //   ).length < 10
                //     ? -2
                //     : -5
                // )
                .attr(
                  'x',
                  (d) =>
                    this.xScale(d.x0) +
                    1 +
                    (this.xScale(d.x1) - this.xScale(d.x0) - 1) / 2
                )
                .attr('y', (d, i) => {
                  return (
                    (this.sequenceIdLookup[this.chromosomeNr][d.sequence_id] -
                      1) *
                      (this.barHeight + 10) +
                    10

                    // return (
                    //   (this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] -
                    //     1) *
                    //   (this.barHeight + 10)
                  )
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
      const barHeightScaled =
        (this.svgHeight - 2 * this.margin.top) /
        this.sortedChromosomeSequenceIndices[this.chromosomeNr].length
      console.log('barHeightScaled', barHeightScaled)

      this.barHeight = barHeightScaled - 10
    }

    this.drawXAxis() // draw axis once
    this.draw()

    // Add brushing
    var brush = d3
      .brushX() // Add the brush feature using the d3.brush function
      .extent([
        [this.margin.left * 3, 0],
        [this.visWidth, this.visHeight],
      ])
      .on('end', this.updateChart)

    this.brush = brush

    // Add brushing
    this.svg().append('g').attr('class', 'brush').call(brush)

    this.addClipPath()
    this.resetZoom()

    this.observeWidth()

    // console.log('GC', this.minGC, this.maxGC)

    // this.resizeObserver = new ResizeObserver(this.onResize)
    // this.resizeObserver.observe(this.$el)
  },
  // unmounted() {
  //   this.resizeObserver?.disconnect()
  // },
  watch: {
    showNotificationsOverview() {
      this.draw()
    },
    sortedChromosomeSequenceIndices() {
      this.draw()
    },
    numberOfChromosomes() {
      this.svg().select('g.x-axis').remove()
      this.svg().select('svg.clipPath').remove()
      this.svg().select('g.brush').remove()
      this.addClipPath()
      this.drawXAxis() // redraw
      // Add brushing
      this.brush // Add the brush feature using the d3.brush function
        .extent([
          [this.margin.left * 3, 0],
          [this.visWidth, this.visHeight],
        ])

      this.svg().append('g').attr('class', 'brush').call(this.brush)
      this.draw()
    },
    svgWidth() {
      this.svg().select('g.x-axis').remove()
      this.svg().select('svg.clipPath').remove()
      this.svg().select('g.brush').remove()
      this.addClipPath()
      this.drawXAxis() // redraw
      // Add brushing
      this.brush // Add the brush feature using the d3.brush function
        .extent([
          [this.margin.left * 3, 0],
          [this.visWidth, this.visHeight],
        ])

      this.svg().append('g').attr('class', 'brush').call(this.brush)
      this.draw()
    },
    overviewArrows() {
      this.svg().selectAll('rect.gene').remove()
      this.svg().selectAll('path.gene').remove()
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

.genome {
  fill: $gray-10;
}
</style>
