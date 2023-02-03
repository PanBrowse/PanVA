<script lang="ts">
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { naturalSort } from '@/helpers/sorting'
import { CELL_THEMES } from '@/constants'

import SidebarItem from '@/components/common/SidebarItem.vue'
import { useConfigStore } from '@/stores/config'

import { groupName } from '@/helpers/groupName'
import type { mRNAid, Reference } from '@/types'

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
      'filterPositions',
      'reference',
      'transitionsEnabled',
      'tree',
    ]),
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
      if (this.sorting.field === 'pheno') {
        return this.sorting.pheno
      }
      return this.sorting.field
    },
    defaultSortPosition(): number {
      return this.filteredPositions[0] || 1
    },
    sortOptions(): SortOption[] {
      const sortPosition =
        this.sorting.field === 'position'
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
    groupName,
    onReferenceChange(value?: string) {
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
    onSortChange(value: string) {
      const common = ['dendroDefault', 'dendroCustom', 'coreSNP', 'mrnaId']
      if (common.includes(value)) {
        this.changeSorting({
          field: value as any,
        })
      } else if (value === 'position') {
        this.changeSorting({
          field: 'position',
          position: this.defaultSortPosition,
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
      <a-form-item label="Filter positions">
        <a-select
          :dropdownMatchSelectWidth="false"
          v-model:value="filterPositions"
        >
          <a-select-option value="all">All</a-select-option>
          <a-select-option value="variable">Variable</a-select-option>
          <a-select-option value="informative">Informative</a-select-option>
          <a-select-option value="pheno_specific">
            Phenotype specific
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Sorting">
        <a-select
          :dropdownMatchSelectWidth="false"
          v-model:value="sortValue"
          @change="onSortChange"
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
          <a-select-option value="coreSNP">CoreSNP</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Reference">
        <a-select
          show-search
          :dropdownMatchSelectWidth="false"
          v-model:value="referenceValue"
          @change="onReferenceChange"
          placeholder="None"
          allowClear
        >
          <a-select-opt-group label="Groups" v-if="groups.length !== 0">
            <a-select-option
              v-for="group in groups"
              :value="`group:${group.id}`"
              v-bind:key="group.id"
            >
              {{ groupName(group) }}
            </a-select-option>
          </a-select-opt-group>

          <a-select-option
            v-for="[mrnaId, dataIndex] in referenceMrnaIdOptions"
            :value="`data:${dataIndex}`"
            v-bind:key="dataIndex"
          >
            {{ mrnaId }}
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
