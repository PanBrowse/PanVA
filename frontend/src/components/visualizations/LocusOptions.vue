<script lang="ts">
import { mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { sortBy } from 'lodash'

export default {
  computed: {
    ...mapState(useDataStore, ['mrnaIds']),
    ...mapWritableState(useDataStore, ['referenceMrnaId']),
    options() {
      return sortBy(this.mrnaIds)
    },
  },
}
</script>

<template>
  <div>
    <a-form>
      <!-- <a-form-item :colon="false">
        <template #label>
          <close-circle-outlined />
        </template> -->
      <a-form-item label="Reference">
        <a-select
          show-search
          :dropdownMatchSelectWidth="false"
          ref="select"
          v-model:value="referenceMrnaId"
          size="small"
          style="width: 180px"
          placeholder="None"
          allowClear
        >
          <a-select-option v-for="id in options" :value="id" v-bind:key="id">
            {{ id }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </div>
</template>
