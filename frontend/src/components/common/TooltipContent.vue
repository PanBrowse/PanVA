<!-- eslint-disable vue/no-unused-components -->
<script lang="ts">
import BooleanIndicator from '@/components/common/BooleanIndicator.vue'
import VRuntimeTemplate from 'vue3-runtime-template'

import { DescriptionsItem, Descriptions } from 'ant-design-vue'

export default {
  props: ['data', 'template'],
  components: {
    ADescriptionsItem: DescriptionsItem,
    ADescriptions: Descriptions,
    BooleanIndicator,
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
