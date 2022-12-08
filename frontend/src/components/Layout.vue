<script lang="ts">
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue'
import { title } from '@dataset'

export default {
  slots: ['sidebar'],
  components: {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
  },
  data() {
    return {
      collapsed: false,
      title,
    }
  },
}
</script>

<template>
  <a-layout hasSider>
    <a-layout-content>
      <a-button
        type="text"
        class="collapse-trigger"
        shape="circle"
        @click="() => (collapsed = !collapsed)"
      >
        <template #icon>
          <MenuFoldOutlined v-if="collapsed" />
          <MenuUnfoldOutlined v-else />
        </template>
      </a-button>

      <slot></slot>
    </a-layout-content>

    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :collapsedWidth="0"
      :width="360"
    >
      <a-card :title="title" :bordered="false" style="min-height: 100%">
        <slot name="sidebar"></slot>
      </a-card>
    </a-layout-sider>
  </a-layout>
</template>

<style scoped>
.ant-layout {
  height: 100vh;
}

.ant-layout-content {
  background: none;
  position: relative;
  padding: 16px;
  padding-top: 58px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ant-layout-sider {
  background: none;
  overflow-y: auto;
}

.collapse-trigger {
  position: absolute;
  top: 14px;
  right: 14px;
}
</style>
