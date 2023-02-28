<script lang="ts">
import { mapState, mapActions } from 'pinia'
import { useDataStore } from '@/stores/data'

import SidebarItem from '@/components/common/SidebarItem.vue'
import { Divider, Select, Tree, type TreeProps } from 'ant-design-vue'
import { sortBy } from 'lodash'

type Option = {
  value: number
  label: string
  members: number
  alignmentLength: number
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
          if (Array.isArray(value)) {
            value.forEach((val) => values.add(val))
          } else {
            values.add(value)
          }
          map.set(label, values)
        })
      })

      return this.mapToFilterOptions(map)
    },
    treeData(): TreeProps['treeData'] {
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
      /**
       * Converts selected checkboxes into `FilterOption` objects.
       */
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
            // Find at least one metadata record for this homology group that matches the filter.
            metadata?.find((metadata) => {
              if (metadata.label !== label) return false

              if (Array.isArray(metadata.value)) {
                return metadata.value.some((val) => values.includes(val))
              }

              return values.includes(metadata.value)
            })
          )
        )
        .map((homology) => ({
          value: homology.homology_id,
          label: `${homology.homology_id}`,
          members: homology.members,
          alignmentLength: homology.alignment_length,
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
            :tree-data="treeData"
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
      <!--
      <template #option="{ members, alignmentLength, label }">
        {{ label }}
        <span class="select-item-suffix">
          &nbsp;-&nbsp;
          {{ members }} members, length {{ alignmentLength }}
        </span>
      </template>
      -->
    </ASelect>
  </SidebarItem>
</template>

<style lang="scss">
@import '@/assets/colors.module.scss';

.homology-filter-tree {
  padding: 8px;
  max-height: 256px;
  overflow-y: auto;
}

.select-item-suffix {
  color: $gray-7;
}
</style>
