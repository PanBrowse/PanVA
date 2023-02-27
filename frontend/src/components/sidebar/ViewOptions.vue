<script lang="ts">
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { naturalSort } from '@/helpers/sorting'
import { CELL_THEMES } from '@/constants'
import { EditOutlined, PushpinOutlined } from '@ant-design/icons-vue'

import SidebarItem from '@/components/common/SidebarItem.vue'
import SequenceFiltersModal from '@/components/sidebar/SequenceFiltersModal.vue'
import { useConfigStore } from '@/stores/config'

import { groupName } from '@/helpers/groupName'
import type { mRNAid, Reference } from '@/types'
import {
  Button,
  Form,
  FormItem,
  Input,
  InputGroup,
  Select,
  SelectOptGroup,
  SelectOption,
  Switch,
  Tooltip,
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
    AButton: Button,
    AForm: Form,
    AFormItem: FormItem,
    AInput: Input,
    AInputGroup: InputGroup,
    ASelect: Select,
    ASelectOptGroup: SelectOptGroup,
    ASelectOption: SelectOption,
    ASwitch: Switch,
    ATooltip: Tooltip,
    EditOutlined,
    PushpinOutlined,
    SequenceFiltersModal,
    SidebarItem,
  },
  data() {
    return {
      showSequenceFilterModal: false,
    }
  },
  computed: {
    ...mapState(useDataStore, [
      'annotations',
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
      'annotationMrnaId',
      'cellTheme',
      'keepSequenceFilters',
      'positionFilter',
      'reference',
      'sequenceFilters',
      'transitionsEnabled',
      'tree',
      'visibleMetadataColumns',
    ]),
    ...mapState(useConfigStore, ['filters', 'metadata']),
    ...mapState(useConfigStore, { configAnnotations: 'annotations' }),
    annotationValue(): string | undefined {
      return this.annotationMrnaId || undefined
    },
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
    cellThemeOptions(): SortOption[] {
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
    annotationOptions(): SortOption[] {
      return naturalSort(map(this.annotations, 'mRNA_id')).map((mrnaId) => ({
        value: mrnaId,
        label: mrnaId,
      }))
    },
    filterSequencesValue(): string | undefined {
      if (this.sequenceFilters.length === 0) return
      if (this.sequenceFilters.length === 1) return '1 filter'
      return `${this.sequenceFilters.length} filters`
    },
  },
  methods: {
    ...mapActions(useDataStore, ['changeSorting']),
    groupName,
    onAnnotationChange(value: any) {
      this.annotationMrnaId = value || null
    },
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
    editSequenceFilters(event: FocusEvent) {
      this.showSequenceFilterModal = true

      const target = event.target as HTMLElement
      target.blur()
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
          showSearch
        />
      </AFormItem>

      <AFormItem label="Filter sequences">
        <AInputGroup compact>
          <AInput
            :value="filterSequencesValue"
            placeholder="None"
            @click="editSequenceFilters"
            @mousedown="(event) => event.preventDefault()"
          />
          <AButton @click="editSequenceFilters">
            <template #icon><EditOutlined /></template>
          </AButton>
          <ATooltip
            title="Keep filter when switching homology groups"
            placement="topRight"
            arrowPointAtCenter
          >
            <AButton
              @click="keepSequenceFilters = !keepSequenceFilters"
              :type="keepSequenceFilters ? 'primary' : 'default'"
            >
              <template #icon><PushpinOutlined /></template>
            </AButton>
          </ATooltip>
        </AInputGroup>
      </AFormItem>

      <AFormItem label="Sorting">
        <ASelect
          :dropdownMatchSelectWidth="false"
          v-model:value="sortValue"
          @change="onSortChange"
          showSearch
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
          showSearch
          :dropdownMatchSelectWidth="false"
          :value="referenceValue"
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

      <AFormItem label="Annotation ref" v-if="configAnnotations.length !== 0">
        <ASelect
          showSearch
          :dropdownMatchSelectWidth="false"
          :value="annotationValue"
          :options="annotationOptions"
          @change="onAnnotationChange"
          :placeholder="`${annotations.length} available`"
          allowClear
          v-if="annotations.length !== 0"
        />
        <AInput v-else placeholder="0 available" style="pointer-events: none" />
      </AFormItem>

      <AFormItem label="Metadata">
        <ASelect
          placeholder="None"
          v-model:value="visibleMetadataColumns"
          mode="multiple"
          :options="metadataOptions"
          :dropdownMatchSelectWidth="false"
          showSearch
        />
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

    <SequenceFiltersModal
      :visible="showSequenceFilterModal"
      @close="showSequenceFilterModal = false"
    />
  </SidebarItem>
</template>

<style lang="scss">
.view-options {
  .ant-form-item {
    margin-bottom: 8px;
  }

  .ant-input-group {
    display: flex !important;

    .ant-btn-icon-only {
      padding-left: 8px;
      padding-right: 8px;
    }
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
