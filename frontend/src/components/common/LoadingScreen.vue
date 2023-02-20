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
  <div class="loading-screen">
    <Loading3QuartersOutlined spin />
    <div class="loading-screen__text">
      The application is loading, please wait...
    </div>
  </div>
</template>

<style lang="scss">
@import '@/assets/colors.module.scss';

.loading-screen {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;

  color: $gray-8;

  .anticon-loading-3-quarters {
    font-size: 40px;
    color: var(--ant-primary-color);
  }
}
</style>
