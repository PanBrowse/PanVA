<script lang="ts">
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import {
  Button,
  Col,
  Modal,
  Row,
  Space,
  Table,
  type TableColumnsType,
  TypographyLink,
} from 'ant-design-vue'
import { cloneDeep, flattenDeep } from 'lodash'
import { mapState, mapWritableState } from 'pinia'
import { h } from 'vue'

import MetadataFilters, {
  type MetadataFiltersExpose,
} from '@/components/MetadataFilters.vue'
import MetadataValue from '@/components/MetadataValue.vue'
import {
  metadataBooleanCompare,
  metadataCategoricalArrayCompare,
  metadataQuantitativeCompare,
  naturalCompare,
  numberCompare,
} from '@/helpers/sorting'
import { useConfigStore } from '@/stores/config'
import { useHomologyStore } from '@/stores/homology'
import type {
  ConfigMetadata,
  Homology,
  MetadataBoolean,
  MetadataCategorical,
  MetadataFilter,
  MetadataQuantitative,
} from '@/types'

const getSorter =
  ({ column, type }: ConfigMetadata) =>
  (a: Homology, b: Homology) => {
    if (type === 'quantitative') {
      return metadataQuantitativeCompare(
        a.metadata[column] as MetadataQuantitative,
        b.metadata[column] as MetadataQuantitative
      )
    }
    if (type === 'boolean') {
      return metadataBooleanCompare(
        a.metadata[column] as MetadataBoolean,
        b.metadata[column] as MetadataBoolean
      )
    }
    return metadataCategoricalArrayCompare(
      a.metadata[column] as MetadataCategorical,
      b.metadata[column] as MetadataCategorical
    )
  }

export default {
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['close', 'select'],
  data() {
    return {
      isDirty: false,
      filters: [] as MetadataFilter[],
    }
  },
  components: {
    AButton: Button,
    ACol: Col,
    AModal: Modal,
    ARow: Row,
    ASpace: Space,
    ATable: Table,
    MetadataFilters,
    DeleteOutlined,
    PlusOutlined,
  },
  computed: {
    ...mapState(useHomologyStore, [
      'homologyId',
      'homologies',
      'homologiesFiltered',
    ]),
    ...mapWritableState(useHomologyStore, ['homologyFilters']),
    homologyMetadata() {
      const config = useConfigStore()
      return config.homology.homologyMetadata
    },
    tableColumns(): TableColumnsType {
      const columns: TableColumnsType = [
        {
          title: 'Homology id',
          dataIndex: 'id',
          key: 'id',
          fixed: true,
          sorter: (a: Homology, b: Homology) => naturalCompare(a.id, b.id),
          customRender: ({ record, text }) =>
            h(
              TypographyLink,
              { onClick: () => this.$emit('select', record.id) },
              { default: () => text }
            ),
        },
        {
          title: 'Members',
          dataIndex: 'members',
          key: 'members',
          sorter: (a: Homology, b: Homology) =>
            numberCompare(a.members, b.members),
        },
        {
          title: 'Alignment length',
          dataIndex: 'alignment_length',
          key: 'alignment_length',
          sorter: (a: Homology, b: Homology) =>
            numberCompare(a.alignment_length, b.alignment_length),
        },
      ]

      this.homologyMetadata.forEach((metadata) => {
        const { label, column } = metadata
        columns.push({
          title: label,
          key: column,
          sorter: getSorter(metadata),
          dataIndex: ['metadata', column],
          customRender: ({ record }) =>
            h(MetadataValue, { metadata, value: record.metadata[column] }),
        })
      })

      return columns
    },
    columnLookup(): Record<string, ConfigMetadata> {
      return Object.fromEntries(
        this.homologyMetadata.map((metadata) => [metadata.column, metadata])
      )
    },
  },
  methods: {
    optionsForColumn(column: string): string[] {
      return flattenDeep(
        this.homologies.map(({ metadata }) => {
          const value = metadata[column] as
            | MetadataCategorical
            | MetadataCategorical[]
          if (Array.isArray(value)) {
            return value
          }
          return [value]
        })
      )
    },
    onClose() {
      this.$emit('close')
    },
    onFiltersChange() {
      this.isDirty = true
    },
    clearFilters() {
      this.homologyFilters = []
      this.filters = []
      this.isDirty = false
    },
    onFiltersApply() {
      const { validate } = this.$refs.filters as MetadataFiltersExpose
      validate().then(() => {
        this.homologyFilters = cloneDeep(this.filters)
        this.isDirty = false
      })
    },
    showTotal(total: number, range: [number, number]) {
      return `${range[0]} - ${range[1]} of ${total} items`
    },
    rowClassName(homology: Homology) {
      if (homology.id === this.homologyId) {
        return 'ant-table-row-selected'
      }
    },
  },
  watch: {
    visible() {
      if (this.visible) {
        this.filters = cloneDeep(this.homologyFilters)
      }
    },
  },
}
</script>

<template>
  <AModal
    title="Homology groups"
    :width="960"
    :visible="visible"
    :footer="null"
    @cancel="onClose"
    class="homology-select"
  >
    <MetadataFilters
      ref="filters"
      :metadata="homologyMetadata"
      :optionsForColumn="optionsForColumn"
      v-model="filters"
      @update:modelValue="onFiltersChange"
    >
      <template #empty="{ addFilter }">
        <ARow justify="space-between">
          <ACol>
            <div style="line-height: 32px">
              Add filters to search within the homology groups.
            </div>
          </ACol>
          <ACol>
            <ASpace>
              <AButton @click="addFilter">
                <template #icon><PlusOutlined /></template>
                Add filter
              </AButton>
              <AButton
                :disabled="!isDirty"
                @click="onFiltersApply"
                :type="isDirty ? 'primary' : 'default'"
              >
                Apply filters
              </AButton>
            </ASpace>
          </ACol>
        </ARow>
      </template>

      <template #footer="{ addFilter }">
        <ARow justify="end" style="margin-top: 16px">
          <ACol>
            <ASpace>
              <AButton @click="clearFilters">
                <template #icon><DeleteOutlined /></template>
                Clear filters
              </AButton>
              <AButton @click="addFilter">
                <template #icon><PlusOutlined /></template>
                Add filter
              </AButton>
              <AButton
                :disabled="!isDirty"
                @click="onFiltersApply"
                :type="isDirty ? 'primary' : 'default'"
              >
                Apply filters
              </AButton>
            </ASpace>
          </ACol>
        </ARow>
      </template>
    </MetadataFilters>

    <ATable
      :columns="tableColumns"
      :rowClassName="rowClassName"
      :pagination="{ showSizeChanger: true, showTotal }"
      :dataSource="homologiesFiltered"
      :scroll="{ x: true, scrollToFirstRowOnChange: true }"
      rowKey="id"
    />
  </AModal>
</template>

<style lang="scss">
.homology-select {
  .ant-table-wrapper {
    margin-top: 16px;

    th {
      vertical-align: top;
    }
  }

  .ant-pagination {
    margin-bottom: 0 !important;
  }
}
</style>
