<script lang="ts">
import { DEFAULT_TITLE } from '@/constants'
import { useConfigStore } from '@/stores/config'
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue'
import { mapState } from 'pinia'

export default {
  slots: ['sidebar'],
  components: {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
  },
  data() {
    return {
      collapsed: false,
      defaultTitle: DEFAULT_TITLE,
    }
  },
  computed: {
    ...mapState(useConfigStore, ['title']),
  },
}
</script>

<template>
  <a-layout hasSider>
    <a-layout-content>
      <a-button
        :type="collapsed ? 'primary' : 'default'"
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
      <a-card
        :title="title || defaultTitle"
        :bordered="false"
        style="min-height: 100%"
        :bodyStyle="{ padding: 0 }"
      >
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
  padding: 16px;
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
  top: 12px;
  right: 12px;
  z-index: 200;
}
</style>
