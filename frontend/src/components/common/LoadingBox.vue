<script lang="ts">
import { Loading3QuartersOutlined } from '@ant-design/icons-vue'

export default {
  props: {
    height: Number,
  },
  components: {
    Loading3QuartersOutlined,
  },
}
</script>

<template>
  <div class="loading-box" :style="{ height: height ? height + 'px' : 'auto' }">
    <Loading3QuartersOutlined spin />
  </div>
</template>

<style lang="scss">
@import '@/assets/colors.module.scss';

.loading-box {
  display: flex;
  align-items: center;
  justify-content: center;

  .anticon-loading-3-quarters {
    font-size: 40px;
    color: $gray-8;
  }
}
</style>
