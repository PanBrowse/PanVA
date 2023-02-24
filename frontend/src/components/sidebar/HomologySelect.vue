<script lang="ts">
import { mapState, mapActions } from 'pinia'
import { useDataStore } from '@/stores/data'

import SidebarItem from '@/components/common/SidebarItem.vue'
import { Divider, Select, Tree, type TreeProps } from 'ant-design-vue'
import { sortBy } from 'lodash'
import { homologyName } from '@/helpers/homology'

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
    ...mapState(useDataStore, ['homologies', 'homologyId']),
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
        .map((homology) => ({
          value: homology.homology_id,
          label: homologyName(homology),
        }))
    },
  },
  methods: {
    ...mapActions(useDataStore, ['loadHomologyGroup']),
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
    onHomologySelect(homologyId: any) {
      this.loadHomologyGroup(homologyId)
    },
  },
}
</script>

<template>
  <SidebarItem title="Homology">
    <ASelect
      showSearch
      :dropdownMatchSelectWidth="false"
      :filterOption="filterOption"
      :options="options"
      :value="homologyId"
      @select="onHomologySelect"
      style="width: 100%"
      v-if="homologyId"
    >
      <template #dropdownRender="{ menuNode }">
        <div
          class="homology-filter-tree"
          @mousedown="(e) => e.preventDefault()"
        >
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
  </SidebarItem>
</template>

<style lang="scss">
.homology-filter-tree {
  padding: 8px;
  max-height: 256px;
  overflow-y: auto;
}
</style>
