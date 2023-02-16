<script lang="ts">
import { mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'

import LoadingBox from '@/components/common/LoadingBox.vue'
import SidebarItem from '@/components/common/SidebarItem.vue'
import {
  Divider,
  Select,
  SelectOption,
  Tree,
  type TreeProps,
} from 'ant-design-vue'

type Option = {
  value: number
  label: string
}

const treeData: TreeProps['treeData'] = [
  {
    title: 'parent 1',
    key: '0-0',
    children: [
      {
        title: 'parent 1-0',
        key: '0-0-0',
        disabled: true,
        children: [
          { title: 'leaf', key: '0-0-0-0', disableCheckbox: true },
          { title: 'leaf', key: '0-0-0-1' },
        ],
      },
      {
        title: 'parent 1-1',
        key: '0-0-1',
        children: [{ key: '0-0-1-0', title: 'sss' }],
      },
    ],
  },
]

export default {
  components: {
    ADivider: Divider,
    ASelect: Select,
    ASelectOption: SelectOption,
    ATree: Tree,
    LoadingBox,
    SidebarItem,
    VNodes: (_, { attrs }) => {
      return attrs.vnodes
    },
  },
  data() {
    return {
      expandedKeys: [],
      selectedKeys: [],
      checkedKeys: [],
    }
  },
  computed: {
    ...mapState(useDataStore, ['homologies']),
    ...mapWritableState(useDataStore, ['homologyId']),
    metadata() {
      const options = new Map()
      this.homologies.forEach(({ metadata }) => {
        metadata?.forEach(({ label, value }) => {
          const values = options.get(label) || new Set()
          values.add(value)
          options.set(label, values)
        })
      })
      return options
    },
    treeData() {
      return treeData
    },
  },
  methods: {
    filterOption(input: string, option: Option) {
      return option.label.toLowerCase().includes(input.toLowerCase())
    },
  },
  watch: {
    homologies() {
      console.log(this.metadata)
    },
  },
}
</script>

<template>
  <SidebarItem title="Homology">
    <ASelect
      show-search
      :dropdownMatchSelectWidth="false"
      :filterOption="filterOption"
      v-model:value="homologyId"
      style="width: 100%"
      v-if="homologies.length !== 0 && homologyId"
    >
      <template #dropdownRender="{ menuNode: menu }">
        <div style="padding: 8px" @mousedown="(e) => e.preventDefault()">
          <ATree
            :tree-data="treeData"
            v-model:expandedKeys="expandedKeys"
            v-model:selectedKeys="selectedKeys"
            v-model:checkedKeys="checkedKeys"
            checkable
          >
            <template #title="{ title }">
              {{ title }}
            </template>
          </ATree>
        </div>
        <ADivider style="margin: 4px 0" />
        <v-nodes :vnodes="menu" />
      </template>

      <ASelectOption
        v-for="item in homologies"
        :value="item.homology_id"
        :label="item.name"
        v-bind:key="item.homology_id"
      >
        {{ item.name || item.homology_id }}
      </ASelectOption>
    </ASelect>
    <LoadingBox :height="32" v-else />
  </SidebarItem>
</template>
