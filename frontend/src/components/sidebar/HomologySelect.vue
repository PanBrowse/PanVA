<script lang="ts">
import { mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'

import LoadingBox from '@/components/common/LoadingBox.vue'
import SidebarItem from '@/components/common/SidebarItem.vue'
import { Divider, Select, Tree, type TreeProps } from 'ant-design-vue'
import { sortBy } from 'lodash'

type Option = {
  value: number
  label: string
}

type FilterOption = {
  label: string
  values: any[]
}

export default {
  components: {
    ADivider: Divider,
    ASelect: Select,
    ATree: Tree,
    LoadingBox,
    SidebarItem,
    VNodes: (_, { attrs }) => {
      return attrs.vnodes
    },
  },
  data() {
    return {
      expandedKeys: [] as string[],
      checkedKeys: [] as string[],
    }
  },
  computed: {
    ...mapState(useDataStore, ['homologies']),
    ...mapWritableState(useDataStore, ['homologyId']),
    filterOptions(): FilterOption[] {
      const map = new Map<string, Set<any>>()
      this.homologies.forEach(({ metadata }) => {
        metadata?.forEach(({ label, value }) => {
          const values = map.get(label) || new Set()
          values.add(value)
          map.set(label, values)
        })
      })

      return this.mapToFilterOptions(map)
    },
    filterTree(): TreeProps['treeData'] {
      return [
        {
          title: 'Filter by metadata',
          checkable: false,
          key: 'root',
          children: this.filterOptions.map(({ label, values }, index) => ({
            title: label,
            checkable: false,
            key: `${index}`,
            children: values.map((value, valueIndex) => ({
              title: value,
              key: `${index}:${valueIndex}`,
            })),
          })),
        },
      ]
    },
    selectedFilters(): FilterOption[] {
      const map = new Map<string, Set<any>>()

      this.checkedKeys.map((key) => {
        const [index, valueIndex] = key.split(':').map((str) => parseInt(str))
        const { label, values } = this.filterOptions[index]
        const value = values[valueIndex]

        const item = map.get(label) || new Set()
        item.add(value)
        map.set(label, item)
      })

      return this.mapToFilterOptions(map)
    },
    options(): Option[] {
      return this.homologies
        .filter(({ metadata }) =>
          this.selectedFilters.every(({ label, values }) =>
            metadata?.find(
              (metadata) =>
                metadata.label === label && values.includes(metadata.value)
            )
          )
        )
        .map(({ homology_id, name }) => ({
          value: homology_id,
          label: name || `${homology_id}`,
        }))
    },
  },
  methods: {
    filterOption(input: string, option: Option) {
      return option.label.toLowerCase().includes(input.toLowerCase())
    },
    mapToFilterOptions(map: Map<string, Set<any>>): FilterOption[] {
      return sortBy([...map.keys()]).map((label) => {
        const values = sortBy([...map.get(label)!])

        return {
          label,
          values,
        }
      })
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
      :options="options"
      v-model:value="homologyId"
      style="width: 100%"
      v-if="homologies.length !== 0 && homologyId"
    >
      <template #dropdownRender="{ menuNode }">
        <div style="padding: 8px" @mousedown="(e) => e.preventDefault()">
          <ATree
            :tree-data="filterTree"
            v-model:expandedKeys="expandedKeys"
            v-model:checkedKeys="checkedKeys"
            :selectable="false"
            checkable
          >
            <template #title="{ title }">
              {{ title }}
            </template>
          </ATree>
        </div>

        <ADivider style="margin: 0 0 4px" />

        <v-nodes :vnodes="menuNode" />
      </template>
    </ASelect>
    <LoadingBox :height="32" v-else />
  </SidebarItem>
</template>
