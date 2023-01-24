<script lang="ts">
import { CELL_SIZE } from '@/config'
import { useDataStore } from '@/stores/data'
import { difference, range, union } from 'lodash'
import { mapState, mapWritableState } from 'pinia'
import type { CheckboxOptionType } from 'ant-design-vue'
import type { CheckboxChangeEvent } from 'ant-design-vue/lib/checkbox/interface'
import { arrayRange } from '@/helpers/arrayRange'

export default {
  data: function () {
    return {
      lastPosition: null as number | null,
      lastChecked: null as boolean | null,
    }
  },
  computed: {
    ...mapState(useDataStore, [
      'selectedRegion',
      'selectedRegionLength',
      'transitionTime',
    ]),
    ...mapWritableState(useDataStore, ['selectedPositions']),
    isAllChecked(): boolean {
      return (
        this.selectedPositions.length !== 0 &&
        this.selectedPositions.length === this.selectedRegionLength
      )
    },
    isIndeterminate(): boolean {
      return this.selectedPositions.length !== 0 && !this.isAllChecked
    },
    regionRange(): number[] {
      const [start, end] = this.selectedRegion
      return range(start, end + 1)
    },
    options(): CheckboxOptionType[] {
      return this.regionRange.map((position) => ({
        value: position,
        onChange: this.onCheckboxChange,
      }))
    },
    width(): number {
      return this.selectedRegionLength * CELL_SIZE
    },
  },
  methods: {
    onCheckAll() {
      const [start, end] = this.selectedRegion
      this.selectedPositions = this.isAllChecked ? [] : range(start, end + 1)
    },
    onCheckboxChange(event: CheckboxChangeEvent) {
      const { value, checked } = event.target
      const { shiftKey } = event.nativeEvent

      if (shiftKey && this.lastPosition !== null && this.lastChecked !== null) {
        // Previous and current action is that the checkbox is being *checked*.
        // Therefore, we also check everything between the two positions.
        if (checked && this.lastChecked) {
          const start = this.lastPosition
          const end = value

          this.$nextTick(() => {
            this.selectedPositions = union(
              this.selectedPositions,
              arrayRange(start, end)
            )
          })
        }
        // Previous and current action is that the checkbox is being *unchecked*.
        // Therefore, we also uncheck everything between the two positions.
        else if (!checked && !this.lastChecked) {
          const start = this.lastPosition
          const end = value

          this.$nextTick(() => {
            this.selectedPositions = difference(
              this.selectedPositions,
              arrayRange(start, end)
            )
          })
        }
      }

      this.lastPosition = value
      this.lastChecked = checked
    },
  },
}
</script>

<template>
  <div
    class="selection-wrapper"
    :style="{
      width: width + 'px',
      transitionDuration: transitionTime + 'ms',
    }"
  >
    <!--
    <a-checkbox
      v-model:checked="isAllChecked"
      :indeterminate="isIndeterminate"
      @change="onCheckAll"
    >
      select all
    </a-checkbox>
    -->

    <a-checkbox-group v-model:value="selectedPositions" :options="options" />
  </div>
</template>

<style lang="scss">
.selection-wrapper {
  line-height: 10px;
  transition-property: width;
  transition-timing-function: linear;

  .ant-checkbox-group {
    line-height: 10px;
    white-space: nowrap;
  }

  .ant-checkbox-group-item {
    white-space: nowrap;
    padding: 0;
    margin: 0;
    align-items: flex-start;
  }

  .ant-checkbox {
    top: 0;
    padding: 1px;
  }

  .ant-checkbox-inner {
    width: 8px;
    height: 8px;
  }

  .ant-checkbox-inner::after {
    width: 4px;
    height: 4px;
  }
}
</style>
