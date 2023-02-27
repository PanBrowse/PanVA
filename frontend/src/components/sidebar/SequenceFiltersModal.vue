<script lang="ts">
import { mapWritableState, mapState } from 'pinia'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'

import {
  Button,
  Col,
  Empty,
  Form,
  FormItem,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
} from 'ant-design-vue'
import { useDataStore } from '@/stores/data'
import { useConfigStore } from '@/stores/config'
import { cloneDeep, map, sortBy } from 'lodash'
import type {
  ConfigMetadata,
  MetadataCategorical,
  SequenceFilter,
} from '@/types'
import { DEFAULT_METADATA_BOOLEAN_LABELS } from '@/constants'
import type { FormExpose } from 'ant-design-vue/lib/form/Form'

type Option<T = string> = {
  value: T
  label?: string
}

export default {
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['close'],
  data() {
    return {
      values: {
        filters: [] as SequenceFilter[],
      },
    }
  },
  components: {
    AButton: Button,
    ACol: Col,
    AEmpty: Empty,
    AForm: Form,
    AFormItem: FormItem,
    AInput: Input,
    AInputNumber: InputNumber,
    AModal: Modal,
    ARow: Row,
    ASelect: Select,
    ASpace: Space,
    DeleteOutlined,
    PlusOutlined,
  },
  computed: {
    ...mapState(useDataStore, ['metadata', 'metadataConfigLookup']),
    ...mapWritableState(useDataStore, ['sequenceFilters']),
    ...mapState(useConfigStore, { configMetadata: 'metadata' }),
    columnOptions() {
      return sortBy(
        this.configMetadata.map(({ column, label }) => ({
          value: column,
          label,
        })),
        'label'
      )
    },
  },
  methods: {
    valuesForColumn(column?: string): Option[] {
      if (!column) return []

      const metadata = this.metadataConfigLookup[column]

      if (metadata.type === 'categorical') {
        const uniqueValues = new Set(
          this.metadata.map(
            ({ [column]: value }) => value as MetadataCategorical
          )
        )
        return sortBy([...uniqueValues]).map((value) => ({ value }))
      }

      if (metadata.type === 'boolean') {
        const labels = metadata.labels || DEFAULT_METADATA_BOOLEAN_LABELS

        return [
          { value: 'true', label: labels.true },
          { value: 'false', label: labels.false },
          { value: 'null', label: labels.null },
        ]
      }

      return []
    },
    operatorsForType(
      type?: ConfigMetadata['type']
    ): Option<SequenceFilter['operator']>[] {
      if (type === 'quantitative') {
        return [
          { value: 'equals', label: 'is equal to' },
          { value: 'greater-than', label: 'is greater than' },
          { value: 'less-than', label: 'is less than' },
          { value: 'between', label: 'is between (inclusive)' },
          { value: 'greater-than-equal', label: 'is equal or greater than' },
          { value: 'less-than-equal', label: 'is equal or less than' },
        ]
      }
      return [
        { value: 'in', label: 'is one of' },
        { value: 'not-in', label: 'is not one of' },
      ]
    },
    addFilter() {
      const column = this.columnOptions[0].value
      const { type } = this.metadataConfigLookup[column]
      const operator = this.operatorsForType(type)[0].value

      this.values.filters.push({
        column,
        type,
        operator,
        values: [],
      })
    },
    deleteFilter(index: number) {
      this.values.filters.splice(index, 1)
    },
    onColumnChange(filter: SequenceFilter) {
      // Lookup type of newly selected column.
      filter.type = this.metadataConfigLookup[filter.column].type
      // Lookup operators of newly selected column.
      const operators = map(this.operatorsForType(filter.type), 'value')

      // Currently selected operator is no longer selectable.
      if (!operators.includes(filter.operator)) {
        filter.operator = operators[0]
      }

      // Clear values because old values are no longer applicable to new column.
      filter.values = []
    },
    onClear() {
      this.sequenceFilters = []
      this.$emit('close')
    },
    onCancel() {
      this.$emit('close')
    },
    onSubmit() {
      const form = this.$refs.form as FormExpose
      form.validate().then(() => {
        this.sequenceFilters = this.values.filters
        this.$emit('close')
      })
    },
  },
  watch: {
    visible() {
      if (this.visible) {
        this.values.filters = cloneDeep(this.sequenceFilters)
      }
    },
  },
}
</script>

<template>
  <AModal
    title="Filter sequences"
    :width="720"
    :visible="visible"
    @cancel="onCancel"
    class="sequence-filters-modal"
  >
    <p>
      Enter one or more filters to reduce the number of displayed sequences.
      Sequences within groups are filtered as well, and groups without any
      remaining sequences after filtering will be hidden.
    </p>
    <AForm ref="form" :model="values">
      <template v-if="values.filters.length !== 0">
        <ARow
          type="flex"
          justify="space-between"
          :gutter="4"
          style="margin-bottom: 8px"
          :wrap="false"
          v-for="(filter, index) in values.filters"
          v-bind:key="index"
        >
          <ACol flex="1 0 auto">
            <AFormItem
              :name="['filters', index, 'column']"
              :rules="{ required: true, message: 'Required field.' }"
            >
              <ASelect
                v-model:value="filter.column"
                :options="columnOptions"
                placeholder="Select a column"
                @change="onColumnChange(filter)"
                showSearch
              />
            </AFormItem>
          </ACol>
          <ACol flex="0 0 200px">
            <AFormItem
              :name="['filters', index, 'operator']"
              :rules="{ required: true, message: 'Required field.' }"
            >
              <ASelect
                v-model:value="filter.operator"
                :options="operatorsForType(filter.type)"
                :dropdownMatchSelectWidth="false"
              />
            </AFormItem>
          </ACol>
          <ACol flex="0 0 220px">
            <template v-if="filter.type === 'quantitative'">
              <ASpace
                v-if="filter.operator === 'between'"
                align="start"
                :size="0"
              >
                <AFormItem
                  :name="['filters', index, 'values', 0]"
                  :rules="{
                    required: true,
                    message: 'Required field.',
                  }"
                >
                  <AInputNumber
                    v-model:value="filter.values[0]"
                    placeholder="Minimum"
                    decimalSeparator="."
                  />
                </AFormItem>
                <AInput
                  style="
                    width: 22px;
                    padding: 4px 5px;
                    border-left: 0;
                    border-right: 0;
                    pointer-events: none;
                    text-align: center;
                  "
                  placeholder="-"
                  disabled
                />
                <AFormItem
                  :name="['filters', index, 'values', 1]"
                  :rules="{
                    required: true,
                    message: 'Required field.',
                  }"
                >
                  <AInputNumber
                    v-model:value="filter.values[1]"
                    placeholder="Maximum"
                    decimalSeparator="."
                  />
                </AFormItem>
              </ASpace>
              <AFormItem
                v-else
                :name="['filters', index, 'values', 0]"
                :rules="{ required: true, message: 'Required field.' }"
              >
                <AInputNumber
                  v-model:value="filter.values[0]"
                  placeholder="Enter a number"
                  decimalSeparator="."
                />
              </AFormItem>
            </template>
            <AFormItem
              v-else
              :name="['filters', index, 'values']"
              :rules="{ required: true, message: 'Required field.' }"
            >
              <ASelect
                v-model:value="filter.values"
                :options="valuesForColumn(filter.column)"
                mode="multiple"
                :dropdownMatchSelectWidth="false"
                showSearch
              />
            </AFormItem>
          </ACol>
          <ACol flex="0 0 auto">
            <AButton type="text" @click="deleteFilter(index)">
              <template #icon><DeleteOutlined /></template>
            </AButton>
          </ACol>
        </ARow>

        <ARow justify="end" style="margin-top: 16px">
          <ACol>
            <AButton @click="addFilter">
              <template #icon><PlusOutlined /></template>
              Add another filter
            </AButton>
          </ACol>
        </ARow>
      </template>

      <AEmpty description="No sequence filters have been added yet." v-else>
        <AButton @click="addFilter">
          <template #icon><PlusOutlined /></template>
          Add a first filter
        </AButton>
      </AEmpty>
    </AForm>

    <template #footer>
      <ARow justify="space-between">
        <ACol>
          <AButton @click="onClear" :disabled="values.filters.length === 0">
            <template #icon><DeleteOutlined /></template>
            Clear filters
          </AButton>
        </ACol>

        <ACol>
          <AButton @click="onCancel">Cancel</AButton>
          <AButton type="primary" @click="onSubmit">Save changes</AButton>
        </ACol>
      </ARow>
    </template>
  </AModal>
</template>

<style lang="scss" scoped>
@import '@/assets/colors.module.scss';

.sequence-filters-modal {
  .ant-form-item {
    margin-bottom: 0;
  }

  .ant-select {
    width: 100%;
  }

  .ant-input-number {
    width: 100%;
  }
}
</style>
