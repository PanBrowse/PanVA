<script lang="ts">
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { naturalSort } from '@/helpers/sorting'
import { CELL_THEMES } from '@/constants'

import SidebarItem from '@/components/common/SidebarItem.vue'
import { useConfigStore } from '@/stores/config'

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
    SidebarItem,
  },
  computed: {
    ...mapState(useConfigStore, ['phenoColumns']),
    ...mapState(useDataStore, [
      'dendroCustom',
      'mrnaIds',
      'selectedRegion',
      'sorting',
    ]),
    ...mapWritableState(useDataStore, [
      'cellTheme',
      'referenceMrnaId',
      'transitionsEnabled',
      'tree',
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
            { value: 'coreSnp', label: 'CoreSNP', isDisabled: true },
          ],
        },
        { value: 'mrnaId', label: 'mRNA id' },
        { value: 'position', label: `Nucleotide (pos ${sortPosition})` },
      ]

      const phenoSortOptions: SortOption[] = this.phenoColumns.map(
        ({ field, label }) => ({
          value: field,
          label,
        })
      )

      if (phenoSortOptions.length) {
        options.push({
          value: 'phenotypes',
          label: 'Phenotypes',
          options: phenoSortOptions,
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
          <template v-for="option in sortOptions" v-bind:key="option.value">
            <a-select-opt-group :label="option.label" v-if="option.options">
              <a-select-option
                v-for="suboption in option.options"
                :value="suboption.value"
                :disabled="suboption.isDisabled"
                v-bind:key="suboption.value"
              >
                {{ suboption.label }}
              </a-select-option>
            </a-select-opt-group>
            <a-select-option
              v-else
              :value="option.value"
              :disabled="option.isDisabled"
            >
              {{ option.label }}
            </a-select-option>
          </template>
        </a-select>
      </a-form-item>

      <a-form-item label="Tree">
        <a-select :dropdownMatchSelectWidth="false" v-model:value="tree">
          <a-select-option value="dendroDefault">Dendrogram</a-select-option>
          <a-select-option value="dendroCustom" :disabled="!dendroCustom">
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
