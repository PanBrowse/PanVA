<!-- eslint-disable vue/no-unused-components -->
<script lang="ts">
import BooleanIndicator from '@/components/common/BooleanIndicator.vue'
import MetadataValue from '@/components/common/MetadataValue.vue'
import VRuntimeTemplate from 'vue3-runtime-template'

import { List, DescriptionsItem, Descriptions, ListItem } from 'ant-design-vue'

export default {
  props: ['data', 'template'],
  components: {
    ADescriptions: Descriptions,
    ADescriptionsItem: DescriptionsItem,
    AList: List,
    AListItem: ListItem,
    BooleanIndicator,
    MetadataValue,
    VRuntimeTemplate,
  },
  data() {
    return this.data
  },
}
</script>

<template>
  <VRuntimeTemplate :template="template"></VRuntimeTemplate>
</template>
