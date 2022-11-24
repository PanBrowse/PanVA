<script lang="ts">
import { Loading3QuartersOutlined } from '@ant-design/icons-vue'

export default {
  name: 'LoadingBox',
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
    <loading3-quarters-outlined spin />
  </div>
</template>

<style lang="scss">
.loading-box {
  display: flex;
  align-items: center;
  justify-content: center;

  .anticon-loading-3-quarters {
    font-size: 40px;
    color: #40a9ff;
  }
}
</style>
