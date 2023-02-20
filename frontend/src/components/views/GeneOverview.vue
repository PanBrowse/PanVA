<script lang="ts">
import * as d3 from 'd3'
import { range } from 'lodash'
import { useDataStore } from '@/stores/data'
import { mapState, mapWritableState } from 'pinia'
import type { D3BrushEvent } from 'd3'
import { zipEqual } from '@/helpers/zipEqual'

import { Card } from 'ant-design-vue'

type Score = {
  x: number
  y: number
}

export default {
  props: {
    title: String,
  },
  components: {
    ACard: Card,
  },
  data() {
    return {
      // Initial value, is resized dynamically.
      svgWidth: 100,
      // Fixed value.
      svgHeight: 72,

      // How much should the brush extend above the graph.
      brushExtendTop: 5,

      // State.
      resizeObserver: null as ResizeObserver | null,

      // Spacing around the graph for ticks and labels.
      margin: {
        top: 16,
        right: 20,
        bottom: 16,
        left: 30,
      },
    }
  },
  computed: {
    ...mapState(useDataStore, [
      'geneLength',
      'homology',
      'sequenceCount',
      'variablePositions',
    ]),
    ...mapWritableState(useDataStore, ['positionRegion']),
    allScores(): Score[] {
      const positions = range(1, this.geneLength + 1)
      const conservations = positions.map<number>((pos) => {
        const varPos = this.variablePositions[pos - 1]
        return varPos ? varPos.conservation : this.sequenceCount
      })

      return zipEqual(positions, conservations).map(([x, y]) => ({
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
      // Card width minus the padding.
      this.svgWidth = this.$el.offsetWidth - 24
      this.draw()
    },
    svg() {
      return d3.select('#geneOverview')
    },
    onBrush({ selection }: D3BrushEvent<any>) {
      const [x0, x1] = (selection as [number, number])
        .map(this.xScale.invert)
        .map(Math.round)
      this.updateBrushLabels(x0, x1)
    },
    onBrushEnd(event: D3BrushEvent<any>) {
      const { selection } = event

      // Selection of single point yields null.
      if (!selection) {
        // We determine the clicked x position ourselves.
        const [xPos] = d3.pointer(event, this.svg().node())
        const x0 = Math.round(this.xScale.invert(xPos))
        this.positionRegion = [x0, x0]
        return
      }

      const [x0, x1] = (selection as [number, number])
        .map(this.xScale.invert)
        .map(Math.round)
      this.positionRegion = [x0, x1]
    },
    updateBrushLabels(x0: number, x1: number) {
      if (x0 === x1) {
        this.updateBrushLabel('left', null)
        this.updateBrushLabel('center', x0)
        this.updateBrushLabel('right', null)
      } else {
        this.updateBrushLabel('left', x0)
        this.updateBrushLabel('center', null)
        this.updateBrushLabel('right', x1)
      }
    },
    updateBrushLabel(side: 'left' | 'right' | 'center', value: number | null) {
      const elem = this.svg().selectAll(`.brush-labels-${side}`)

      if (value) {
        elem
          .datum(value)
          .attr('x', this.xScale(value))
          .text((d) => d)
      } else {
        elem.text('')
      }
    },
    drawBrush() {
      // Initalize brush.
      const brush = d3
        .brushX()
        .extent([
          [this.margin.left, this.margin.top - this.brushExtendTop],
          [
            this.svgWidth - this.margin.right,
            this.svgHeight - this.margin.bottom,
          ],
        ])
        // Disable keyboard modifiers such as alt, meta, etc.
        // See https://github.com/d3/d3-brush#readme
        .keyModifiers(false)

      // Append brush.
      const brushGroup = this.svg().append('g').attr('class', 'brush')

      // Append brush labels.
      const svgContextLabels = this.svg()
        .append('g')
        .attr('class', 'brush-labels')
        .attr(
          'transform',
          'translate(0, ' + (this.margin.top - this.brushExtendTop) + ')'
        )

      svgContextLabels
        .append('text')
        .attr('class', 'brush-labels-left')
        .attr('y', -2)
        .style('text-anchor', 'end')

      svgContextLabels
        .append('text')
        .attr('class', 'brush-labels-center')
        .attr('y', -2)
        .style('text-anchor', 'middle')

      svgContextLabels
        .append('text')
        .attr('class', 'brush-labels-right')
        .attr('y', -2)
        .style('text-anchor', 'start')

      brushGroup
        .call(brush)
        .call(brush.move, this.positionRegion.map(this.xScale))

      this.updateBrushLabels(this.positionRegion[0], this.positionRegion[1])

      brush.on('end', this.onBrushEnd)
      brush.on('start brush', this.onBrush)
    },
    drawExons() {
      this.svg()
        .append('path')
        .datum(this.allScores)
        .attr('class', 'exons')
        .attr(
          'd',
          d3
            .area<Score>()
            .x((d) => this.xScale(d.x))
            .y0(this.yScale(0))
            .y1((d) => this.yScale(d.y))
            .curve(d3.curveMonotoneX)
        )
    },
    drawAxes() {
      // Append axes.
      this.svg()
        .append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(' + this.margin.left + ',0)')
        .call(d3.axisLeft(this.yScale).ticks(2).tickSizeOuter(0))

      this.svg()
        .append('g')
        .attr('class', 'x-axis')
        .attr(
          'transform',
          'translate(0,' + (this.svgHeight - this.margin.bottom) + ')'
        )
        .call(d3.axisBottom(this.xScale).tickValues(this.ticksXdomain))
    },
    draw() {
      // Remove all old child elements from SVG.
      this.svg().html('')

      this.drawExons()
      this.drawBrush()
      this.drawAxes()
    },
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(this.onResize)
    this.resizeObserver.observe(this.$el)

    this.draw()
  },
  unmounted() {
    this.resizeObserver?.disconnect()
  },
  watch: {
    positionRegion() {
      this.draw()
    },
  },
}
</script>

<template>
  <ACard
    title="Gene overview"
    :bordered="false"
    size="small"
    class="gene-overview"
  >
    <svg :width="svgWidth" :height="svgHeight" id="geneOverview"></svg>
  </ACard>
</template>

<style lang="scss">
@import '@/assets/colors.module.scss';

#geneOverview {
  vertical-align: bottom;
}

.gene-overview {
  .brush .selection {
    stroke-width: 0;
    fill: $hover;
    fill-opacity: 0.3;
  }

  .exons {
    fill: $gray-3;
    stroke: $gray-7;
    stroke-width: 0.5;
  }

  .brush-labels {
    font-size: 9px;
    fill: $hover;
  }

  .tick {
    font-size: 8px !important;
  }
}
</style>
