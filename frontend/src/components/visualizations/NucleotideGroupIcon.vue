<script lang="ts">
import type { Nucleotide } from '@/types'
import type { PropType } from 'vue'

type NucleotideCounts = Record<Nucleotide, number>

export default {
  props: {
    nucleotides: {
      type: Array as PropType<Array<Nucleotide>>,
      required: true,
    },
  },
  data() {
    return {
      counts: this.determineCounts(),
    }
  },
  methods: {
    determineCounts() {
      const result: NucleotideCounts = {
        A: 0,
        C: 0,
        G: 0,
        T: 0,
        a: 0,
        c: 0,
        g: 0,
        t: 0,
        '-': 0,
      }

      this.nucleotides.forEach((nucleotide) => {
        result[nucleotide]++
      })

      return result
    },
  },
  updated() {
    this.counts = this.determineCounts()
  },
}
</script>
<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
    <rect width="10" height="10" fill="#4d4d4d" />

    <polygon
      v-if="counts.a + counts.A > 0"
      points="10 0 5 5 0 0 10 0"
      fill="#fb8072"
    />
    <polygon
      v-if="counts.c + counts.C > 0"
      points="10 0 10 10 5 5 10 0"
      fill="#80b1d3"
    />
    <polygon
      v-if="counts.g + counts.G > 0"
      points="10 10 10 10 0 10 5 5 10 10"
      fill="#fdb462"
    />
    <polygon
      v-if="counts.t + counts.T > 0"
      points="5 5 0 10 0 0 0 0 5 5"
      fill="#b3de69"
    />

    <g v-if="counts['-'] > 0">
      <circle cx="5" cy="5" r="2.75" fill="#ffffff" />
      <circle cx="5" cy="5" r="2.5" fill="#4d4d4d" />
      <circle cx="5" cy="5" r="1.5" fill="#ffffff" />
    </g>
  </svg>
</template>
