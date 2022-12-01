<script lang="ts">
import * as d3 from 'd3'
import { range } from 'lodash'
import { useDataStore } from '@/stores/data'
import { mapState } from 'pinia'
import { CELL_SIZE } from '@/config'

import LoadingBox from '@/components/LoadingBox.vue'
import type { AlignedPosition, Nucleotide } from '@/types'

export default {
  name: 'Heatmap',
  components: {
    LoadingBox,
  },
  data() {
    return {
      customNode: document.createElement('custom:node'),
      mutationObserver: null as MutationObserver | null,
    }
  },
  computed: {
    ...mapState(useDataStore, [
      'sequenceCount',
      'selectedRegion',
      'alignedPositions',
      'geneLength',
      'nucleotideColor',
    ]),
    hasAllData(): boolean {
      return this.sequenceCount !== 0
    },
    examples(): number[] {
      const [start, end] = this.selectedRegion
      return range(start, end + 1)
    },
    width(): number {
      return this.examples.length * CELL_SIZE
    },
    height(): number {
      return this.sequenceCount * CELL_SIZE
    },
    cells(): AlignedPosition[] {
      const [start, end] = this.selectedRegion

      const result = this.alignedPositions.filter((_value, index) => {
        const rowPosition = (index % this.geneLength) + 1
        return rowPosition >= start && rowPosition <= end
      })

      return result
    },
  },
  methods: {
    context() {
      return d3
        .select<HTMLCanvasElement, any>('#heatmap')
        .node()!
        .getContext('2d')
    },
    cellX({ position }: AlignedPosition) {
      const [start] = this.selectedRegion
      return (position - start) * CELL_SIZE
    },
    cellY({ index }: AlignedPosition) {
      return Math.floor(index / this.geneLength) * CELL_SIZE
    },
    drawCells() {
      if (!this.hasAllData) return

      console.time('drawCells')

      const selection = d3
        .select(this.customNode)
        .selectAll('c')
        .data<AlignedPosition>(this.cells, (d) => (d as AlignedPosition).index)

      selection
        .enter()
        .append('c')
        .attr('nucleotide', (d) => d.nucleotide)
        .attr('x', (d) => this.cellX(d))
        .attr('y', (d) => this.cellY(d))
        .merge(selection)
        .transition()
        .ease(d3.easeQuadInOut)
        .duration(2000)
        .attr('nucleotide', (d) => d.nucleotide)
        .attr('x', (d) => this.cellX(d))
        .attr('y', (d) => this.cellY(d))

      selection.exit().remove()

      console.timeEnd('drawCells')
    },
    drawCanvas() {
      // TODO: Draw in chunks so DOM gets released between chunks.
      const canvas = d3
        .select<HTMLCanvasElement, any>('#heatmap')
        .attr('width', this.width)
        .attr('height', this.height)

      const ctx = canvas.node()?.getContext('2d')

      if (!ctx) return

      ctx.save()
      ctx.clearRect(0, 0, this.width, this.height)
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 0.5

      const vis = this

      d3.select(this.customNode)
        .selectAll<HTMLElement, any>('c')
        .each(function () {
          if (!this) return

          const nucleotide = this.getAttribute('nucleotide') as Nucleotide
          const x = parseInt(this.getAttribute('x') as string)
          const y = parseInt(this.getAttribute('y') as string)

          ctx.fillStyle = vis.nucleotideColor(nucleotide)

          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
          ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE)
        })
      ctx.restore()
    },
  },
  mounted() {
    // https://bl.ocks.org/1Cr18Ni9/75c29c06e02ff80671e37fd30eb8519e
    // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
    this.mutationObserver = new MutationObserver(() => this.drawCanvas())
    this.mutationObserver.observe(this.customNode, {
      attributes: true,
      childList: true,
      subtree: true,
    })
    this.drawCells()
  },
  unmounted() {
    this.mutationObserver?.disconnect()
  },
  watch: {
    hasAllData() {
      this.drawCells()
    },
    selectedRegion() {
      this.drawCells()
    },
  },
}
</script>

<template>
  <div :style="{ width: width + 'px', height: height + 'px' }">
    <canvas
      v-show="hasAllData"
      :width="width"
      :height="height"
      id="heatmap"
    ></canvas>
    <LoadingBox v-show="!hasAllData" />
    <!--
    <a-popover title="Title" visible>
      <template #content>
        <p>Content</p>
        <p>Content</p>
      </template>
    </a-popover>
    -->
  </div>
</template>

<style lang="scss"></style>
