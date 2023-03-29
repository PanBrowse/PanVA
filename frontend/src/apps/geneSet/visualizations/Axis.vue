<template>
  <div
    :id="`container_chr${this.chromosome}`"
    class="svg-container-axis"
    align="left"
  >
    <h1>{{ `chr` + chromosome }}</h1>
    <svg
      v-if="redrawToggle === true"
      :width="svgWidth + 2 * paddingSide"
      :height="svgHeight + xAxisHeight + xAxisPaddingBottom"
    >
      <g :id="`xAxis_chr${this.chromosome}`"></g>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  name: 'Axis',
  props: {
    chromosome: String,
    xKey: String,
    data: Array,
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
    svgHeightScaleFactor: 0.1,
    xAxisHeight: 20,
    xAxisPaddingBottom: 0,
    paddingSide: 10,
    redrawToggle: true,
  }),
  methods: {
    axis() {
      return d3.select(`#xAxis_chr${this.chromosome}`)
    },
    containerId() {
      return `container_chr${this.chromosome}`
    },
    draw() {
      this.axis()
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
    xScale() {
      return d3
        .scaleLinear()
        .domain([this.dataMin > 0 ? 0 : this.dataMin, this.dataMax])
        .rangeRound([0, this.svgWidth])
    },
  },
}
</script>

<style lang="scss">
@import '@/assets/colors.module.scss';

.rowHeader {
  width: 10%;
}

// .bar-chr {
//   fill: $gray-9;
//   transition: r 0.2s ease-in-out;
// }

.bar-chr:hover {
  fill: $gray-7;
}

.svg-container-axis {
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
