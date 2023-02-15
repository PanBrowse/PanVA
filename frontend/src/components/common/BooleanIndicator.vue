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

<style lang="scss" scoped>
@import '@/assets/colors.module.scss';

.container {
  display: flex;
  align-items: center;
  gap: 6px;
}
.anticon-check-circle {
  color: $success;
}
.anticon-close-circle {
  color: $danger;
}
</style>
