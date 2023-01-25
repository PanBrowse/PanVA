<!-- eslint-disable vue/no-unused-components -->
<script lang="ts">
import BooleanIndicator from '@/components/common/BooleanIndicator.vue'
import VRuntimeTemplate from 'vue3-runtime-template'

export default {
  props: ['data', 'template'],
  components: {
    BooleanIndicator,
    VRuntimeTemplate,
  },
  data() {
    return this.data
  },
}
</script>

<template>
  <v-runtime-template :template="template"></v-runtime-template>
</template>
