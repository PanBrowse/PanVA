<script lang="ts">
import { CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'

export default {
  components: {
    CloseCircleOutlined,
    CheckCircleOutlined,
  },
  props: {
    value: Boolean,
  },
}
</script>

<template>
  <div class="container">
    <CheckCircleOutlined v-if="value" />
    <CloseCircleOutlined v-else />
    <slot></slot>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
  gap: 6px;
}
.anticon-check-circle {
  color: #237804;
}
.anticon-close-circle {
  color: #a8071a;
}
</style>
