<script lang="ts">
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import {
  Button,
  Col,
  Empty,
  Form,
  FormItem,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
} from 'ant-design-vue'
import type { FormExpose } from 'ant-design-vue/lib/form/Form'
import type { DefaultOptionType } from 'ant-design-vue/lib/select'
import { set, sortBy } from 'lodash'
import type { PropType } from 'vue'

import { DEFAULT_METADATA_BOOLEAN_LABELS } from '@/constants'
import { arraySplice } from '@/helpers/arraySplice'
import type { ConfigMetadata, MetadataFilter } from '@/types'

type OptionsForColumn = (column: string) => string[]

export type MetadataFiltersExpose = Pick<FormExpose, 'validate'>

export default {
  props: {
    modelValue: {
      type: Array as PropType<Array<MetadataFilter>>,
      required: true,
    },
    metadata: {
      type: Array as PropType<Array<ConfigMetadata>>,
      required: true,
    },
    optionsForColumn: {
      type: Function as PropType<OptionsForColumn>,
      required: true,
    },
  },
  components: {
    AButton: Button,
    ACol: Col,
    ARow: Row,
    AEmpty: Empty,
    AForm: Form,
    AFormItem: FormItem,
    AInput: Input,
    AInputNumber: InputNumber,
    ASelect: Select,
    ASpace: Space,
    DeleteOutlined,
    PlusOutlined,
  },
  slots: ['footer', 'empty'],
  emits: ['update:modelValue'],
  expose: ['validate'],
  data() {
    return {
      valueOptionsCache: {} as Record<string, DefaultOptionType[]>,
    }
  },
  computed: {
    columnOptions() {
      return sortBy(
        this.metadata.map(({ column, label }) => ({
          value: column,
          label,
        })),
        'label'
      )
    },
    columnLookup(): Record<string, ConfigMetadata> {
      return Object.fromEntries(
        this.metadata.map((metadata) => [metadata.column, metadata])
      )
    },
  },
  methods: {
    valueOptions(column: string): DefaultOptionType[] {
      const metadata = this.columnLookup[column]

      if (metadata.type === 'boolean') {
        const labels = metadata.labels || DEFAULT_METADATA_BOOLEAN_LABELS

        return [
          { value: 'true', label: labels.true },
          { value: 'false', label: labels.false },
          { value: 'null', label: labels.null },
        ]
      }

      if (metadata.type === 'quantitative') return []

      // Categorical remains, but calculating options might take time
      // so we cache the options and return it when available.
      if (column in this.valueOptionsCache)
        return this.valueOptionsCache[column]

      const values: string[] = this.optionsForColumn(column)
      const options = sortBy([...new Set(values)]).map<DefaultOptionType>(
        (value) => ({ value })
      )

      this.valueOptionsCache[column] = options
      return options
    },
    operatorsForType(
      type: ConfigMetadata['type']
    ): MetadataFilter['operator'][] {
      if (type === 'quantitative') {
        return [
          'equals',
          'greater-than',
          'less-than',
          'between',
          'greater-than-equal',
          'less-than-equal',
        ]
      }
      return ['in', 'not-in']
    },
    operatorOptionsForType(type: ConfigMetadata['type']): DefaultOptionType[] {
      const labels = {
        equals: 'is equal to',
        'greater-than': 'is greater than',
        'less-than': 'is less than',
        between: 'is between (inclusive)',
        'greater-than-equal': 'is equal or greater than',
        'less-than-equal': 'is equal or less than',
        in: 'is one of',
        'not-in': 'is not one of',
      }

      return this.operatorsForType(type).map((operator) => ({
        value: operator,
        label: labels[operator],
      }))
    },
    addFilter() {
      const column = this.columnOptions[0].value
      const { type } = this.columnLookup[column]
      const operator = this.operatorsForType(type)[0]

      const filter: MetadataFilter = {
        column,
        type,
        operator,
        values: [],
      }

      this.$emit('update:modelValue', this.modelValue.concat(filter))
    },
    deleteFilter(index: number) {
      this.$emit('update:modelValue', arraySplice(this.modelValue, index, 1))
    },
    onColumnChange(index: number, value: any) {
      const modelValue = set(this.modelValue, [index, 'column'], value)
      const filter = modelValue[index]

      // Update type of newly selected column.
      filter.type = this.columnLookup[filter.column].type

      // Lookup operators of newly selected column.
      const operators = this.operatorsForType(filter.type)

      // Currently selected operator is no longer selectable.
      if (!operators.includes(filter.operator)) {
        filter.operator = operators[0]
      }

      // Clear values because old values are no longer applicable to new column.
      filter.values = []

      this.$emit('update:modelValue', modelValue)
    },
    onOperatorChange(index: number, value: any) {
      this.$emit(
        'update:modelValue',
        set(this.modelValue, [index, 'operator'], value)
      )
    },
    onValuesChange(index: number, values: any) {
      this.$emit(
        'update:modelValue',
        set(this.modelValue, [index, 'values'], values)
      )
    },
    validate() {
      const form = this.$refs.form as FormExpose
      return form.validate()
    },
  },
}
</script>

<template>
  <AForm ref="form" :model="modelValue" class="metadata-filters">
    <template v-if="modelValue.length !== 0">
      <ARow
        type="flex"
        justify="space-between"
        :gutter="4"
        style="margin-bottom: 8px"
        :wrap="false"
        v-for="(filter, index) in modelValue"
        v-bind:key="index"
      >
        <ACol flex="1 0 auto">
          <AFormItem
            :name="[index, 'column']"
            :rules="{ required: true, message: 'Required field.' }"
          >
            <ASelect
              :value="filter.column"
              :options="columnOptions"
              placeholder="Select a column"
              @change="(value) => onColumnChange(index, value)"
              showSearch
            />
          </AFormItem>
        </ACol>
        <ACol flex="0 0 200px">
          <AFormItem
            :name="[index, 'operator']"
            :rules="{ required: true, message: 'Required field.' }"
          >
            <ASelect
              :value="filter.operator"
              :options="operatorOptionsForType(filter.type)"
              :dropdownMatchSelectWidth="false"
              @change="(value) => onOperatorChange(index, value)"
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
                :name="[index, 'values', 0]"
                :rules="{
                  required: true,
                  message: 'Required field.',
                }"
              >
                <AInputNumber
                  :value="filter.values[0]"
                  placeholder="Minimum"
                  decimalSeparator="."
                  @change="
                    (value) => onValuesChange(index, [value, filter.values[1]])
                  "
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
                :name="[index, 'values', 1]"
                :rules="{
                  required: true,
                  message: 'Required field.',
                }"
              >
                <AInputNumber
                  :value="filter.values[1]"
                  placeholder="Maximum"
                  decimalSeparator="."
                  @change="
                    (value) => onValuesChange(index, [filter.values[0], value])
                  "
                />
              </AFormItem>
            </ASpace>
            <AFormItem
              v-else
              :name="[index, 'values', 0]"
              :rules="{ required: true, message: 'Required field.' }"
            >
              <AInputNumber
                :value="filter.values[0]"
                placeholder="Enter a number"
                decimalSeparator="."
                @change="(value) => onValuesChange(index, [value])"
              />
            </AFormItem>
          </template>
          <AFormItem
            v-else
            :name="[index, 'values']"
            :rules="{ required: true, message: 'Required field.' }"
          >
            <ASelect
              :value="filter.values"
              :options="valueOptions(filter.column)"
              mode="multiple"
              :dropdownMatchSelectWidth="false"
              @change="(value) => onValuesChange(index, value)"
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

      <slot name="footer" :addFilter="addFilter">
        <ARow justify="end" style="margin-top: 16px">
          <ACol>
            <AButton @click="addFilter">
              <template #icon><PlusOutlined /></template>
              Add another filter
            </AButton>
          </ACol>
        </ARow>
      </slot>
    </template>

    <slot name="empty" :addFilter="addFilter" v-else>
      <AEmpty description="No filters have been added yet.">
        <AButton @click="addFilter">
          <template #icon><PlusOutlined /></template>
          Add a first filter
        </AButton>
      </AEmpty>
    </slot>
  </AForm>
</template>

<style lang="scss" scoped>
.metadata-filters {
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
