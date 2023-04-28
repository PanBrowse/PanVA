<script lang="ts">
import * as d3 from 'd3'
import { mapActions, mapState } from 'pinia'

import SidebarItem from '@/components/SidebarItem.vue'
import { naturalCompare, numberCompare } from '@/helpers/sorting'
import { useGeneSetStore } from '@/stores/geneSet'

export default {
  components: {
    SidebarItem,
  },
  computed: {
    ...mapState(useGeneSetStore, ['groupInfo', 'homologyGroups']),
    colorScale() {
      return d3
        .scaleOrdinal()
        .domain(this.homologyGroups)
        .range(d3.schemeCategory10)
    },
  },
  mounted() {
    console.log('group info from side', this.groupInfo)

    const homologies = this.groupInfo.map((d) => d.homology_id)

    const occurrences = homologies.reduce(function (acc, curr) {
      return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc
    }, {})

    const homologyOcc = []

    this.homologyGroups.forEach((key) => {
      homologyOcc.push({ homology_id: key, count: occurrences[key] })
    })

    console.log(homologyOcc)
    const homologyOccSorted = [...homologyOcc].sort((a, b) => b.count - a.count)

    console.log(homologyOccSorted)
    console.log(
      'colorScale',
      this.colorScale.domain(),
      this.colorScale.range(),
      d3.schemeCategory10
    )

    this.svgWidth = 330
    this.svgHeight = 120

    d3.select('#homology-count')
      .append('g')
      .attr('transform', 'translate(' + 0 + ',' + 0 + ')')

    // Add Y axis
    var y = d3.scaleLinear().domain([0, 40]).range([this.svgHeight, 0])

    // d3.select('#homology-count')
    //   .append('g')
    //   .attr('transform', 'translate(20,' + 30 + ')')
    //   .call(d3.axisLeft(y))
    //   .call((g) => g.select('.domain').remove())
    //   .call((g) => g.selectAll('line').attr('stroke', '#c0c0c0'))
    //   .call((g) => g.selectAll('text').attr('fill', '#c0c0c0'))
    //   .selectAll('text')
    //   .attr('transform', 'translate(0,0)')
    //   .style('text-anchor', 'middle')

    d3.select('#homology-count')
      .append('text')
      .attr('class', 'axis-title')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', '.71em')
      .attr('fill', 'rgba(0, 0, 0, 0.85)')
      .attr('font-size', '14px')
      .text('# mRNA per homology group')

    // X axis
    var x = d3
      .scaleBand()
      .range([0, this.svgWidth - 20])
      .domain(
        homologyOccSorted.map(function (d) {
          return d.homology_id
        })
      )
      .padding(0.1)

    // d3.select('#homology-count')
    //   .append('g')
    //   .attr('class', 'y-axis')
    //   .attr('transform', 'translate(10,' + 0 + ')')
    //   .call(d3.axisLeft(y))

    //Bars
    d3.select('#homology-count')
      .append('g')
      .attr('transform', 'translate(10,' + 30 + ')')
      .selectAll('myRect')
      .data(homologyOcc)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d.homology_id))
      .attr('y', (d) => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', (d) => this.svgHeight - y(d.count))
      .attr('fill', (d) => this.colorScale(d.homology_id))
      .attr('opacity', 0.8)

    //Labels
    d3.select('#homology-count')
      .selectAll('text.hg-count')
      .data(homologyOcc, (d) => d.homology_id)
      .join(
        (enter) =>
          enter
            .append('text')
            .attr('transform', `translate(${x.bandwidth() / 2},${15})`)
            .attr('class', 'hg-count')
            .attr('dominant-baseline', 'hanging')
            .attr('text-anchor', 'start')
            .attr('y', (d) => y(d.count))
            .attr('font-size', '12px')
            .attr('fill', '#c0c0c0')
            .attr('x', function (d) {
              return x(d.homology_id)
            })
            .attr('dy', 1)
            .attr('dx', 2)
            .text((d) => d.count),

        (update) => update,

        (exit) => exit.remove()
      )
  },
}
</script>

<template>
  <SidebarItem title="Statistics">
    <div id="content-hg">
      <svg id="homology-count" :width="330"></svg>
    </div>
  </SidebarItem>
</template>
