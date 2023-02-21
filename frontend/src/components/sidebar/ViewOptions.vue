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
  Tag,
  TypographyText,
} from 'ant-design-vue'
import { map, sortBy } from 'lodash'

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
    ATag: Tag,
    ATypographyText: TypographyText,
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
      'sequenceFilters',
      'transitionsEnabled',
      'tree',
      'visibleMetadataColumns',
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
        return `metadata:${this.sorting.column}`
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

      const metadataSortOptions: SortOption[] = sortBy(
        this.metadata,
        'label'
      ).map(({ column, label }) => ({
        value: `metadata:${column}`,
        label,
      }))

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
      return map(CELL_THEMES, ({ name }, key) => ({ value: key, label: name }))
    },
    metadataOptions(): SortOption[] {
      return sortBy(
        this.metadata.map(({ column, label }) => ({
          value: column,
          label,
        })),
        'label'
      )
    },
    filterPositionOptions(): SortOption[] {
      const options = [
        { value: 'all', label: 'All' },
        { value: 'variable', label: 'Variable' },
        { value: 'informative', label: 'Informative' },
      ]
      this.filters.forEach(({ column, label }) =>
        options.push({ value: column, label })
      )
      // Alphabetical, but 'all' always first.
      return sortBy(options, [({ value }) => value !== 'all', 'label'])
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
        const column = value.split(':')[1]

        this.changeSorting({
          name: 'metadata',
          column,
        })
      } else {
        this.changeSorting({
          name: value as any,
        })
      }
    },
    removeSequenceFilter(index: number) {
      this.sequenceFilters.splice(index, 1)
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
          :options="filterPositionOptions"
          show-search
        />
      </AFormItem>

      <AFormItem label="Filter sequences">
        <ATypographyText type="secondary" v-if="sequenceFilters.length === 0">
          None
        </ATypographyText>
        <div class="sequence-filters" v-else>
          <ATag
            closable
            v-for="(filter, index) in sequenceFilters"
            :title="`${filter.label}: ${filter.formattedValue}`"
            v-bind:key="index"
            @close="() => removeSequenceFilter(index)"
          >
            <div>
              {{ filter.label }}: <em>{{ filter.formattedValue }}</em>
            </div>
          </ATag>
        </div>
      </AFormItem>

      <AFormItem label="Sorting">
        <ASelect
          :dropdownMatchSelectWidth="false"
          v-model:value="sortValue"
          @change="onSortChange"
          show-search
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

      <AFormItem label="Metadata">
        <ASelect
          placeholder="0 selected"
          v-model:value="visibleMetadataColumns"
          mode="multiple"
          :options="metadataOptions"
          :dropdownMatchSelectWidth="false"
          :maxTagCount="0"
          show-search
        >
          <template #maxTagPlaceholder="omittedValues">
            {{ omittedValues.length }} selected
          </template>
          <template #tagRender></template>
        </ASelect>
      </AFormItem>

      <AFormItem label="Color scheme">
        <ASelect
          v-model:value="cellTheme"
          :dropdownMatchSelectWidth="false"
          :options="cellThemeOptions"
        />
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

  .sequence-filters {
    padding: 5px 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    overflow: hidden;

    .ant-tag {
      display: inline-grid;
      grid-template-columns: 1fr min-content;
      align-items: center;
      padding: 0 4px 0 7px;

      & > div {
        overflow: hidden;
        text-overflow: ellipsis;
      }

      & > span {
        margin-left: 5px;
        flex: 0 0 auto;
      }
    }
  }
}
</style>
