<script lang="ts">
import { mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { sortBy } from 'lodash'
import type { Homology } from '@/types'

import LoadingBox from '@/components/LoadingBox.vue'

export default {
  name: 'HomologySelect',
  components: {
    LoadingBox,
  },
  computed: {
    ...mapState(useDataStore, ['homologies']),
    ...mapWritableState(useDataStore, ['homologyId']),
    sortedHomologies(): Homology[] {
      return sortBy(this.homologies, 'name')
    },
  },
}
</script>

<template>
  <div>
    <h3>Homology</h3>

    <a-select
      ref="select"
      v-model:value="homologyId"
      style="width: 100%"
      v-if="homologies.length !== 0"
    >
      <a-select-option
        v-for="item in sortedHomologies"
        :value="item.homology_id"
        v-bind:key="item.homology_id"
      >
        {{ item.name }}
      </a-select-option>
    </a-select>
    <LoadingBox :height="32" v-else />
  </div>
</template>
