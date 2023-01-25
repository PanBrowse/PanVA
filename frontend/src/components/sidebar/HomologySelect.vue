<script lang="ts">
import { mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'

import LoadingBox from '@/components/common/LoadingBox.vue'
import SidebarItem from '@/components/common/SidebarItem.vue'

type Option = {
  value: number
  label: string
}

export default {
  components: {
    LoadingBox,
    SidebarItem,
  },
  computed: {
    ...mapState(useDataStore, ['homologies']),
    ...mapWritableState(useDataStore, ['homologyId']),
  },
  methods: {
    filterOption(input: string, option: Option) {
      return option.label.toLowerCase().includes(input.toLowerCase())
    },
  },
}
</script>

<template>
  <SidebarItem title="Homology">
    <a-select
      show-search
      :dropdownMatchSelectWidth="false"
      :filterOption="filterOption"
      v-model:value="homologyId"
      style="width: 100%"
      v-if="homologies.length !== 0"
    >
      <a-select-option
        v-for="item in homologies"
        :value="item.homology_id"
        :label="item.name"
        v-bind:key="item.homology_id"
      >
        {{ item.name }}
      </a-select-option>
    </a-select>
    <LoadingBox :height="32" v-else />
  </SidebarItem>
</template>
