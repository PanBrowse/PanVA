<script lang="ts">
import * as d3 from 'd3'
import { mapValues, range, zip, keyBy } from 'lodash'
import { useDataStore } from '@/stores/data'
import { mapState } from 'pinia'
import type { D3BrushEvent } from 'd3'

export default {
  name: 'GeneOverview',
  props: {
    title: String,
  },
  data() {
    return {
      // Initial value, is resized dynamically.
      svgWidth: 1200,
      // Fixed value.
      svgHeight: 80,

      // How much should the brush extend above the graph.
      brushExtendTop: 5,

      // State.
      geneOverviewGroup: d3.select<SVGElement, any>('#geneOverview'),
      resizeObserver: null as ResizeObserver | null,

      // Spacing around the graph for ticks and labels.
      margin: {
        top: 20,
        right: 20,
        bottom: 24,
        left: 200,
      },
    }
  },
  computed: {
    ...mapState(useDataStore, [
      'geneLength',
      'homology',
      'selectedRegion',
      'sequenceCount',
      'varPosCount',
    ]),
    allScores() {
      // Variable position count is sparse, so we fill up the missing values.

      const lookup = mapValues(
        keyBy(this.varPosCount, 'position'),
        'convervation'
      )

      const xValues = range(1, this.geneLength + 1)
      const yValues = xValues.map((x) =>
        x in lookup ? lookup[x] : this.sequenceCount
      )

      return zip(xValues, yValues).map(([x, y]) => ({
        x,
        y: (y / this.sequenceCount) * 100,
      }))
    },
    xScale() {
      return d3
        .scaleLinear()
        .domain([1, this.geneLength])
        .range([this.margin.left, this.svgWidth - this.margin.right])
    },
    yScale() {
      return d3
        .scaleLinear()
        .domain([0, 100]) // percent
        .range([this.svgHeight - this.margin.bottom, this.margin.top])
    },
    ticksXdomain() {
      const stepFactor = this.geneLength / 1000
      const stepSize = Math.ceil(stepFactor) * 100
      const ticks = range(stepSize, this.geneLength, stepSize).concat([
        this.geneLength,
      ])

      // If the last "rounded" tick and the "geneLength" tick are too close together.
      const [beforeLast, last] = ticks.slice(-2)
      if (last - beforeLast < stepSize * 0.5) {
        // Remove the last "rounded" tick and keep the "geneLength" tick.
        ticks.splice(-2, 1)
      }

      return ticks
    },
  },
  methods: {
    onResize() {
      this.svgWidth = this.$el.offsetWidth
      this.drawSvg()
    },
    onBrush({ selection }: D3BrushEvent<any>) {
      const [x0, x1] = (selection as [number, number])
        .map(this.xScale.invert)
        .map(Math.round)

      this.updateBrushLabel('left', x0, x1)
      this.updateBrushLabel('right', x0, x1)
    },
    onBrushEnd({ selection }: D3BrushEvent<any>) {
      // Selection of single point yields null, so we ignore it.
      // TODO: Allow single point selection?
      if (!selection) {
        return
      }

      const [x0, x1] = (selection as [number, number]).map(this.xScale.invert)
      this.selectedRegion = [Math.round(x0), Math.round(x1)]
    },
    updateBrushLabel(side: 'left' | 'right', start: number, end: number) {
      let brushClass = '.brushLabelL'
      let style = 'end'
      let data = [start]
      let xPos = this.xScale(start)

      if (side === 'right') {
        brushClass = '.brushLabelR'
        style = 'start'
        data = [end]
        xPos = this.xScale(end)
      }

      this.geneOverviewGroup
        .selectAll(brushClass)
        .data(data)
        .style('text-anchor', style)
        .attr('x', xPos)
        .attr('y', -2)
        .text((d) => d)
    },
    drawBrush() {
      // Initalize brush.
      const brush = d3.brushX().extent([
        [this.margin.left, this.margin.top - this.brushExtendTop],
        [
          this.svgWidth - this.margin.right,
          this.svgHeight - this.margin.bottom,
        ],
      ])

      // Append brush.
      const brushGroup = this.geneOverviewGroup
        .append('g')
        .attr('class', 'brush')

      // Append brush labels.
      const svgContextLabels = this.geneOverviewGroup
        .append('g')
        .attr('class', 'brushLabels')
        .attr(
          'transform',
          'translate(0, ' + (this.margin.top - this.brushExtendTop) + ')'
        )

      svgContextLabels.append('g').attr('class', 'brushLabelL')
      svgContextLabels.append('g').attr('class', 'brushLabelR')

      brushGroup
        .call(brush)
        .call(brush.move, this.selectedRegion.map(this.xScale))

      this.updateBrushLabel(
        'left',
        this.selectedRegion[0],
        this.selectedRegion[1]
      )
      this.updateBrushLabel(
        'right',
        this.selectedRegion[0],
        this.selectedRegion[1]
      )

      brush.on('end', this.onBrushEnd)
    },
    drawExons() {
      this.geneOverviewGroup
        .selectAll('.line-select')
        .data([this.allScores], (d) => d)
        .join(
          (enter) =>
            enter
              .append('path')
              .attr('class', 'line-select')
              .attr('fill', 'rgba(128,128,128, 0.4)')
              .attr('stroke', 'rgba(128,128,128, 1)')
              .attr(
                'd',
                d3
                  .area()
                  .x((d) => this.xScale(d.x))
                  .y0(this.yScale(0))
                  .y1((d) => this.yScale(d.y))
                  .curve(d3.curveMonotoneX)
              ),
          (update) => update,
          (exit) => exit.remove()
        )
    },
    drawAxes() {
      // Append axes.
      const yAxis = this.geneOverviewGroup
        .append('g')
        .attr('class', 'gene--y-axis')
        .call(d3.axisLeft(this.yScale).ticks(2).tickSizeOuter(0))

      // Auto-fit left margin to yAxis width.
      // Include some additional margin so text doesn't touch edge of svg.
      this.margin.left = yAxis.node().getBBox().width + 5

      yAxis.attr('transform', 'translate(' + this.margin.left + ',0)')

      this.geneOverviewGroup
        .append('g')
        .attr('class', 'gene--x-axis')
        .attr(
          'transform',
          'translate(0,' + (this.svgHeight - this.margin.bottom) + ')'
        )
        .call(d3.axisBottom(this.xScale).tickValues(this.ticksXdomain))
    },
    drawSvg() {
      // Remove all old child elements.
      this.geneOverviewGroup?.html('')

      this.drawAxes()
      this.drawExons()
      this.drawBrush()
    },
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(this.onResize)
    this.resizeObserver.observe(this.$el)
  },
  unmounted() {
    this.resizeObserver?.disconnect()
  },
  updated() {
    this.drawSvg()
  },
}
</script>

<template>
  <a-card
    title="Gene overview"
    :bordered="false"
    size="small"
    style="margin-bottom: 16px"
  >
    <svg :width="svgWidth" :height="svgHeight" id="geneOverview"></svg>
  </a-card>
</template>

<style scoped>
#gene-container {
  margin-bottom: 4px;
}

.brush .selection {
  stroke: white;
  fill: #1890ff;
  fill-opacity: 0.3;
}

.gene--annotation {
  fill: #e7298a;
  fill-opacity: 0.06;
}

.brushLabels {
  font-size: 10px;
  font-family: Helvetica, Arial, 'Open Sans', sans-serif;
  fill: cornflowerblue;
  font-weight: 600;
}

.tick {
  font-size: 8px !important;
}
</style>
