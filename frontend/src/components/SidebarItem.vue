<script lang="ts">
import { Collapse, CollapsePanel } from 'ant-design-vue'

export default {
  components: {
    ACollapse: Collapse,
    ACollapsePanel: CollapsePanel,
  },
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
  <ACollapse
    :activeKey="activeKey"
    expandIconPosition="right"
    :ghost="true"
    class="sidebar-item"
    @change="toggleExpanded"
  >
    <ACollapsePanel key="1" :header="title" class="sidebar-item-content">
      <slot></slot>
    </ACollapsePanel>
  </ACollapse>
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
