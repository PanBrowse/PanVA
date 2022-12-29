<script lang="ts">
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { sortBy } from 'lodash'
import { phenoColumns } from '@dataset'

export default {
  computed: {
    ...mapState(useDataStore, ['mrnaIds', 'selectedRegion', 'sortBy']),
    ...mapWritableState(useDataStore, ['referenceMrnaId']),
    referenceMrnaIdOptions() {
      return sortBy(this.mrnaIds)
    },
    sortValue() {
      if (this.sortBy.field === 'pheno') {
        return this.sortBy.payload
      }
      return this.sortBy.field
    },
    sortOptions() {
      // Determine number for position sorting.
      const [start] = this.selectedRegion
      const sortPosition =
        this.sortBy.field === 'position' ? this.sortBy.payload : start

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
    ...mapActions(useDataStore, ['changeSortBy']),
    changeSort(value: string) {
      if (value === 'dendro') {
        this.changeSortBy({
          field: 'dendro',
        })
      } else if (value === 'position') {
        // Sort by first position in selected region.
        const [start] = this.selectedRegion
        this.changeSortBy({
          field: 'position',
          payload: start,
        })
      } else {
        // Look up phenoColumn to validate value, and to lookup default `desc` value.
        const column = phenoColumns.find(({ field }) => field === value)
        if (column) {
          this.changeSortBy({
            field: 'pheno',
            payload: column.field,
            desc: column.sortDesc,
          })
        }
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
