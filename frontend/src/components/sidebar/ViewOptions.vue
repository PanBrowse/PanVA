<script lang="ts">
import { mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'

import { CELL_THEMES } from '@/config'

export default {
  computed: {
    ...mapWritableState(useDataStore, ['cellTheme']),
    cellThemes() {
      return CELL_THEMES
    },
  },
}
</script>

<template>
  <div>
    <a-divider />

    <h3>Locus view</h3>

    <a-form>
      <a-form-item label="Theme">
        <a-select ref="select" v-model:value="cellTheme" style="width: 100%">
          <a-select-option
            v-for="(theme, id) in cellThemes"
            :value="id"
            v-bind:key="id"
          >
            {{ theme.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </div>
</template>
