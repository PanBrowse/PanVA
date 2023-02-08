<script lang="ts">
import { useDataStore } from '@/stores/data'
import { mapActions, mapState, mapWritableState } from 'pinia'
import SidebarItem from '@/components/common/SidebarItem.vue'
import { difference, intersection, isEqual, range, sortBy, union } from 'lodash'
import { Form, FormItem, Checkbox, Button } from 'ant-design-vue'

export default {
  components: {
    AButton: Button,
    ACheckbox: Checkbox,
    AForm: Form,
    AFormItem: FormItem,
    SidebarItem,
  },
  data() {
    return {
      isFetchingCustomDendro: false,
    }
  },
  computed: {
    ...mapState(useDataStore, [
      'alignedPositions',
      'dendroCustom',
      'dendroCustomForSelectedPositions',
      'filteredPositions',
      'filteredPositionsCount',
      'filterPositions',
      'geneLength',
      'positionFilter',
      'positionRegion',
      'transitionTime',
    ]),
    ...mapWritableState(useDataStore, ['tree', 'selectedPositions']),
    positionsLabel(): string {
      if (this.positionFilter !== 'all') return 'filtered positions'
      return 'positions'
    },
    // Same as filteredPositions, but for the entire gene.
    allFilteredPositions(): number[] {
      const positions = range(1, this.geneLength + 1)
      return this.filterPositions(positions)
    },
    // Same as filteredPositionsCount, but for the entire gene.
    allFilteredPositionsCount(): number {
      return this.allFilteredPositions.length
    },
    selectedCount(): number {
      return this.selectedPositions.length
    },
    selectedInRegion(): number[] {
      return intersection(this.selectedPositions, this.filteredPositions)
    },
    selectedInDataset(): number[] {
      return intersection(this.selectedPositions, this.allFilteredPositions)
    },
    isRegionChecked(): boolean {
      return this.selectedInRegion.length === this.filteredPositionsCount
    },
    isRegionIndeterminate(): boolean {
      return this.selectedInRegion.length !== 0 && !this.isRegionChecked
    },
    isDatasetChecked(): boolean {
      return this.selectedInDataset.length === this.allFilteredPositionsCount
    },
    isDatasetIndeterminate(): boolean {
      return this.selectedInDataset.length !== 0 && !this.isDatasetChecked
    },
    customDendroButtonDisabled(): boolean {
      return (
        // Already fetching a custom dendro.
        this.isFetchingCustomDendro ||
        // No selection, nothing to fetch.
        this.selectedCount === 0 ||
        // The
        isEqual(
          sortBy(this.selectedPositions),
          sortBy(this.dendroCustomForSelectedPositions)
        )
      )
    },
  },
  methods: {
    ...mapActions(useDataStore, ['changeSorting', 'fetchDendrogramCustom']),
    clearSelection() {
      this.selectedPositions = []
    },
    onCheckRegion() {
      if (this.isRegionChecked) {
        this.selectedPositions = difference(
          this.selectedPositions,
          this.filteredPositions
        )
      } else {
        this.selectedPositions = union(
          this.selectedPositions,
          this.filteredPositions
        )
      }
    },
    onCheckDataset() {
      if (this.isDatasetChecked) {
        this.selectedPositions = difference(
          this.selectedPositions,
          this.allFilteredPositions
        )
      } else {
        this.selectedPositions = union(
          this.selectedPositions,
          this.allFilteredPositions
        )
      }
    },
    async updateCustomDendro() {
      try {
        this.isFetchingCustomDendro = true
        await this.fetchDendrogramCustom()

        // Automatically switch to the custom dendrogram.
        this.tree = 'dendroCustom'
        this.changeSorting({ name: 'dendroCustom' })
      } finally {
        this.isFetchingCustomDendro = false
      }
    },
  },
}
</script>

<template>
  <SidebarItem title="Custom dendrogram">
    <p>
      <span v-if="selectedCount === 0">There are no positions selected.</span>
      <span v-if="selectedCount === 1"> There is 1 position selected</span>
      <span v-if="selectedCount > 1">
        There are {{ selectedCount }} positions selected
      </span>
      <span v-if="selectedCount !== 0">
        &ndash;
        <a @click="clearSelection">Clear selection</a>
      </span>
    </p>

    <AForm class="dendro-options">
      <AFormItem>
        <ACheckbox
          v-model:checked="isRegionChecked"
          :indeterminate="isRegionIndeterminate"
          @change="onCheckRegion"
        >
          Select all {{ filteredPositionsCount }} {{ positionsLabel }} in
          {{ positionRegion[0] }} -
          {{ positionRegion[1] }}
        </ACheckbox>
      </AFormItem>
      <AFormItem>
        <ACheckbox
          v-model:checked="isDatasetChecked"
          :indeterminate="isDatasetIndeterminate"
          @change="onCheckDataset"
        >
          Select all {{ allFilteredPositionsCount }} {{ positionsLabel }} in
          dataset
        </ACheckbox>
      </AFormItem>

      <AFormItem>
        <AButton
          :disabled="customDendroButtonDisabled"
          :loading="isFetchingCustomDendro"
          @click="updateCustomDendro"
        >
          <span v-if="dendroCustom">Update custom dendrogram</span>
          <span v-else>Generate custom dendrogram</span>
        </AButton>
      </AFormItem>
    </AForm>
  </SidebarItem>
</template>

<style lang="scss">
.dendro-options {
  .ant-form-item {
    margin-bottom: 8px;
  }

  .ant-form-item-control-input {
    min-height: auto;
  }
}
</style>
