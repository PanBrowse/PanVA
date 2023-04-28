<template>
  <div id="content">
    <svg id="test" width="1000px" height="500px"></svg>
  </div>
</template>

<script lang="ts">
import { ConsoleSqlOutlined } from '@ant-design/icons-vue'
import * as d3 from 'd3'

export default {
  name: 'Density',
  components: {},
  computed: {},
  methods: {},
  created() {},
  mounted() {
    this.svgWidth = document.getElementById('content').offsetWidth

    this.svgHeight =
      document.getElementById('content').offsetHeight *
      this.svgHeightScaleFactor

    const margin = { top: 20, right: 30, bottom: 30, left: 40 }

    const height = 500
    const width = 1000

    const data = [
      79, 54, 74, 62, 85, 55, 88, 85, 51, 85, 54, 84, 78, 47, 83, 52, 62, 84,
      52, 79, 51, 47, 78, 69, 74, 83, 55, 76, 78, 79, 73, 77, 66, 80, 74, 52,
      48, 80, 59, 90, 80, 58, 84, 58, 73, 83, 64, 53, 82, 59, 75, 90, 54, 80,
      54, 83,
    ]

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data))
      .nice()
      .range([margin.left, width - margin.right])

    const thresholds = x.ticks(40)

    const bins = d3.bin().domain(x.domain()).thresholds(thresholds)(data)

    function kde(kernel, thresholds, data) {
      return thresholds.map((t) => [t, d3.mean(data, (d) => kernel(t - d))])
    }

    function epanechnikov(bandwidth) {
      return (x) =>
        Math.abs((x /= bandwidth)) <= 1 ? (0.75 * (1 - x * x)) / bandwidth : 0
    }

    const density = kde(epanechnikov(4), thresholds, data)
    console.log('density', density)

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (d) => d.length) / data.length])
      .range([height - margin.bottom, margin.top])

    const line = d3
      .line()
      .curve(d3.curveBasis)
      .x((d) => x(d[0]))
      .y((d) => y(d[1]))

    const xAxis = (g) =>
      g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .call((g) =>
          g
            .append('text')
            .attr('x', width - margin.right)
            .attr('y', -6)
            .attr('fill', '#000')
            .attr('text-anchor', 'end')
            .attr('font-weight', 'bold')
            .text(data.title)
        )

    const yAxis = (g) =>
      g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(null, '%'))
        .call((g) => g.select('.domain').remove())

    d3.select('#test')
      .append('g')
      .attr('fill', '#bbb')
      .selectAll('rect')
      .data(bins)
      .join('rect')
      .attr('x', (d) => x(d.x0) + 1)
      .attr('y', (d) => y(d.length / data.length))
      .attr('width', (d) => x(d.x1) - x(d.x0) - 1)
      .attr('height', (d) => y(0) - y(d.length / data.length))

    d3.select('#test')
      .append('path')
      .datum(density)
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('d', line)

    d3.select('#test').append('g').call(xAxis)

    d3.select('#test').append('g').call(yAxis)
  },
  watch: {},
}
</script>

<style lang="scss">
@import '@/assets/colors.module.scss';
</style>
