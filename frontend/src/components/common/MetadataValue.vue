<script lang="ts">
import BooleanIndicator from '@/components/common/BooleanIndicator.vue'
import type { PropType } from 'vue'
import type { ConfigMetadata, MetadataValue } from '@/types'
import { formatNumber } from '@/helpers/number'
import { DEFAULT_METADATA_BOOLEAN_LABELS } from '@/constants'

export default {
  props: {
    value: {
      type: null as unknown as PropType<MetadataValue>,
      required: true,
    },
    metadata: {
      type: null as unknown as PropType<ConfigMetadata>,
      required: true,
    },
  },
  components: {
    BooleanIndicator,
  },
  computed: {
    formatNumber() {
      return formatNumber
    },
    booleanLabels() {
      if (this.metadata.type === 'boolean') {
        return this.metadata.labels || DEFAULT_METADATA_BOOLEAN_LABELS
      }
      return DEFAULT_METADATA_BOOLEAN_LABELS
    },
  },
}
</script>

<template>
  <span v-if="metadata.type === 'boolean'">
    <BooleanIndicator :value="value as any" />
  </span>
  <span v-else-if="metadata.type === 'quantitative'">
    {{ formatNumber(value as any, metadata.decimals, metadata.suffix) }}
  </span>
  <span v-else>
    {{ value }}
  </span>
</template>
