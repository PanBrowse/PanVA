<script lang="ts">
import { DEFAULT_TITLE } from '@/constants'
import { useConfigStore } from '@/stores/config'
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue'
import { mapState } from 'pinia'

import {
  Button,
  Card,
  Layout,
  LayoutContent,
  LayoutSider,
} from 'ant-design-vue'

export default {
  slots: ['sidebar'],
  components: {
    AButton: Button,
    ACard: Card,
    ALayout: Layout,
    ALayoutContent: LayoutContent,
    ALayoutSider: LayoutSider,
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
  <ALayout hasSider>
    <ALayoutContent>
      <AButton
        :type="collapsed ? 'primary' : 'default'"
        class="collapse-trigger"
        shape="circle"
        @click="() => (collapsed = !collapsed)"
      >
        <template #icon>
          <MenuFoldOutlined v-if="collapsed" />
          <MenuUnfoldOutlined v-else />
        </template>
      </AButton>

      <slot></slot>
    </ALayoutContent>

    <ALayoutSider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :collapsedWidth="0"
      :width="380"
    >
      <ACard
        :title="title || defaultTitle"
        :bordered="false"
        style="min-height: 100%"
        :bodyStyle="{ padding: 0 }"
      >
        <slot name="sidebar"></slot>
      </ACard>
    </ALayoutSider>
  </ALayout>
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
