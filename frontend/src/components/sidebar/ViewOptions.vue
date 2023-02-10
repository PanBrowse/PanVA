<script lang="ts">
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { naturalSort } from '@/helpers/sorting'
import { CELL_THEMES } from '@/constants'

import SidebarItem from '@/components/common/SidebarItem.vue'
import { useConfigStore } from '@/stores/config'

import { groupName } from '@/helpers/groupName'
import type { mRNAid, Reference } from '@/types'
import {
  Form,
  FormItem,
  Select,
  SelectOptGroup,
  SelectOption,
  Switch,
} from 'ant-design-vue'

type SortOption = {
  label: string
  isDisabled?: boolean
  // Groups should have a unique value too.
  value: string
  // Having options means this is a group.
  options?: Omit<SortOption, 'options'>[]
}

export default {
  components: {
    AForm: Form,
    AFormItem: FormItem,
    ASelect: Select,
    ASelectOption: SelectOption,
    ASelectOptGroup: SelectOptGroup,
    ASwitch: Switch,
    SidebarItem,
  },
  computed: {
    ...mapState(useDataStore, [
      'coreSNP',
      'dendroCustom',
      'filteredPositions',
      'groups',
      'mrnaIds',
      'mrnaIdsLookup',
      'reference',
      'sorting',
    ]),
    ...mapWritableState(useDataStore, [
      'cellTheme',
      'positionFilter',
      'reference',
      'transitionsEnabled',
      'tree',
    ]),
    ...mapState(useConfigStore, ['filters', 'metadata']),
    referenceValue(): string | undefined {
      if (!this.reference) return undefined

      if (this.reference.type === 'group') {
        return `group:${this.reference.id}`
      }

      if (this.reference.type === 'data') {
        return `data:${this.reference.dataIndex}`
      }

      return undefined
    },
    referenceMrnaIdOptions(): [mRNAid, number][] {
      return naturalSort(this.mrnaIds).map((mrnaId) => [
        mrnaId,
        this.mrnaIdsLookup[mrnaId],
      ])
    },
    sortValue(): string {
      if (this.sorting.name === 'metadata') {
        return `metadata:${this.sorting.field}`
      }
      return this.sorting.name
    },
    defaultSortPosition(): number {
      return this.filteredPositions[0] || 1
    },
    sortOptions(): SortOption[] {
      const sortPosition =
        this.sorting.name === 'position'
          ? this.sorting.position
          : this.defaultSortPosition

      const options: SortOption[] = [
        {
          label: 'Tree',
          value: 'tree',
          options: [
            { value: 'dendroDefault', label: 'Dendrogram' },
            {
              value: 'dendroCustom',
              label: 'Custom dendrogram',
              isDisabled: !this.dendroCustom,
            },
            { value: 'coreSNP', label: 'CoreSNP', isDisabled: !this.coreSNP },
          ],
        },
        { value: 'mrnaId', label: 'mRNA id' },
        { value: 'position', label: `Nucleotide (pos ${sortPosition})` },
      ]

      const metadataSortOptions: SortOption[] = this.metadata.map(
        ({ field, label }) => ({
          value: `metadata:${field}`,
          label,
        })
      )

      if (metadataSortOptions.length) {
        options.push({
          value: 'metadata',
          label: 'Metadata',
          options: metadataSortOptions,
        })
      }

      return options
    },
    cellThemeOptions() {
      return CELL_THEMES
    },
  },
  methods: {
    ...mapActions(useDataStore, ['changeSorting']),
    groupName,
    onReferenceChange(value: any) {
      if (value) {
        const [type, indexString] = value.split(':')
        const index = parseInt(indexString)

        if (type === 'group') {
          this.reference = {
            type: 'group',
            id: index,
          } as Reference
        }
        if (type === 'data') {
          this.reference = {
            type: 'data',
            dataIndex: index,
          } as Reference
        }
      } else {
        this.reference = null
      }
    },
    onSortChange(value: any) {
      if (value === 'position') {
        this.changeSorting({
          name: 'position',
          position: this.defaultSortPosition,
        })
      } else if (value.startsWith('metadata:')) {
        const field = value.split(':')[1]

        this.changeSorting({
          name: 'metadata',
          field: field,
        })
      } else {
        this.changeSorting({
          name: value as any,
        })
      }
    },
  },
}
</script>

<template>
  <SidebarItem title="View options">
    <AForm
      layout="horizontal"
      :labelCol="{ span: 8 }"
      :wrapperCol="{ span: 16 }"
      class="view-options"
    >
      <AFormItem label="Filter positions">
        <ASelect
          :dropdownMatchSelectWidth="false"
          v-model:value="positionFilter"
        >
          <ASelectOption value="all">All</ASelectOption>
          <ASelectOption value="variable">Variable</ASelectOption>
          <ASelectOption value="informative">Informative</ASelectOption>
          <ASelectOption
            :value="filter.field"
            v-for="filter in filters"
            v-bind:key="filter.field"
          >
            {{ filter.label }}
          </ASelectOption>
        </ASelect>
      </AFormItem>

      <AFormItem label="Sorting">
        <ASelect
          :dropdownMatchSelectWidth="false"
          v-model:value="sortValue"
          @change="onSortChange"
        >
          <template v-for="option in sortOptions" v-bind:key="option.value">
            <ASelectOptGroup :label="option.label" v-if="option.options">
              <ASelectOption
                v-for="suboption in option.options"
                :value="suboption.value"
                :disabled="suboption.isDisabled"
                v-bind:key="suboption.value"
              >
                {{ suboption.label }}
              </ASelectOption>
            </ASelectOptGroup>
            <ASelectOption
              v-else
              :value="option.value"
              :disabled="option.isDisabled"
            >
              {{ option.label }}
            </ASelectOption>
          </template>
        </ASelect>
      </AFormItem>

      <AFormItem label="Tree">
        <ASelect :dropdownMatchSelectWidth="false" v-model:value="tree">
          <ASelectOption value="dendroDefault">Dendrogram</ASelectOption>
          <ASelectOption value="dendroCustom" :disabled="!dendroCustom">
            Custom dendrogram
          </ASelectOption>
          <ASelectOption value="coreSNP">CoreSNP</ASelectOption>
        </ASelect>
      </AFormItem>

      <AFormItem label="Reference">
        <ASelect
          show-search
          :dropdownMatchSelectWidth="false"
          v-model:value="referenceValue"
          @change="onReferenceChange"
          placeholder="None"
          allowClear
        >
          <ASelectOptGroup label="Groups" v-if="groups.length !== 0">
            <ASelectOption
              v-for="group in groups"
              :value="`group:${group.id}`"
              v-bind:key="group.id"
            >
              {{ groupName(group) }}
            </ASelectOption>
          </ASelectOptGroup>

          <ASelectOption
            v-for="[mrnaId, dataIndex] in referenceMrnaIdOptions"
            :value="`data:${dataIndex}`"
            v-bind:key="dataIndex"
          >
            {{ mrnaId }}
          </ASelectOption>
        </ASelect>
      </AFormItem>

      <AFormItem label="Color scheme">
        <ASelect v-model:value="cellTheme" :dropdownMatchSelectWidth="false">
          <ASelectOption
            v-for="(theme, id) in cellThemeOptions"
            :value="id"
            v-bind:key="id"
          >
            {{ theme.name }}
          </ASelectOption>
        </ASelect>
      </AFormItem>

      <AFormItem
        label="Transitions"
        extra="Disable for improved performance on slower computers."
      >
        <ASwitch size="small" v-model:checked="transitionsEnabled" />
      </AFormItem>
    </AForm>
  </SidebarItem>
</template>

<style lang="scss">
.view-options {
  .ant-form-item {
    margin-bottom: 8px;
  }
}
</style>
