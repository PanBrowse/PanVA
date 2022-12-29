<script lang="ts">
import { mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'

import { CELL_THEMES } from '@/config'

import SidebarItem from '@/components/common/SidebarItem.vue'

export default {
  components: {
    SidebarItem,
  },
  computed: {
    ...mapWritableState(useDataStore, ['cellTheme', 'transitionsEnabled']),
    cellThemes() {
      return CELL_THEMES
    },
  },
}
</script>

<template>
  <SidebarItem title="View options">
    <a-form
      layout="horizontal"
      :labelCol="{ span: 8 }"
      :wrapperCol="{ span: 16 }"
      class="view-options"
    >
      <a-form-item label="Color scheme">
        <a-select v-model:value="cellTheme" :dropdownMatchSelectWidth="false">
          <a-select-option
            v-for="(theme, id) in cellThemes"
            :value="id"
            v-bind:key="id"
          >
            {{ theme.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item
        label="Transitions"
        extra="Disable for improved performance on slower computers."
      >
        <a-switch size="small" v-model:checked="transitionsEnabled" />
      </a-form-item>
    </a-form>
  </SidebarItem>
</template>

<style lang="scss">
.view-options {
  .ant-form-item {
    margin-bottom: 8px;
  }
}
</style>
