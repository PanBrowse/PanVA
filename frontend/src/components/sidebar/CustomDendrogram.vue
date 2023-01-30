<script lang="ts">
import { useDataStore } from '@/stores/data'
import { mapActions, mapState, mapWritableState } from 'pinia'
import SidebarItem from '@/components/common/SidebarItem.vue'
import { difference, intersection, isEqual, range, sortBy, union } from 'lodash'

export default {
  components: {
    SidebarItem,
  },
  data: function () {
    return {
      isFetchingCustomDendro: false,
    }
  },
  computed: {
    ...mapState(useDataStore, [
      'dendroCustom',
      'dendroCustomForSelectedPositions',
      'geneLength',
      'selectedRegion',
      'selectedRegionLength',
      'transitionTime',
    ]),
    ...mapWritableState(useDataStore, ['tree', 'selectedPositions']),
    isRegionChecked(): boolean {
      return this.selectedInsideRangeCount === this.selectedRegionLength
    },
    isRegionIndeterminate(): boolean {
      return this.selectedInsideRangeCount !== 0 && !this.isRegionChecked
    },
    isDatasetChecked(): boolean {
      return this.selectedCount === this.geneLength
    },
    isDatasetIndeterminate(): boolean {
      return this.selectedCount !== 0 && !this.isDatasetChecked
    },
    selectedRegionRange(): number[] {
      const [start, end] = this.selectedRegion
      return range(start, end + 1)
    },
    selectedCount() {
      return this.selectedPositions.length
    },
    selectedInsideRangeCount() {
      return intersection(this.selectedPositions, this.selectedRegionRange)
        .length
    },
    selectedOutsideRangeCount() {
      return this.selectedCount - this.selectedInsideRangeCount
    },
    customDendroButtonDisabled() {
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
    onCheckRegion() {
      if (this.isRegionChecked) {
        this.selectedPositions = difference(
          this.selectedPositions,
          this.selectedRegionRange
        )
      } else {
        this.selectedPositions = union(
          this.selectedPositions,
          this.selectedRegionRange
        )
      }
    },
    onCheckDataset() {
      if (this.isDatasetChecked) {
        this.selectedPositions = []
      } else {
        this.selectedPositions = range(1, this.geneLength + 1)
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
      <span v-if="selectedCount === 1 && selectedOutsideRangeCount === 0">
        There is 1 position selected in the current region.
      </span>
      <span v-if="selectedCount === 1 && selectedOutsideRangeCount !== 0">
        There is 1 position selected outside the current region.
      </span>
      <span v-if="selectedCount > 1 && selectedOutsideRangeCount === 0">
        There are {{ selectedCount }} positions selected in the current region.
      </span>
      <span v-if="selectedCount > 1 && selectedOutsideRangeCount !== 0">
        There are {{ selectedCount }} positions selected;
        {{ selectedInsideRangeCount }} inside and
        {{ selectedOutsideRangeCount }} outside the current region.
      </span>
    </p>

    <a-form class="dendro-options">
      <a-form-item>
        <a-checkbox
          v-model:checked="isRegionChecked"
          :indeterminate="isRegionIndeterminate"
          @change="onCheckRegion"
        >
          Select all in region {{ selectedRegion[0] }} - {{ selectedRegion[1] }}
        </a-checkbox>
      </a-form-item>
      <a-form-item>
        <a-checkbox
          v-model:checked="isDatasetChecked"
          :indeterminate="isDatasetIndeterminate"
          @change="onCheckDataset"
        >
          Select all in dataset
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
