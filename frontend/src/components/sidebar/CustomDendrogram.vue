<script lang="ts">
import { useDataStore } from '@/stores/data'
import { mapActions, mapState, mapWritableState } from 'pinia'
import SidebarItem from '@/components/common/SidebarItem.vue'
import { difference, intersection, isEqual, range, sortBy, union } from 'lodash'
import type { FilterPosition } from '@/types'

export default {
  components: {
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
      'geneLength',
      'positionRegion',
      'filterPositions',
      'filteredPositions',
      'filteredPositionsCount',
      'transitionTime',
    ]),
    ...mapWritableState(useDataStore, ['tree', 'selectedPositions']),
    positionsLabel(): string {
      if (this.filterPositions === 'variable') return 'variable positions'
      if (this.filterPositions === 'informative') return 'informative positions'
      if (this.filterPositions === 'pheno_specific')
        return 'phenotype specific positions'
      return 'positions'
    },
    // Same as filteredPositions, but for the entire gene.
    allFilteredPositions(): number[] {
      const positions = range(1, this.geneLength + 1)
      if (this.filterPositions !== 'all') {
        const field = this.filterPositions as Exclude<FilterPosition, 'all'>
        return positions.filter((pos) => this.alignedPositions[pos - 1][field])
      }

      return positions
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
        this.changeSorting({ field: 'dendroCustom' })
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

    <a-form class="dendro-options">
      <a-form-item>
        <a-checkbox
          v-model:checked="isRegionChecked"
          :indeterminate="isRegionIndeterminate"
          @change="onCheckRegion"
        >
          Select all {{ filteredPositionsCount }} {{ positionsLabel }} in
          {{ positionRegion[0] }} -
          {{ positionRegion[1] }}
        </a-checkbox>
      </a-form-item>
      <a-form-item>
        <a-checkbox
          v-model:checked="isDatasetChecked"
          :indeterminate="isDatasetIndeterminate"
          @change="onCheckDataset"
        >
          Select all {{ allFilteredPositionsCount }} {{ positionsLabel }} in
          dataset
        </a-checkbox>
      </a-form-item>

      <a-form-item>
        <a-button
          :disabled="customDendroButtonDisabled"
          :loading="isFetchingCustomDendro"
          @click="updateCustomDendro"
        >
          <span v-if="dendroCustom">Update custom dendrogram</span>
          <span v-else>Generate custom dendrogram</span>
        </a-button>
      </a-form-item>
    </a-form>
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
