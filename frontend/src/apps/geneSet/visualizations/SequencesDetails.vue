<template>
  <ACard
    :title="`${cardName}`"
    :style="{
      width: `${100}%`,
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
import { CloseCircleOutlined, ConsoleSqlOutlined } from '@ant-design/icons-vue'
import { Button, Card } from 'ant-design-vue'
import * as d3 from 'd3'
// import * as d3Fisheye from 'd3-fisheye'
import { range } from 'lodash'
import { mapActions, mapState } from 'pinia'

import { groupInfoDensity } from '@/helpers/chromosome'
import { asterisk, cross, plus } from '@/helpers/customSymbols'
// import * as fisheye from '@/helpers/fisheye'
import { useGeneSetStore } from '@/stores/geneSet'
import { useGlobalStore } from '@/stores/global'
import type { SequenceMetrics } from '@/types'

export default {
  name: 'SequencesDetails',
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
    barHeight: 28,
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
      'percentageGC',
      'colorGenomes',
      'homologyGroups',
      'upstreamHomologies',
      'showTable',
      'showNotificationsDetail',
      'homologyFocus',
      'anchor',
      'colorGenes',
      'showLinks',
    ]),
    cardName() {
      return this.name.split('_')[0]
    },
    containerWidth() {
      return this.showTable ? this.svgWidth / 2 : this.svgWidth
    },
    visWidth() {
      return this.containerWidth - 12 - 12 - 10 - 17.5
    },
    visHeight() {
      return this.svgHeight
    },
    // xScale() {
    //   return (
    //     d3
    //       .scaleLinear()
    //       // .domain([this.dataMin > 0 ? 0 : this.dataMin, this.dataMax])
    //       .domain([-this.anchorMax, this.anchorMax])
    //       .nice()
    //       .rangeRound([
    //         0,
    //         this.visWidth - this.margin.yAxis + this.margin.left * 4,
    //       ])
    //   )
    // },
    xScale() {
      return this.anchor
        ? d3
            .scaleLinear()
            // .domain([this.dataMin > 0 ? 0 : this.dataMin, this.dataMax])
            .domain([-this.anchorMax, this.anchorMax])
            .nice()
            .rangeRound([
              0,
              this.visWidth - this.margin.yAxis + this.margin.left * 4,
            ])
        : d3
            .scaleLinear()
            .domain([this.dataMin > 0 ? 0 : this.dataMin, this.dataMax])
            // .domain([-this.anchorMax, this.anchorMax])
            .nice()
            .rangeRound([
              0,
              this.visWidth - this.margin.yAxis + this.margin.left * 4,
            ])
    },
    // xScale() {
    //   return this.anchor
    //     ? d3
    //         .scaleLinear()
    //         // .domain([this.dataMin > 0 ? 0 : this.dataMin, this.dataMax])
    //         .domain([-this.anchorMax, this.anchorMax])
    //         .nice()
    //         .rangeRound([
    //           0,
    //           this.visWidth - this.margin.yAxis + this.margin.left * 4,
    //         ])
    //     : d3
    //         .scaleLinear()
    //         .domain([this.dataMin > 0 ? 0 : this.dataMin, this.dataMax])
    //         // .domain([-this.anchorMax, this.anchorMax])
    //         .nice()
    //         .rangeRound([
    //           0,
    //           this.visWidth - this.margin.yAxis + this.margin.left * 4,
    //         ])
    // },
    // ticksXdomain() {
    //   const stepFactor = this.dataMax / 1000000
    //   const stepSize = Math.ceil(stepFactor) * this.numberOfChromosomes * 100000
    //   const ticks = range(stepSize, this.dataMax, stepSize).concat([
    //     this.dataMax,
    //   ])
    //   ticks.unshift(0)

    //   // If the last "rounded" tick and the "geneLength" tick are too close together.
    //   const [beforeLast, last] = ticks.slice(-2)
    //   if (last - beforeLast < stepSize * 0.5) {
    //     // Remove the last "rounded" tick and keep the "geneLength" tick.
    //     ticks.splice(-2, 1)
    //   }

    //   return ticks
    // },
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
    colorScaleGenome() {
      return d3.scaleOrdinal().domain([1, 5]).range(d3.schemeCategory10)
      // .interpolator(d3.interpolateViridis)
    },
    shapeGenerator() {
      const shapes = [
        d3.symbolPlus,
        d3.symbolWye,
        d3.symbolTriangle,
        d3.symbolSquare,
        d3.symbolStar,
        d3.symbolDiamond,
        d3.symbolsStroke[0],
        d3.symbolsStroke[1],
        d3.symbolsStroke[2],
        d3.symbolsStroke[3],
        d3.symbolsStroke[4],
      ]
      const obj = Object.fromEntries(
        this.homologyGroups.map((hg, dataIndex) => [hg, shapes[dataIndex]])
      )
      return obj
    },
  },
  methods: {
    ...mapActions(useGeneSetStore, ['deleteChromosome']),
    observeWidth() {
      let vis = this
      const resizeObserver = new ResizeObserver(function () {
        vis.svgWidth =
          document.getElementById('content').offsetWidth *
          vis.svgWidthScaleFactor
      })
      resizeObserver.observe(document.getElementById('content'))
    },
    svg() {
      return d3.select(`#container_${this.name}`)
    },
    g() {
      return d3
        .select(`#container_${this.name}`)
        .append('g')
        .attr('class', 'genes')
    },
    addClipPath() {
      this.svg().select('defs').remove() //needed because otherwise draws twice in some cases. To-do: fix side effect

      this.svg()
        .append('defs')
        .append('svg:clipPath')
        .attr('id', 'clipDetails')
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

        this.svg()
          .select('.x-axis')
          .transition()
          .duration(1000)
          .call(
            d3.axisTop(this.xScale)

            // .tickValues(this.ticksXdomain)
          )
          .call((g) => g.select('.domain').remove())
          .call((g) => g.selectAll('line').attr('stroke', '#c0c0c0'))
          .call((g) => g.selectAll('text').attr('fill', '#c0c0c0'))

        this.svg().selectAll('circle.density').remove()
        this.svg().selectAll('text.density-value-focus').remove()
        this.draw()
      }
    },
    resetZoom() {
      let vis = this
      this.svg().on('dblclick', function () {
        if (!vis.anchor) {
          vis.xScale
            .domain([vis.dataMin > 0 ? 0 : vis.dataMin, vis.dataMax])
            .nice()

          vis
            .svg()
            .select('.x-axis')
            .transition()
            .duration(1000)
            .call(d3.axisTop(vis.xScale).tickValues(vis.ticksXdomain))
            .call((g) => g.select('.domain').remove())
            .call((g) => g.selectAll('line').attr('stroke', '#c0c0c0'))
            .call((g) => g.selectAll('text').attr('fill', '#c0c0c0'))

          vis.svg().selectAll('circle.density').remove()
          vis.svg().selectAll('text.density-value-focus').remove()
          vis.draw()
        } else {
          vis.xScale.domain([-vis.anchorMax, vis.anchorMax]).nice()

          vis
            .svg()
            .select('.x-axis')
            .transition()
            .duration(1000)
            .call(d3.axisTop(vis.xScale).tickValues(vis.ticksXdomain))
            .call((g) => g.select('.domain').remove())
            .call((g) => g.selectAll('line').attr('stroke', '#c0c0c0'))
            .call((g) => g.selectAll('text').attr('fill', '#c0c0c0'))

          vis.svg().selectAll('circle.density').remove()
          vis.svg().selectAll('text.density-value-focus').remove()
          vis.draw()
        }
      })
    },
    pan() {
      let vis = this
      // Add event listener on keydown
      document.addEventListener('keydown', (event) => {
        var name = event.key
        var code = event.code
        // Alert the key name and key code on keydown
        console.log('key', name, code)
        if (event.key === 'ArrowLeft') {
          const prevDomain = vis.xScale.domain()
          console.log('previous domain', prevDomain)
          const rangeDomain = 100000
          console.log('range domain', rangeDomain)

          // console.log('anchor?', vis.anchor)

          var newDomain

          if (vis.anchor) {
            newDomain = [
              prevDomain[0] - rangeDomain,
              prevDomain[1] - rangeDomain,
            ]
          } else {
            newDomain = [
              prevDomain[0] - rangeDomain < 0 ? 0 : prevDomain[0] - rangeDomain,
              prevDomain[1] - rangeDomain,
            ]
          }

          console.log('new domain', newDomain, vis.xScale.domain())

          vis.xScale
            .domain([vis.dataMin < 0 ? 0 : newDomain[0], newDomain[1]])
            .nice()

          vis
            .svg()
            .select('.x-axis')
            .call(d3.axisTop(vis.xScale))
            .call((g) => g.select('.domain').remove())
            .call((g) => g.selectAll('line').attr('stroke', '#c0c0c0'))
            .call((g) => g.selectAll('text').attr('fill', '#c0c0c0'))

          vis.svg().selectAll('circle.density').remove()
          vis.svg().selectAll('text.density-value-focus').remove()
          vis.draw()
        }
        if (event.key === 'ArrowRight') {
          const prevDomain = vis.xScale.domain()
          console.log('previous domain', prevDomain)
          const rangeDomain = 100000
          console.log('range domain', rangeDomain)

          const newDomain = [
            prevDomain[0] + rangeDomain,
            prevDomain[1] + rangeDomain > vis.dataMax
              ? vis.dataMax
              : prevDomain[1] + rangeDomain,
          ]
          console.log('new domain', newDomain, vis.xScale.domain())

          vis.xScale
            .domain([vis.dataMin < 0 ? 0 : newDomain[0], newDomain[1]])
            .nice()

          vis
            .svg()
            .select('.x-axis')
            .call(d3.axisTop(vis.xScale))
            .call((g) => g.select('.domain').remove())
            .call((g) => g.selectAll('line').attr('stroke', '#c0c0c0'))
            .call((g) => g.selectAll('text').attr('fill', '#c0c0c0'))

          vis.svg().selectAll('circle.density').remove()
          vis.svg().selectAll('text.density-value-focus').remove()
          vis.draw()
        }
      })
    },
    idled() {
      this.idleTimeout = null
    },
    drawBars() {
      let vis = this

      console.log('data sequence details', this.data)

      this.svg()
        .selectAll('rect.bar-chr')
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
              // .attr('x', this.xScale(0))
              .attr('x', this.anchor ? this.xScale(-35000000) : this.xScale(0))
              .attr(
                'y',
                (d, i) =>
                  this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] *
                  (this.barHeight + 10)
              )
              // .attr('width', function (d) {
              //   return vis.xScale(d.sequence_length)
              // })
              .attr('width', (d) =>
                this.anchor
                  ? this.xScale(70000000)
                  : vis.xScale(d.sequence_length)
              )
              .attr('height', this.barHeight)

              .attr('fill', function (d) {
                let color
                if (vis.colorGenomes == true) {
                  color = vis.colorScaleGenome(parseInt(d.genome_number))
                } else {
                  color = '#f0f2f5'
                  // color = '#fff'
                }
                return color
              })
              .attr('opacity', function (d) {
                let color
                if (vis.colorGenomes == true) {
                  color = 0.5
                } else {
                  color = 1
                }
                return color
              })
              .attr('clip-path', 'url(#clipDetails)'),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('x', this.anchor ? this.xScale(-35000000) : this.xScale(0))
              .attr('fill', function (d) {
                let color
                if (vis.colorGenomes == true) {
                  color = vis.colorScaleGenome(parseInt(d.genome_number))
                } else {
                  color = '#f0f2f5'
                  // color = '#fff'
                }
                return color
              })
              .attr('opacity', function (d) {
                let color
                if (vis.colorGenomes == true) {
                  color = 0.5
                } else {
                  color = 1
                }
                return color
              })
              .attr(
                'y',
                (d, i) =>
                  this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] *
                  (this.barHeight + 10)
              )
              // .attr('width', function (d) {
              //   return vis.xScale(d.sequence_length)
              // }),
              .attr('width', (d) =>
                this.anchor
                  ? this.xScale(70000000)
                  : vis.xScale(d.sequence_length)
              ),

          (exit) => exit.remove()
        )
    },
    drawContextBars() {
      let vis = this

      this.svg()
        .selectAll('rect.bar-chr-context')
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
              .attr('x', this.anchor ? this.xScale(-35000000) : this.xScale(0))
              .attr(
                'y',
                (d, i) =>
                  this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] *
                  (this.barHeight + 10)
              )
              // .attr('width', function (d) {
              //   return vis.xScale(d.sequence_length)
              // })
              .attr('width', (d) =>
                this.anchor
                  ? this.xScale(70000000)
                  : vis.xScale(d.sequence_length)
              )
              .attr('height', this.barHeight / 4)
              .attr('fill', function (d) {
                let color
                if (vis.percentageGC == true) {
                  color = vis.colorScaleGC(d.GC_content_percent)
                } else {
                  color = 'transparent'
                }
                return color
              })
              .attr('opacity', function (d) {
                let color
                if (vis.percentageGC == true) {
                  color = 1
                } else {
                  color = 0
                }
                return color
              })
              .attr('clip-path', 'url(#clipDetails)'),
          (update) =>
            update
              .transition()
              .duration(this.transitionTime)
              .attr('x', this.anchor ? this.xScale(-35000000) : this.xScale(0))
              .attr('fill', function (d) {
                let color
                if (vis.percentageGC == true) {
                  color = vis.colorScaleGC(d.GC_content_percent)
                } else {
                  color = 'transparent'
                }
                return color
              })
              .attr('opacity', function (d) {
                let color
                if (vis.percentageGC == true) {
                  color = 1
                } else {
                  color = 0
                }
                return color
              })
              .attr(
                'y',
                (d, i) =>
                  this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] *
                  (this.barHeight + 10)
              )
              .attr('width', (d) =>
                this.anchor
                  ? this.xScale(70000000)
                  : vis.xScale(d.sequence_length)
              ),
          (exit) => exit.remove()
        )
    },
    draw() {
      if (this.chromosomeNr !== 'unphased') {
        this.drawBars()
        this.drawContextBars()
        this.addLabels()
        this.drawGenes()

        this.showNotificationsDetail
          ? this.drawNotifications()
          : this.hideNotifications()
      }
    },
    hideNotifications() {
      this.svg().selectAll('circle.density').remove()
      this.svg().selectAll('text.density-value-focus').remove()
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
              .attr('x', 5)
              .attr('font-size', 10)
              .attr(
                'y',
                (d, i) =>
                  this.sortedChromosomeSequenceIndices[this.chromosomeNr][i] *
                  (this.barHeight + 10)
              )

              .attr('dy', this.barHeight / 3)
              // .text((d) => d.sequence_id.split('_')),
              .text((d) =>
                d.phasing_id.includes('unphased')
                  ? d.genome_number + '_' + 'U'
                  : d.genome_number + '_' + d.phasing_id.split('_')[1]
              ),

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

      // this.svg()
      //   .selectAll('path.genome')
      //   .data(this.data, (d) => d.sequence_id)
      //   .join(
      //     (enter) =>
      //       enter
      //         .append('path')
      //         .attr(
      //           'd',
      //           d3
      //             .symbol()

      //             .type(function (d) {
      //               console.log('d shape', d.genome_number)
      //               if (d.genome_number === 1) {
      //                 return cross
      //               }
      //               if (d.genome_number === 2) {
      //                 // return d3.symbolsFill[6]
      //                 return d3.symbolWye
      //               }
      //               if (d.genome_number === 3) {
      //                 return d3.symbolsStroke[2]
      //               }
      //               if (d.genome_number === 4) {
      //                 return d3.symbolsFill[3]
      //               }
      //               if (d.genome_number === 5) {
      //                 return d3.symbolsFill[4]
      //               } else {
      //                 return d3.symbolsFill[5]
      //               }
      //             })
      //             .size(this.barHeight * 3)
      //         )

      //         .attr('transform', function (d, i) {
      //           if (d.genome_number === 1) {
      //             return `translate(${vis.margin.left},${
      //               vis.margin.top +
      //               vis.barHeight +
      //               vis.sortedChromosomeSequenceIndices[vis.chromosomeNr][i] *
      //                 (vis.barHeight + 10)
      //             }
      //               )rotate(-45)`
      //           } else {
      //             return `translate(${vis.margin.left},${
      //               vis.margin.top +
      //               vis.barHeight +
      //               vis.sortedChromosomeSequenceIndices[vis.chromosomeNr][i] *
      //                 (vis.barHeight + 10)
      //             }
      //               )`
      //           }
      //         })
      //         .attr('class', 'genome')
      //         .attr('style', function (d) {
      //           if ((d.genome_number === 1) | (d.genome_number === 3)) {
      //             return 'stroke: red'
      //           }
      //         })

      //         .attr('z-index', 100),

      //     (update) =>
      //       update
      //         .transition()
      //         .duration(this.transitionTime)
      //         .attr('transform', function (d, i) {
      //           if (d.genome_number === 1) {
      //             return `translate(${vis.margin.left},${
      //               vis.margin.top +
      //               vis.barHeight +
      //               vis.sortedChromosomeSequenceIndices[vis.chromosomeNr][i] *
      //                 (vis.barHeight + 10)
      //             }
      //               )rotate(-45)`
      //           } else {
      //             return `translate(${vis.margin.left},${
      //               vis.margin.top +
      //               vis.barHeight +
      //               vis.sortedChromosomeSequenceIndices[vis.chromosomeNr][i] *
      //                 (vis.barHeight + 10)
      //             }
      //               )`
      //           }
      //         }),
      //     (exit) => exit.remove()
      //   )
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
      console.log('this.dataGenes', this.dataGenes)

      if (this.dataGenes !== undefined) {
        /// connection lines

        if (this.showLinks) {
          this.svg().selectAll('path.connection').remove()
          this.homologyGroups.forEach((homology) => {
            const path_focus = this.dataGenes.filter(
              (d) => d.homology_id == homology //this.homologyFocus
            )

            // console.log('path focus', path_focus)
            const newPathFocus = path_focus.map((v) => ({
              ...v,
              sequence_id: `${v.genome_number}_${v.sequence_number}`,
            }))

            // path_focus.forEach((d) => {
            //   const key = `${d.genome_number}_${d.sequence_number}`
            //   path_focus['sequence_id'] = key
            // })
            console.log('newPathFocus', newPathFocus)
            console.log(Object.keys(this.sequenceIdLookup[this.chromosomeNr]))

            let sortOrder = Object.keys(
              this.sequenceIdLookup[this.chromosomeNr]
            )

            let sortedPath = [...newPathFocus].sort(function (a, b) {
              return (
                sortOrder.indexOf(a.sequence_id) -
                sortOrder.indexOf(b.sequence_id)
              )
            })

            // console.log('sortedPath', sortedPath)

            // Add the line

            this.svg()
              .append('path')
              .datum(sortedPath)
              .attr('class', 'connection')
              .attr('fill', 'none')
              .attr('stroke', vis.colorScale(homology))
              .attr('stroke-width', 1.5)
              .attr(
                'd',
                d3
                  .line()
                  .x(function (d) {
                    const key = `${d.genome_number}_${d.sequence_number}`
                    let anchorStart = vis.anchorLookup[key]
                    return (
                      vis.margin.left * 3 +
                      vis.xScale(d.mRNA_start_position - anchorStart)
                    )
                  })
                  .y(function (d, i) {
                    return (
                      vis.margin.top * 2 +
                      vis.barHeight / 2 +
                      // vis.sortedMrnaIndices[vis.chromosomeNr][i] *
                      vis.sequenceIdLookup[vis.chromosomeNr][d.sequence_id] *
                        (vis.barHeight + 10)
                      // i * (vis.barHeight + 10)
                    )
                  })
              )
          })
        } else {
          this.svg().selectAll('path.connection').remove()
        }

        // const path_focus = this.dataGenes.filter(
        //   (d) => d.homology_id == 232274335 //this.homologyFocus
        // )

        // // // console.log('path focus', path_focus)
        // // const newPathFocus = path_focus.map((v) => ({
        // //   ...v,
        // //   sequence_id: `${v.genome_number}_${v.sequence_number}`,
        // // }))

        // // // path_focus.forEach((d) => {
        // // //   const key = `${d.genome_number}_${d.sequence_number}`
        // // //   path_focus['sequence_id'] = key
        // // // })
        // // console.log('newPathFocus', newPathFocus)
        // // console.log(Object.keys(this.sequenceIdLookup[this.chromosomeNr]))

        // // let sortOrder = Object.keys(this.sequenceIdLookup[this.chromosomeNr])

        // // let sortedPath = [...newPathFocus].sort(function (a, b) {
        // //   return (
        // //     sortOrder.indexOf(a.sequence_id) - sortOrder.indexOf(b.sequence_id)
        // //   )
        // // })

        // // // console.log('sortedPath', sortedPath)

        // // // Add the line
        // // this.svg().select('path.connection').remove()
        // // this.svg()
        // //   .append('path')
        // //   .datum(sortedPath)
        // //   .attr('class', 'connection')
        // //   .attr('fill', 'none')
        // //   .attr('stroke', vis.colorScale(232274335))
        // //   .attr('stroke-width', 1.5)
        // //   .attr(
        // //     'd',
        // //     d3
        // //       .line()
        // //       .x(function (d) {
        // //         const key = `${d.genome_number}_${d.sequence_number}`
        // //         let anchorStart = vis.anchorLookup[key]
        // //         return (
        // //           vis.margin.left * 3 +
        // //           vis.xScale(d.mRNA_start_position - anchorStart)
        // //         )
        // //       })
        // //       .y(function (d, i) {
        // //         return (
        // //           vis.margin.top * 2 +
        // //           vis.barHeight / 2 +
        // //           // vis.sortedMrnaIndices[vis.chromosomeNr][i] *
        // //           vis.sequenceIdLookup[vis.chromosomeNr][d.sequence_id] *
        // //             (vis.barHeight + 10)
        // //           // i * (vis.barHeight + 10)
        // //         )
        // //       })
        // //   )

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
                    .size(this.barHeight * 4)
                    .type(d3.symbolTriangle)
                    .type((d) => vis.shapeGenerator[d.homology_id])
                  // .type(d3.symbolTriangle)
                )
                .attr('transform', function (d, i) {
                  const key = `${d.genome_number}_${d.sequence_number}`
                  let rotation

                  if (vis.anchor) {
                    let anchorStart = vis.anchorLookup[key]
                    // console.log('anchorStart', anchorStart)

                    if (d.strand === '+') {
                      rotation = `translate(${
                        vis.margin.left * 3 +
                        vis.xScale(d.mRNA_start_position - anchorStart)
                      },${
                        vis.margin.top * 2 +
                        vis.barHeight / 2 +
                        vis.sortedMrnaIndices[vis.chromosomeNr][i] *
                          (vis.barHeight + 10)
                      }
                    )`
                    } else {
                      return `translate(${
                        vis.margin.left * 3 +
                        vis.xScale(d.mRNA_start_position - anchorStart)
                      },${
                        vis.margin.top * 2 +
                        vis.barHeight / 2 +
                        vis.sortedMrnaIndices[vis.chromosomeNr][i] *
                          (vis.barHeight + 10)
                      }
                    )`
                    }

                    return rotation
                  } else {
                    if (d.strand === '+') {
                      rotation = `translate(${
                        vis.margin.left * 3 + vis.xScale(d.gene_start_position)
                      },${
                        vis.margin.top * 2 +
                        vis.barHeight / 2 +
                        vis.sortedMrnaIndices[vis.chromosomeNr][i] *
                          (vis.barHeight + 10)
                      }
                    )`
                    } else {
                      return `translate(${
                        vis.margin.left * 3 + vis.xScale(d.gene_start_position)
                      },${
                        vis.margin.top * 2 +
                        vis.barHeight / 2 +
                        vis.sortedMrnaIndices[vis.chromosomeNr][i] *
                          (vis.barHeight + 10)
                      }
                    )`
                    }

                    return rotation
                  }
                })
                // .attr('transform', function (d, i) {
                //   const key = `${d.genome_number}_${d.sequence_number}`
                //   let rotation

                //   if (d.strand === '+') {
                //     rotation = `translate(${
                //       vis.margin.left * 3 + vis.xScale(d.gene_start_position)
                //     },${
                //       vis.margin.top * 2 +
                //       vis.barHeight / 2 +
                //       vis.sortedMrnaIndices[vis.chromosomeNr][i] *
                //         (vis.barHeight + 10)
                //     }
                //     )`
                //   } else {
                //     return `translate(${
                //       vis.margin.left * 3 + vis.xScale(d.gene_start_position)
                //     },${
                //       vis.margin.top * 2 +
                //       vis.barHeight / 2 +
                //       vis.sortedMrnaIndices[vis.chromosomeNr][i] *
                //         (vis.barHeight + 10)
                //     }
                //     )`
                //   }

                //   return rotation
                // })
                .attr('class', 'gene')
                .attr('hg', (d) => d.homology_id)
                .attr('z-index', 100)
                .attr('stroke', (d) =>
                  vis.colorGenes
                    ? vis.upstreamHomologies.includes(d.homology_id)
                      ? vis.colorScale(d.homology_id)
                      : ''
                    : ''
                )
                .attr('stroke-width', (d) =>
                  vis.upstreamHomologies.includes(d.homology_id) ? '3px' : ''
                )
                .attr('fill', (d) =>
                  vis.colorGenes ? vis.colorScale(d.homology_id) : 'black'
                )
                .attr('opacity', 0.8),

            (update) =>
              update
                .transition()
                .duration(this.transitionTime)
                // .attr('transform', function (d, i) {
                //   const key = `${d.genome_number}_${d.sequence_number}`

                //   return `translate(${
                //     vis.margin.left * 3 + vis.xScale(d.gene_start_position)
                //   },${vis.margin.top * 2 + vis.barHeight / 2 + vis.sortedMrnaIndices[vis.chromosomeNr][i] * (vis.barHeight + 10)}
                //     )rotate(-270)`
                // }),
                .attr('fill', (d) =>
                  vis.colorGenes ? vis.colorScale(d.homology_id) : 'black'
                )
                .attr('stroke-width', (d) =>
                  vis.upstreamHomologies.includes(d.homology_id) ? '3px' : ''
                )
                .attr('stroke', (d) =>
                  vis.colorGenes
                    ? vis.upstreamHomologies.includes(d.homology_id)
                      ? vis.colorScale(d.homology_id)
                      : ''
                    : ''
                )
                .attr('transform', function (d, i) {
                  const key = `${d.genome_number}_${d.sequence_number}`
                  let rotation

                  if (vis.anchor) {
                    let anchorStart = vis.anchorLookup[key]
                    // console.log('anchorStart', anchorStart)

                    if (d.strand === '+') {
                      rotation = `translate(${
                        vis.margin.left * 3 +
                        vis.xScale(d.mRNA_start_position - anchorStart)
                      },${
                        vis.margin.top * 2 +
                        vis.barHeight / 2 +
                        vis.sortedMrnaIndices[vis.chromosomeNr][i] *
                          (vis.barHeight + 10)
                      }
                    )` // rotate(-270)`
                    } else {
                      return `translate(${
                        vis.margin.left * 3 +
                        vis.xScale(d.mRNA_start_position - anchorStart)
                      },${
                        vis.margin.top * 2 +
                        vis.barHeight / 2 +
                        vis.sortedMrnaIndices[vis.chromosomeNr][i] *
                          (vis.barHeight + 10)
                      }
                    )` //rotate(-450)`
                    }

                    return rotation
                  } else {
                    if (d.strand === '+') {
                      rotation = `translate(${
                        vis.margin.left * 3 + vis.xScale(d.gene_start_position)
                      },${
                        vis.margin.top * 2 +
                        vis.barHeight / 2 +
                        vis.sortedMrnaIndices[vis.chromosomeNr][i] *
                          (vis.barHeight + 10)
                      }
                    )` //rotate(-270)`
                    } else {
                      return `translate(${
                        vis.margin.left * 3 + vis.xScale(d.gene_start_position)
                      },${
                        vis.margin.top * 2 +
                        vis.barHeight / 2 +
                        vis.sortedMrnaIndices[vis.chromosomeNr][i] *
                          (vis.barHeight + 10)
                      }
                    )` //rotate(-450)`
                    }

                    return rotation
                  }
                }),
            // .attr('transform', function (d, i) {
            //   const key = `${d.genome_number}_${d.sequence_number}`

            //   let rotation

            //   if (d.strand === '+') {
            //     rotation = `translate(${
            //       vis.margin.left * 3 + vis.xScale(d.gene_start_position)
            //     },${
            //       vis.margin.top * 2 +
            //       vis.barHeight / 2 +
            //       vis.sortedMrnaIndices[vis.chromosomeNr][i] *
            //         (vis.barHeight + 10)
            //     }
            //     )`
            //   } else {
            //     return `translate(${
            //       vis.margin.left * 3 + vis.xScale(d.gene_start_position)
            //     },${
            //       vis.margin.top * 2 +
            //       vis.barHeight / 2 +
            //       vis.sortedMrnaIndices[vis.chromosomeNr][i] *
            //         (vis.barHeight + 10)
            //     }
            //     )`
            //   }

            //   return rotation
            // }),
            (exit) => exit.remove()
          )
      }
    },
    drawNotifications() {
      let vis = this

      if (this.dataGenes !== undefined) {
        const densityObjects = groupInfoDensity(this.dataGenes)

        const dataDensity = {}
        Object.keys(densityObjects).forEach((key) => {
          dataDensity[key] = densityObjects[key].map(
            (item) => item.mRNA_start_position
          )
        })
        console.log('densityData', dataDensity)

        const thresholds = this.xScale.ticks(100) //to-do: make configurable?
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
                    this.margin.top * 3 + vis.barHeight
                  })`
                )

                .attr('class', 'density')
                .attr(
                  'cx',
                  (d) =>
                    this.xScale(d.x0) +
                    (this.xScale(d.x1) - this.xScale(d.x0) - 1) / 2
                )
                .attr('cy', (d, i) => {
                  return (
                    (this.sequenceIdLookup[this.chromosomeNr][d.sequence_id] -
                      1) *
                    (this.barHeight + 10)
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
                    (this.xScale(d.x1) - this.xScale(d.x0) - 1) / 2
                )
                .attr('cy', (d, i) => {
                  return (
                    (this.sequenceIdLookup[this.chromosomeNr][d.sequence_id] -
                      1) *
                    (this.barHeight + 10)
                  )
                }),

            (exit) => exit.remove()
          )

        this.svg()
          .selectAll('text.density-value-focus')
          .data(allBins, (d) => d.sequence_id)
          .join(
            (enter) =>
              enter
                .append('text')

                .attr(
                  'transform',
                  `translate(${this.margin.left * 3},${
                    this.margin.top * 3 + this.barHeight
                  })`
                )
                .attr('class', 'density-value-focus')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'hanging')
                .attr(
                  'x',
                  (d) =>
                    this.xScale(d.x0) +
                    (this.xScale(d.x1) - this.xScale(d.x0) - 1) / 2
                )
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
                    (this.barHeight + 10)
                  )
                })
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
                .attr(
                  'x',
                  (d) =>
                    this.xScale(d.x0) +
                    (this.xScale(d.x1) - this.xScale(d.x0) - 1) / 2
                )
                .attr('dy', -4)
                .attr('y', (d, i) => {
                  return (
                    (this.sequenceIdLookup[this.chromosomeNr][d.sequence_id] -
                      1) *
                    (this.barHeight + 10)
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
      // this.svgHeight =
      //   this.sortedChromosomeSequenceIndices[this.chromosomeNr].length *
      //     (this.barHeight + 10) +
      //   this.margin.top * 2
      this.svgHeight = document.getElementById('content').offsetHeight
    }

    const containerHeight = document.getElementById('content').offsetHeight
    console.log('containerHeight', containerHeight)
    const barHeightScaled =
      (containerHeight - 7 * this.margin.top) /
      this.sortedChromosomeSequenceIndices[this.chromosomeNr].length
    console.log('barHeightScaled', barHeightScaled)

    this.barHeight = barHeightScaled - 10

    // Anchor
    ////
    //1.find all cdf 1
    const homologyAnchor = this.dataGenes.filter(
      (gene) => gene.homology_id === this.homologyFocus
    )
    console.log('geneSet', this.dataGenes, homologyAnchor)

    let anchorLookup = {}
    homologyAnchor.forEach((item) => {
      const key = `${item.genome_number}_${item.sequence_number}`
      anchorLookup[key] = item.mRNA_start_position
    })
    console.log('anchorLookup', anchorLookup)
    this.anchorLookup = anchorLookup

    const divergentScale = this.dataGenes.map((item) => {
      const key = `${item.genome_number}_${item.sequence_number}`
      const anchorValue = anchorLookup[key]
      return item.mRNA_start_position - anchorValue
    })

    let anchorMin = d3.min(divergentScale)
    this.anchorMin = anchorMin

    let anchorMax = d3.max(divergentScale)
    this.anchorMax = anchorMax

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
    this.pan()

    this.observeWidth()

    var fisheyeO = {
      circular: () => {
        var radius = 200,
          distortion = 2,
          k0,
          k1,
          focus = [0, 0]

        function fisheye(d) {
          var dx = d.x - focus[0],
            dy = d.y - focus[1],
            dd = Math.sqrt(dx * dx + dy * dy)
          if (!dd || dd >= radius)
            return { x: d.x, y: d.y, z: dd >= radius ? 1 : 10 }
          var k = ((k0 * (1 - Math.exp(-dd * k1))) / dd) * 0.75 + 0.25
          return {
            x: focus[0] + dx * k,
            y: focus[1] + dy * k,
            z: Math.min(k, 10),
          }
        }

        function rescale() {
          k0 = Math.exp(distortion)
          k0 = (k0 / (k0 - 1)) * radius
          k1 = distortion / radius
          return fisheye
        }

        fisheye.radius = function (_) {
          if (!arguments.length) return radius
          radius = +_
          return rescale()
        }

        fisheye.distortion = function (_) {
          if (!arguments.length) return distortion
          distortion = +_
          return rescale()
        }

        fisheye.focus = function (_) {
          if (!arguments.length) return focus
          focus = _
          return fisheye
        }

        return rescale()
      },
    }

    // const fisheye = fisheyeO.circular().radius(100).distortion(5)

    // console.log('fisheye', fisheye)
    // debugger
  },
  // unmounted() {
  //   this.resizeObserver?.disconnect()
  // },
  watch: {
    colorGenes() {
      this.drawGenes()
    },
    showLinks() {
      this.drawGenes()
    },
    anchor() {
      this.svg().select('g.x-axis').remove()
      this.drawXAxis() // redraw
      this.drawGenes()
    },
    showNotificationsDetail() {
      this.draw()
    },
    colorGenomes() {
      console.log('color genomes')
      this.drawBars()
    },
    percentageGC() {
      console.log('show GC')
      this.drawContextBars()
    },
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

.density {
  fill: #ff4d4f;
  z-index: 200 !important;
}

.density-value-focus {
  fill: white;
  font-weight: 500;
  font-size: 11px;
  font-family: sans-serif;
}

.density-value {
  fill: white;
  font-weight: 500;
  font-size: 11px;
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

.asterisk {
  stroke: red;
  stroke-width: 2px;
}
</style>
