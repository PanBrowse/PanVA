<script lang="ts">
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    isDefaultCollapsed: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      isExpanded: !this.isDefaultCollapsed,
    }
  },
  computed: {
    activeKey() {
      if (this.isExpanded) return 1
      return 2
    },
  },
  methods: {
    toggleExpanded() {
      this.isExpanded = !this.isExpanded
    },
  },
}
</script>

<template>
  <a-collapse
    v-model:activeKey="activeKey"
    expandIconPosition="right"
    :ghost="true"
    class="sidebar-item"
    @change="toggleExpanded"
  >
    <a-collapse-panel key="1" :header="title" class="sidebar-item-content">
      <slot></slot>
    </a-collapse-panel>
  </a-collapse>
</template>

<style lang="scss">
.sidebar-item + .sidebar-item {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.sidebar-item-content .ant-collapse-header {
  font-size: 15px;
  font-weight: 500;
}
</style>
