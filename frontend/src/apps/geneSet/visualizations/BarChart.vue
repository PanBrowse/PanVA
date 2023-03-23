<template>
  <div :id="'container_' + genomeNr" class="svg-container" align="center">
    <h1>{{ title }}</h1>
    <svg
      v-if="redrawToggle === true"
      :width="svgWidth + 2 * paddingSide"
      :height="svgHeight + xAxisHeight + xAxisPaddingBottom"
    >
      <g :id="'xAxis_' + genomeNr"></g>
      <g
        :transform="
          'translate(' +
          paddingSide +
          ',' +
          (xAxisHeight + xAxisPaddingBottom) +
          ')'
        "
      >
        <rect
          v-for="item in data"
          class="bar-positive"
          :key="item[yKey]"
          :y="yScale(item[yKey])"
          :x="xScale(0)"
          :height="yScale.bandwidth()"
          :width="0"
        ></rect>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
import { max, min } from 'd3-array'
import { scaleBand, scaleLinear } from 'd3-scale'
import { selectAll } from 'd3-selection'
// import { transition } from 'd3-transition'

export default {
  name: 'BarChart',
  props: {
    title: String,
    genomeNr: String,
    xKey: String,
    yKey: String,
    data: Array,
  },
  mounted() {
    let container_name = 'container_' + this.genomeNr

    console.log('container name', container_name, this.title)

    this.svgWidth =
      document.getElementById(container_name).offsetWidth *
      this.svgWidthScaleFactor

    this.svgHeight =
      document.getElementById(container_name).offsetHeight *
      this.svgHeightScaleFactor

    this.AddResizeListener()
    this.drawBars()
  },
  data: () => ({
    svgWidth: 0,
    svgWidthScaleFactor: 0.75,
    svgHeight: 0,
    svgHeightScaleFactor: 0.2,
    xAxisHeight: 20,
    xAxisPaddingBottom: 5,
    yScaleGutter: 0.2,
    paddingSide: 10,
    redrawToggle: true,
  }),
  methods: {
    drawBars() {
      selectAll('rect')
        .data(this.data)
        // .transition()
        // .delay((d, i) => {
        //   return i * 150
        // })
        // .duration(300)
        .attr('y', (d) => {
          return this.yScale(d[this.yKey])
        })
        .attr('width', (d) => {
          return this.xScale(d[this.xKey])
        })

      let axisName = '#xAxis_' + this.genomeNr

      d3.select(axisName)
        .attr(
          'transform',
          'translate(' + this.paddingSide + ',' + this.xAxisHeight + ')'
        )
        .call(d3.axisTop(this.xScale))
        .selectAll('text')
        .style('text-anchor', 'middle')
    },
    AddResizeListener() {
      // redraw the chart 300ms after the window has been resized

      let container_name = 'container_' + this.genomeNr

      window.addEventListener('resize', () => {
        this.$data.redrawToggle = false
        setTimeout(() => {
          this.$data.redrawToggle = true
          this.$data.svgWidth =
            document.getElementById(container_name).offsetWidth *
            this.$data.svgWidthScaleFactor
          this.$data.svgHeight =
            document.getElementById(container_name).offsetHeight *
              this.$data.svgHeightScaleFactor +
            this.$data.xAxisHeight
          this.drawBars()
        }, 300)
      })
    },
  },
  computed: {
    dataMax() {
      return max(this.data, (d) => {
        return d[this.xKey]
      })
    },
    dataMin() {
      return min(this.data, (d) => {
        return d[this.xKey]
      })
    },
    xScale() {
      return scaleLinear()
        .domain([this.dataMin > 0 ? 0 : this.dataMin, this.dataMax])
        .rangeRound([0, this.svgWidth])
    },
    yScale() {
      return scaleBand()
        .rangeRound([0, this.svgHeight])
        .domain(
          this.data.map((d) => {
            return d[this.yKey]
          })
        )
        .padding(this.yScaleGutter)
    },
  },
}
</script>

<style lang="scss">
@import '@/assets/colors.module.scss';

.bar-positive {
  fill: $gray-9;
  transition: r 0.2s ease-in-out;
}

.bar-positive:hover {
  fill: $gray-7;
}

.svg-container {
  display: inline-block;
  position: relative;
  width: 100%;
  height: 100vh;
  padding-bottom: 1%;
  vertical-align: top;
  overflow: hidden;
}
</style>
