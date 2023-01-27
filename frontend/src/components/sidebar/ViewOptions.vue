<script lang="ts">
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { naturalSort } from '@/helpers/sorting'
import { CELL_THEMES } from '@/config'
import { phenoColumns } from '@dataset'

import SidebarItem from '@/components/common/SidebarItem.vue'

type SortOption = {
  value: string
  label: string
  disabled?: boolean
}

export default {
  components: {
    SidebarItem,
  },
  computed: {
    ...mapState(useDataStore, [
      'dendroCustom',
      'mrnaIds',
      'selectedRegion',
      'sorting',
    ]),
    ...mapWritableState(useDataStore, [
      'cellTheme',
      'dendro',
      'transitionsEnabled',
      'referenceMrnaId',
    ]),
    referenceMrnaIdOptions(): string[] {
      return naturalSort(this.mrnaIds)
    },
    sortValue(): string {
      if (this.sorting.field === 'pheno') {
        return this.sorting.pheno
      }
      return this.sorting.field
    },
    sortOptions(): SortOption[] {
      // Determine number for position sorting.
      const [start] = this.selectedRegion
      const sortPosition =
        this.sorting.field === 'position' ? this.sorting.position : start

      const options = [
        { value: 'dendroDefault', label: 'Dendrogram' },
        {
          value: 'dendroCustom',
          label: 'Custom dendrogram',
          disabled: !this.dendroCustom,
        },
        { value: 'mrnaId', label: 'mRNA id' },
        { value: 'position', label: `Nucleotide (pos ${sortPosition})` },
      ]

      phenoColumns.forEach(({ field, label }) => {
        options.push({
          value: field,
          label,
        })
      })

      return options
    },
    cellThemeOptions() {
      return CELL_THEMES
    },
  },
  methods: {
    ...mapActions(useDataStore, ['changeSorting']),
    changeSort(value: string) {
      if (value === 'dendroDefault') {
        this.changeSorting({
          field: 'dendroDefault',
        })
      } else if (value === 'dendroCustom') {
        this.changeSorting({
          field: 'dendroCustom',
        })
      } else if (value === 'position') {
        // Sort by first position in selected region.
        const [start] = this.selectedRegion
        this.changeSorting({
          field: 'position',
          position: start,
        })
      } else {
        this.changeSorting({
          field: 'pheno',
          pheno: value,
        })
      }
    },
  },
}
</script>

<template>
  <SidebarItem title="View options">
    <a-form
      layout="horizontal"
      :labelCol="{ span: 8 }"
      :wrapperCol="{ span: 16 }"
      class="view-options"
    >
      <a-form-item label="Sorting">
        <a-select
          :dropdownMatchSelectWidth="false"
          v-model:value="sortValue"
          @change="changeSort"
        >
          <a-select-option
            v-for="option in sortOptions"
            :value="option.value"
            :disabled="option.disabled"
            v-bind:key="option.value"
          >
            {{ option.label }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Tree">
        <a-select :dropdownMatchSelectWidth="false" v-model:value="dendro">
          <a-select-option value="default">Dendrogram</a-select-option>
          <a-select-option value="custom" :disabled="!dendroCustom">
            Custom dendrogram
          </a-select-option>
          <a-select-option value="coreSnp" disabled>CoreSNP</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Reference">
        <a-select
          show-search
          :dropdownMatchSelectWidth="false"
          v-model:value="referenceMrnaId"
          placeholder="None"
          allowClear
        >
          <a-select-option
            v-for="id in referenceMrnaIdOptions"
            :value="id"
            v-bind:key="id"
          >
            {{ id }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Color scheme">
        <a-select v-model:value="cellTheme" :dropdownMatchSelectWidth="false">
          <a-select-option
            v-for="(theme, id) in cellThemeOptions"
            :value="id"
            v-bind:key="id"
          >
            {{ theme.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item
        label="Transitions"
        extra="Disable for improved performance on slower computers."
      >
        <a-switch size="small" v-model:checked="transitionsEnabled" />
      </a-form-item>
    </a-form>
  </SidebarItem>
</template>

<style lang="scss">
.view-options {
  .ant-form-item {
    margin-bottom: 8px;
  }
}
</style>
