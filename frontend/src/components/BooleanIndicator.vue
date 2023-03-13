<script lang="ts">
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons-vue'
import type { PropType } from 'vue'

export default {
  components: {
    CloseCircleOutlined,
    CheckCircleOutlined,
    QuestionCircleOutlined,
  },
  props: {
    value: {
      type: null as unknown as PropType<boolean | null>,
      required: true,
    },
  },
}
</script>

<template>
  <div class="container">
    <CheckCircleOutlined v-if="value === true" />
    <CloseCircleOutlined v-else-if="value === false" />
    <QuestionCircleOutlined v-else />
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
.anticon-question-circle {
  color: $gray-7;
}
</style>
