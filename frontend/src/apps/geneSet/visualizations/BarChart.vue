<template>
  <div :id="`container_${this.genomeNr}`" class="svg-container" align="left">
    <!-- <div>
      <h1>G{{ genomeNr }}</h1>
    </div> -->
    <div>
      <!-- <h1>{{ title }}</h1> -->
      <svg
        v-if="redrawToggle === true"
        :width="svgWidth + 2 * paddingSide"
        :height="svgHeight + xAxisHeight + xAxisPaddingBottom"
      >
        <g
          :id="name"
          :transform="
            'translate(' +
            paddingSide +
            ',' +
            (xAxisHeight + xAxisPaddingBottom) +
            ')'
          "
        ></g>
      </svg>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  name: 'BarChart',
  props: {
    title: String,
    name: String,
    genomeNr: String,
    xKey: String,
    yKey: String,
    data: Array,
    dataMinimum: Number,
    dataMaximum: Number,
  },
  mounted() {
    this.svgWidth =
      document.getElementById(this.containerId()).offsetWidth *
      this.svgWidthScaleFactor

    this.svgHeight =
      document.getElementById(this.containerId()).offsetHeight *
      this.svgHeightScaleFactor

    this.AddResizeListener()
    this.draw()
  },
  data: () => ({
    svgWidth: 0,
    svgWidthScaleFactor: 0.95,
    svgHeight: 0,
    svgHeightScaleFactor: 0.95,
    xAxisHeight: 0,
    xAxisPaddingBottom: 5,
    yScaleGutter: 0.3,
    paddingSide: 10,
    redrawToggle: true,
  }),
  methods: {
    svg() {
      return d3.select(`#${this.name}`)
    },
    axis() {
      return d3.select(`#xAxis_${this.genomeNr}`)
    },
    containerId() {
      return `container_${this.genomeNr}`
    },
    draw() {
      this.svg()
        .selectAll('rect.bar-chr')
        .data(this.data, (d) => d.index)
        .join(
          (enter) =>
            enter
              .append('rect')
              .attr('class', 'bar-chr')
              .attr('x', this.xScale(0))
              .attr('y', (d) => {
                return this.yScale(d[this.yKey])
              })
              .attr('width', (d) => {
                return this.xScale(d[this.xKey])
              })
              .attr('height', this.yScale.bandwidth()),

          (update) =>
            update
              .attr('x', this.xScale(0))
              .attr('y', (d) => {
                return this.yScale(d[this.yKey])
              })
              .attr('width', (d) => {
                return this.xScale(d[this.xKey])
              })
              .attr('height', this.yScale.bandwidth()),

          (exit) => exit.remove()
        )

      //   this.axis()
      //     .attr(
      //       'transform',
      //       'translate(' + this.paddingSide + ',' + this.xAxisHeight + ')'
      //     )
      //     .call(d3.axisTop(this.xScale))
      //     .selectAll('text')
      //     .style('text-anchor', 'middle')
    },
    AddResizeListener() {
      // redraw the chart 300ms after the window has been resized

      window.addEventListener('resize', () => {
        this.$data.redrawToggle = false
        setTimeout(() => {
          this.$data.redrawToggle = true
          this.$data.svgWidth =
            document.getElementById(this.containerId()).offsetWidth *
            this.$data.svgWidthScaleFactor
          this.$data.svgHeight =
            document.getElementById(this.containerId()).offsetHeight *
              this.$data.svgHeightScaleFactor +
            this.$data.xAxisHeight
          this.draw()
        }, 300)
      })
    },
  },
  computed: {
    dataMax() {
      return d3.max(this.data, (d) => {
        return d[this.xKey]
      })
    },
    dataMin() {
      return d3.min(this.data, (d) => {
        return d[this.xKey]
      })
    },
    // xScale() {
    //   return d3
    //     .scaleLinear()
    //     .domain([this.dataMin > 0 ? 0 : this.dataMin, this.dataMax])
    //     .rangeRound([0, this.svgWidth])
    // },
    xScale() {
      return d3
        .scaleLinear()
        .domain([this.dataMinimum > 0 ? 0 : this.dataMinimum, this.dataMaximum])
        .rangeRound([0, this.svgWidth])
    },
    yScale() {
      return d3
        .scaleBand()
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

// .bar-chr {
//   fill: $gray-9;
//   transition: r 0.2s ease-in-out;
// }

// .bar-chr:hover {
//   fill: $gray-7;
// }

.svg-container {
  display: inline-block;
  //   background-color: $gray-1;
  position: relative;
  width: 100%;
  height: 100%;
  padding-bottom: 1%;
  padding-top: 1%;
  vertical-align: top;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
</style>
