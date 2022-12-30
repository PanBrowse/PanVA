<script lang="ts">
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { phenoColumns } from '@dataset'
import { naturalSort } from '@/helpers/sorting'

type SortOption = {
  value: string
  label: string
}

export default {
  computed: {
    ...mapState(useDataStore, ['mrnaIds', 'selectedRegion', 'sorting']),
    ...mapWritableState(useDataStore, ['referenceMrnaId']),
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
        { value: 'dendro', label: 'Dendrogram' },
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
  },
  methods: {
    ...mapActions(useDataStore, ['changeSorting']),
    changeSort(value: string) {
      if (value === 'dendro') {
        this.changeSorting({
          field: 'dendro',
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
  <div class="locus-options">
    <a-form
      layout="horizontal"
      :labelCol="{ span: 4 }"
      :wrapperCol="{ span: 8 }"
      hideRequiredMark
    >
      <!-- <a-form-item :colon="false">
        <template #label>
          <close-circle-outlined />
        </template> -->
      <a-form-item label="Reference">
        <a-select
          show-search
          :dropdownMatchSelectWidth="false"
          v-model:value="referenceMrnaId"
          size="small"
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

      <a-form-item label="Sorting">
        <a-select
          :dropdownMatchSelectWidth="false"
          size="small"
          v-model:value="sortValue"
          @change="changeSort"
        >
          <a-select-option
            v-for="option in sortOptions"
            :value="option.value"
            v-bind:key="option.value"
          >
            {{ option.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </div>
</template>

<style lang="scss">
.locus-options {
  .ant-form-item {
    margin-bottom: 0;
  }

  padding-bottom: 10px;
}
</style>
