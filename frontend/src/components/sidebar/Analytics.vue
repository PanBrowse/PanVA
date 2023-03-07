<script lang="ts">
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { naturalSort } from '@/helpers/sorting'
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
  Tooltip,
} from 'ant-design-vue'
import { map, sortBy } from 'lodash'
import type { DefaultOptionType } from 'ant-design-vue/lib/select'

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
      'dendroCustom',
      'filteredPositions',
      'groups',
      'mrnaIds',
      'mrnaIdsLookup',
      'reference',
      'sorting',
      'trees',
    ]),
    ...mapWritableState(useDataStore, [
      'annotationMrnaId',
      'keepSequenceFilters',
      'positionFilter',
      'reference',
      'selectedTree',
      'sequenceFilters',
      'visibleSequenceMetadataColumns',
    ]),
    annotationValue(): string | undefined {
      return this.annotationMrnaId || undefined
    },
    config() {
      const config = useConfigStore()
      return config
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
      if (this.sorting.name === 'tree') {
        return `tree:${this.sorting.tree}`
      }
      return this.sorting.name
    },
    defaultSortPosition(): number {
      return this.filteredPositions[0] || 1
    },
    sortOptions(): DefaultOptionType[] {
      const sortPosition =
        this.sorting.name === 'position'
          ? this.sorting.position
          : this.defaultSortPosition

      const options: DefaultOptionType[] = [
        {
          value: 'tree',
          label: 'Tree',
          options: this.treeOptions.map(({ value, ...rest }) => ({
            value: `tree:${value}`,
            ...rest,
          })),
        },
        { value: 'mrnaId', label: 'mRNA id' },
        { value: 'position', label: `Nucleotide (pos ${sortPosition})` },
      ]

      if (this.metadataOptions.length !== 0) {
        options.push({
          value: 'metadata',
          label: 'Metadata',
          options: this.metadataOptions.map(({ value, ...rest }) => ({
            value: `metadata:${value}`,
            ...rest,
          })),
        })
      }

      return options
    },
    metadataOptions(): DefaultOptionType[] {
      return sortBy(
        this.config.sequenceMetadata.map(({ column, label }) => ({
          value: column,
          label,
        })),
        'label'
      )
    },
    treeOptions(): DefaultOptionType[] {
      const options: DefaultOptionType[] = [
        { value: 'dendroDefault', label: 'Dendrogram' },
        {
          value: 'dendroCustom',
          label: 'Custom dendrogram',
          disabled: !this.dendroCustom,
        },
      ]

      // Add loaded additional trees.
      const additional: DefaultOptionType[] = []
      this.trees.forEach(({ name, label }) => {
        additional.push({ value: name, label })
      })

      // Keep `All` and `Variable` on top, but sort the rest alphabetically.
      options.push(...sortBy(additional, 'label'))

      return options
    },
    filterPositionOptions(): DefaultOptionType[] {
      const options: DefaultOptionType[] = [
        { value: 'all', label: 'All' },
        { value: 'variable', label: 'Variable' },
      ]

      // Add configured metadata.
      const additional: DefaultOptionType[] = []
      this.config.variableMetadata.forEach(({ column, label, type }) => {
        if (type === 'boolean') {
          additional.push({ value: column, label })
        }
      })

      // Keep `All` and `Variable` on top, but sort the rest alphabetically.
      options.push(...sortBy(additional, 'label'))

      return options
    },
    annotationOptions(): DefaultOptionType[] {
      return naturalSort(map(this.annotations, 'mRNA_id')).map((mrnaId) => ({
        value: mrnaId,
        label: mrnaId,
      }))
    },
    sequenceFiltersValue(): string | undefined {
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
      } else if (value.startsWith('tree:')) {
        const tree = value.split(':')[1]

        this.changeSorting({
          name: 'tree',
          tree,
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
  <SidebarItem title="Analytics">
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
            :value="sequenceFiltersValue"
            placeholder="None"
            @click="editSequenceFilters"
            @mousedown="(event) => event.preventDefault()"
          >
            <template #suffix>
              <EditOutlined />
            </template>
          </AInput>
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
          :value="sortValue"
          @change="onSortChange"
        >
          <template v-for="option in sortOptions" v-bind:key="option.value">
            <ASelectOptGroup :label="option.label" v-if="option.options">
              <ASelectOption
                v-for="suboption in option.options"
                :value="suboption.value"
                :disabled="suboption.disabled"
                v-bind:key="suboption.value"
              >
                {{ suboption.label }}
              </ASelectOption>
            </ASelectOptGroup>
            <ASelectOption
              v-else
              :value="option.value"
              :disabled="option.disabled"
            >
              {{ option.label }}
            </ASelectOption>
          </template>
        </ASelect>
      </AFormItem>

      <AFormItem label="Tree">
        <ASelect
          :dropdownMatchSelectWidth="false"
          v-model:value="selectedTree"
          :options="treeOptions"
        />
      </AFormItem>

      <AFormItem label="Metadata">
        <ASelect
          placeholder="None"
          v-model:value="visibleSequenceMetadataColumns"
          mode="multiple"
          :options="metadataOptions"
          :dropdownMatchSelectWidth="false"
          showSearch
        />
      </AFormItem>

      <AFormItem label="Reference">
        <ASelect
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

      <AFormItem label="Annotation ref" v-if="config.annotations.length !== 0">
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

    .ant-input-affix-wrapper {
      cursor: text;
    }

    .ant-btn-icon-only {
      padding-left: 8px;
      padding-right: 8px;
    }

    .ant-input-suffix {
      color: rgba(0, 0, 0, 0.25);
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
