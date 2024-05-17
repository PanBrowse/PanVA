<template>
  <div
    id="contentChr"
    style="
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: space-between;
    "
  >
    <SequencesDetails
      v-bind:key="`chr${chrFocus}_focus`"
      :chromosomeNr="chrFocus"
      :name="`chr${chrFocus}_focus`"
      :data="getChromosome(chrFocus)"
      :dataGenes="getGroupInfo(chrFocus)"
      :dataMin="dataMin"
      :dataMax="dataMax"
      :maxGC="GCcontentMax"
      :minGC="GCcontentMin"
    />
  </div>
</template>

<script lang="ts">
import * as d3 from 'd3'
import { mapActions, mapState } from 'pinia'

import { filterOutliers } from '@/helpers/chromosome'
import { useGeneSetStore } from '@/stores/geneSet'
import { useGlobalStore } from '@/stores/global'
import type { SequenceMetrics } from '@/types'

import SequencesDetails from './SequencesDetails.vue'

export default {
  components: {
    SequencesDetails,
  },
  data: () => ({
    svgWidth: 0,
    svgHeight: 0,
    svgWidthScaleFactor: 1,
    svgHeightScaleFactor: 1,
    margin: { top: 10, bottom: 10, right: 10, left: 10, yAxis: 40 },
    transitionTime: 750,
  }),
  computed: {
    ...mapState(useGeneSetStore, [
      'sequences',
      'groupInfo',
      'chromosomes',
      'numberOfChromosomes',
      'chrFocus',
      'chromosomeLookup',
      'groupInfoLookup',
      'sortedGroupInfoLookup',
      'sequenceIdLookup',
    ]),

    dataMax() {
      return d3.max(this.sequences, (d) => d.sequence_length)
    },
    dataMin() {
      return d3.min(this.sequences, (d) => d.sequence_length)
    },
    GCfiltered() {
      const CGcontentArray = this.sequences.map((d) => d.GC_content_percent)
      return filterOutliers(CGcontentArray)
    },
    GCcontentMax() {
      return d3.max(this.GCfiltered, (d) => d)
    },
    GCcontentMin() {
      return d3.min(this.GCfiltered, (d) => d)
    },
  },
  methods: {
    ...mapActions(useGeneSetStore, [
      'getChromosome',
      'getGroupInfo',
      'changeSorting',
    ]),
  },
  created() {},
  mounted() {
    this.svgWidth =
      document.getElementById('content').offsetWidth * this.svgWidthScaleFactor

    this.svgHeight =
      document.getElementById('content').offsetHeight *
      this.svgHeightScaleFactor
  },
  watch: {},
}
</script>

<style lang="scss">
@import '@/assets/colors.module.scss';
</style>
