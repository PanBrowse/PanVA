<script lang="ts">
import { CheckboxGroup, type CheckboxOptionType } from 'ant-design-vue'
import type { CheckboxChangeEvent } from 'ant-design-vue/lib/checkbox/interface'
import { difference, union } from 'lodash'
import { mapState, mapWritableState } from 'pinia'

import { CELL_SIZE } from '@/constants'
import { arrayRange } from '@/helpers/arrayRange'
import { useHomologyStore } from '@/stores/homology'

export default {
  components: {
    ACheckboxGroup: CheckboxGroup,
  },
  data() {
    return {
      lastPosition: null as number | null,
      lastChecked: null as boolean | null,
      /**
       * We use a proxy for the checkbox-group v-model, because we would lose
       * the selection outside the current range when a checkbox is changed.
       * We change `selectedPositions` manually in `onCheckboxChange`, and
       * the watcher on `selectedPositions` overwrites the value of the proxy.
       * Because this happens right after the checkbox-group v-model:update
       * event is emitted, we don't lose any data.
       */
      selectionProxy: [] as number[],
    }
  },
  computed: {
    ...mapState(useHomologyStore, [
      'filteredPositions',
      'filteredPositionsCount',
    ]),
    ...mapWritableState(useHomologyStore, ['selectedPositions']),
    options(): CheckboxOptionType[] {
      return this.filteredPositions.map((position) => ({
        value: position,
        onChange: this.onCheckboxChange,
      }))
    },
    width(): number {
      return this.filteredPositionsCount * CELL_SIZE
    },
  },
  methods: {
    onCheckboxChange(event: CheckboxChangeEvent) {
      const { value, checked } = event.target
      const { shiftKey } = event.nativeEvent

      if (shiftKey && this.lastPosition !== null && this.lastChecked !== null) {
        // Previous and current action is that the checkbox is being *checked*.
        // Therefore, we also check everything between the two positions.
        if (checked && this.lastChecked) {
          const start = this.lastPosition
          const end = value

          this.selectedPositions = union(
            this.selectedPositions,
            arrayRange(start, end)
          )
        }
        // Previous and current action is that the checkbox is being *unchecked*.
        // Therefore, we also uncheck everything between the two positions.
        else if (!checked && !this.lastChecked) {
          const start = this.lastPosition
          const end = value

          this.selectedPositions = difference(
            this.selectedPositions,
            arrayRange(start, end)
          )
        }
      } else {
        if (checked) {
          this.selectedPositions = union(this.selectedPositions, [value])
        } else {
          this.selectedPositions = difference(this.selectedPositions, [value])
        }
      }

      this.lastPosition = value
      this.lastChecked = checked
    },
  },
  watch: {
    selectedPositions(value) {
      this.selectionProxy = value
    },
  },
}
</script>

<template>
  <div class="selection-wrapper" :style="{ width: width + 'px' }">
    <ACheckboxGroup v-model:value="selectionProxy" :options="options" />
  </div>
</template>

<style lang="scss">
.selection-wrapper {
  line-height: 10px;

  .ant-checkbox-group {
    line-height: 10px;
    white-space: nowrap;
  }

  .ant-checkbox-group-item {
    overflow: hidden;
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
