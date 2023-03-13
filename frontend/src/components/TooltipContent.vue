<!-- eslint-disable vue/no-unused-components -->
<script lang="ts">
import { Descriptions, DescriptionsItem, List, ListItem } from 'ant-design-vue'
import VRuntimeTemplate from 'vue3-runtime-template'

import BooleanIndicator from './BooleanIndicator.vue'
import MetadataValue from './MetadataValue.vue'

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
